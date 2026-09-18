import { useState, useEffect, useCallback } from 'react';
import { PushNotificationService, type PushPermissionState } from '../services/pushNotificationService';

export function usePushNotifications(uid: string | null) {
  const [permissionState, setPermissionState] = useState<PushPermissionState>('default');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(PushNotificationService.isSupported());
    setPermissionState(PushNotificationService.getPermissionState());
  }, []);

  // Listen for foreground messages and show a toast (in-app)
  useEffect(() => {
    const unsub = PushNotificationService.onForegroundMessage((payload) => {
      // Foreground messages are handled by the notification center via Firestore real-time listener.
      // We avoid showing a duplicate browser notification here since Firestore already updates the UI.
      console.log('[FCM Foreground]', payload);
    });
    return () => unsub();
  }, []);

  const enablePush = useCallback(async () => {
    if (!uid || isRegistering) return false;
    setIsRegistering(true);
    try {
      const success = await PushNotificationService.requestPermissionAndRegister(uid);
      setPermissionState(PushNotificationService.getPermissionState());
      return success;
    } finally {
      setIsRegistering(false);
    }
  }, [uid, isRegistering]);

  const disablePush = useCallback(async () => {
    if (!uid) return;
    await PushNotificationService.unregisterToken(uid);
  }, [uid]);

  return {
    permissionState,
    isSupported,
    isRegistering,
    enablePush,
    disablePush,
  };
}
