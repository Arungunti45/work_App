import React from 'react';
import { Link } from 'react-router-dom';
import { useUnreadCount } from '../../hooks/useNotifications';
import { useAuth } from '../../context/AuthContext';

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const count = useUnreadCount(user?.uid ?? null);

  return (
    <Link
      to="/notifications"
      aria-label={count > 0 ? `Notifications, ${count} unread` : 'Notifications'}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        padding: '0.4rem',
        borderRadius: '50%',
        color: 'inherit',
      }}
    >
      <span style={{ fontSize: '1.4rem' }} aria-hidden="true">🔔</span>
      {count > 0 && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            background: '#d32f2f',
            color: 'white',
            borderRadius: '999px',
            fontSize: '0.65rem',
            fontWeight: 700,
            minWidth: 16,
            height: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 3px',
            lineHeight: 1,
          }}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
};
