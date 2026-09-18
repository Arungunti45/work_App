import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '../services/notificationService';
import type { AppNotification } from '../types/notifications';
import type { NotificationCategory } from '../types/notifications';

export function useNotifications(uid: string | null) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory | 'ALL'>('ALL');

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = NotificationService.subscribeToNotifications(uid, (notifs) => {
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.isRead).length);
      setLoading(false);
    });

    return () => unsub();
  }, [uid]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!uid) return;
    await NotificationService.markAsRead(uid, notificationId);
  }, [uid]);

  const markAllAsRead = useCallback(async () => {
    if (!uid) return;
    await NotificationService.markAllAsRead(uid);
  }, [uid]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!uid) return;
    await NotificationService.deleteNotification(uid, notificationId);
  }, [uid]);

  const filtered = activeCategory === 'ALL'
    ? notifications
    : notifications.filter(n => n.category === activeCategory);

  return {
    notifications: filtered,
    allNotifications: notifications,
    unreadCount,
    loading,
    activeCategory,
    setActiveCategory,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}

/** Lightweight hook for just the unread badge count — used in nav */
export function useUnreadCount(uid: string | null) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!uid) return;
    const unsub = NotificationService.subscribeToUnreadCount(uid, setCount);
    return () => unsub();
  }, [uid]);

  return count;
}
