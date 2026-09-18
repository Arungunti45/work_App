import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { NotificationPreferences } from '../types/notifications';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../types/notifications';

const PREFS_PATH = (uid: string) =>
  doc(db, 'users', uid, 'notificationPreferences', 'settings');

export class NotificationPreferenceService {
  static async getPreferences(uid: string): Promise<NotificationPreferences> {
    const snap = await getDoc(PREFS_PATH(uid));
    if (!snap.exists()) return { ...DEFAULT_NOTIFICATION_PREFERENCES };
    return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...snap.data() } as NotificationPreferences;
  }

  static async savePreferences(uid: string, prefs: NotificationPreferences): Promise<void> {
    // Enforce account notifications always on
    const safe: NotificationPreferences = {
      ...prefs,
      account: { inApp: true, browserPush: true, email: false },
    };
    await setDoc(PREFS_PATH(uid), safe, { merge: true });
  }
}
