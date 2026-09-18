import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { collection, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { app as firebaseApp, db } from '../config/firebase';

// VAPID key must be set in .env as VITE_FIREBASE_VAPID_KEY
// Get it from Firebase Console → Project Settings → Cloud Messaging → Web push certificates
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

export type PushPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export class PushNotificationService {
  private static messaging = (() => {
    try {
      return getMessaging(firebaseApp);
    } catch {
      return null; // Unsupported browser
    }
  })();

  static isSupported(): boolean {
    return (
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      this.messaging !== null
    );
  }

  static getPermissionState(): PushPermissionState {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission as PushPermissionState;
  }

  /**
   * Request browser notification permission and register FCM token.
   * Only call this after user explicitly clicks "Enable Notifications".
   */
  static async requestPermissionAndRegister(uid: string): Promise<boolean> {
    if (!this.isSupported()) return false;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    return this.registerToken(uid);
  }

  /**
   * Get current FCM token and store it in Firestore.
   */
  static async registerToken(uid: string): Promise<boolean> {
    if (!this.messaging || !VAPID_KEY) {
      console.warn('FCM not configured: missing messaging instance or VAPID key.');
      return false;
    }

    try {
      // Register service worker first
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      const token = await getToken(this.messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (!token) return false;

      // Store token in Firestore — keyed by token value to prevent duplicates
      const tokenRef = doc(collection(db, 'users', uid, 'notificationTokens'), token.slice(0, 32));
      await setDoc(tokenRef, {
        token,
        platform: 'web',
        browser: navigator.userAgent.slice(0, 100),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastUsedAt: serverTimestamp(),
      }, { merge: true });

      return true;
    } catch (err) {
      console.error('FCM token registration failed:', err);
      return false;
    }
  }

  /**
   * Remove the current FCM token on logout.
   */
  static async unregisterToken(uid: string): Promise<void> {
    if (!this.messaging || !VAPID_KEY) return;
    try {
      const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      if (!registration) return;
      const token = await getToken(this.messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });
      if (!token) return;
      const tokenRef = doc(collection(db, 'users', uid, 'notificationTokens'), token.slice(0, 32));
      await deleteDoc(tokenRef);
    } catch (err) {
      console.warn('FCM token unregistration failed (non-fatal):', err);
    }
  }

  /**
   * Listen for foreground FCM messages.
   * Returns unsubscribe function.
   */
  static onForegroundMessage(callback: (payload: any) => void): () => void {
    if (!this.messaging) return () => {};
    return onMessage(this.messaging, callback);
  }
}
