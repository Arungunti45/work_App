import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  collection, query, onSnapshot, getDocs,
  doc, getDoc, orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { BlockedUser } from '../types/safety';

const functions = getFunctions();

export class BlockService {
  /**
   * Block a user via Cloud Function.
   */
  static async blockUser(targetUid: string, reason?: string): Promise<void> {
    const fn = httpsCallable(functions, 'blockUser');
    await fn({ targetUid, reason });
  }

  /**
   * Unblock a user via Cloud Function.
   */
  static async unblockUser(targetUid: string): Promise<void> {
    const fn = httpsCallable(functions, 'unblockUser');
    await fn({ targetUid });
  }

  /**
   * Check if currentUser has blocked targetUser or vice-versa.
   * Client-side check (for UI gating only — server enforces authoritatively).
   */
  static async isBlocked(myUid: string, targetUid: string): Promise<boolean> {
    const [myBlock, theirBlock] = await Promise.all([
      getDoc(doc(db, 'users', myUid, 'blockedUsers', targetUid)),
      getDoc(doc(db, 'users', targetUid, 'blockedUsers', myUid)),
    ]);
    return myBlock.exists() || theirBlock.exists();
  }

  /**
   * Get all users blocked by current user as a one-time fetch.
   */
  static async getBlockedUsers(uid: string): Promise<BlockedUser[]> {
    const q = query(
      collection(db, 'users', uid, 'blockedUsers'),
      orderBy('blockedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      blockedUserId: d.id,
      blockedAt: d.data().blockedAt?.toDate?.()?.toISOString() ?? '',
      reason: d.data().reason ?? undefined,
    }));
  }

  /**
   * Subscribe to the current user's block list in realtime.
   * Returns unsubscribe function.
   */
  static subscribeToBlockedUsers(
    uid: string,
    callback: (users: BlockedUser[]) => void
  ): () => void {
    const q = query(
      collection(db, 'users', uid, 'blockedUsers'),
      orderBy('blockedAt', 'desc')
    );
    return onSnapshot(q, snap => {
      const users = snap.docs.map(d => ({
        blockedUserId: d.id,
        blockedAt: d.data().blockedAt?.toDate?.()?.toISOString() ?? '',
        reason: d.data().reason ?? undefined,
      }));
      callback(users);
    });
  }
}
