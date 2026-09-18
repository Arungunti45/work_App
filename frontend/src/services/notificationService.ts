import {
  collection, query, orderBy, limit, startAfter,
  onSnapshot, doc, updateDoc, deleteDoc,
  where, getDocs, writeBatch, serverTimestamp,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { AppNotification } from '../types/notifications';

const PAGE_SIZE = 20;

export class NotificationService {

  /**
   * Subscribe to real-time notifications for a user.
   * Returns the unsubscribe function — MUST be called on unmount.
   */
  static subscribeToNotifications(
    uid: string,
    callback: (notifications: AppNotification[]) => void
  ): () => void {
    const q = query(
      collection(db, 'users', uid, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE)
    );
    return onSnapshot(q, snap => {
      const notifications = snap.docs.map(d => ({
        ...d.data(),
        id: d.id,
        createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      })) as AppNotification[];
      callback(notifications);
    });
  }

  /**
   * Subscribe to real-time unread count only.
   */
  static subscribeToUnreadCount(
    uid: string,
    callback: (count: number) => void
  ): () => void {
    const q = query(
      collection(db, 'users', uid, 'notifications'),
      where('isRead', '==', false)
    );
    return onSnapshot(q, snap => {
      callback(snap.size);
    });
  }

  /**
   * Load more (older) notifications for pagination.
   */
  static async loadMoreNotifications(
    uid: string,
    lastDoc: QueryDocumentSnapshot
  ): Promise<AppNotification[]> {
    const q = query(
      collection(db, 'users', uid, 'notifications'),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(PAGE_SIZE)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      ...d.data(),
      id: d.id,
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    })) as AppNotification[];
  }

  /**
   * Mark a single notification as read.
   */
  static async markAsRead(uid: string, notificationId: string): Promise<void> {
    const ref = doc(db, 'users', uid, 'notifications', notificationId);
    await updateDoc(ref, {
      isRead: true,
      readAt: serverTimestamp(),
    });
  }

  /**
   * Mark ALL unread notifications as read for a user.
   */
  static async markAllAsRead(uid: string): Promise<void> {
    const q = query(
      collection(db, 'users', uid, 'notifications'),
      where('isRead', '==', false),
      limit(500)
    );
    const snap = await getDocs(q);
    if (snap.empty) return;

    const batch = writeBatch(db);
    snap.docs.forEach(d => {
      batch.update(d.ref, { isRead: true, readAt: serverTimestamp() });
    });
    await batch.commit();
  }

  /**
   * Delete a notification from the user's inbox.
   */
  static async deleteNotification(uid: string, notificationId: string): Promise<void> {
    const ref = doc(db, 'users', uid, 'notifications', notificationId);
    await deleteDoc(ref);
  }
}
