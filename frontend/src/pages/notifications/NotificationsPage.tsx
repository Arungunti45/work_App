import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationList } from '../../components/notifications/NotificationList';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    activeCategory,
    setActiveCategory,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(user?.uid ?? null);

  return (
    <div style={{
      maxWidth: 720,
      margin: '0 auto',
      minHeight: '100vh',
      background: 'white',
      boxShadow: '0 0 0 1px #eee',
    }}>
      <NotificationList
        notifications={notifications}
        unreadCount={unreadCount}
        loading={loading}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onMarkRead={markAsRead}
        onMarkAllRead={markAllAsRead}
        onDelete={deleteNotification}
      />
    </div>
  );
};
