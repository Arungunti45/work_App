import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppNotification } from '../../types/notifications';
import { NOTIFICATION_CATEGORY_ICONS } from '../../types/notifications';

interface Props {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: '#d32f2f',
  HIGH:     '#f57c00',
  NORMAL:   '#1565c0',
  LOW:      '#757575',
};

export const NotificationItem: React.FC<Props> = ({ notification, onMarkRead, onDelete }) => {
  const navigate = useNavigate();
  const icon = NOTIFICATION_CATEGORY_ICONS[notification.category] ?? '🔔';
  const priorityColor = PRIORITY_COLORS[notification.priority] ?? PRIORITY_COLORS.NORMAL;

  const handleClick = () => {
    if (!notification.isRead) onMarkRead(notification.id);
    if (notification.route) navigate(notification.route);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        borderBottom: '1px solid #f0f0f0',
        cursor: notification.route ? 'pointer' : 'default',
        background: notification.isRead ? 'white' : '#f0f7ff',
        transition: 'background 0.2s',
        position: 'relative',
      }}
      role="article"
      aria-label={`${notification.isRead ? '' : 'Unread: '}${notification.title}`}
    >
      {/* Unread dot */}
      {!notification.isRead && (
        <div style={{
          position: 'absolute', top: '50%', left: '0.25rem',
          transform: 'translateY(-50%)',
          width: 6, height: 6,
          borderRadius: '50%',
          background: '#1565c0',
        }} aria-hidden="true" />
      )}

      {/* Icon */}
      <div style={{
        fontSize: '1.5rem',
        minWidth: 36,
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: 2,
      }}>
        {icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: notification.isRead ? 400 : 600,
          color: '#1a1a1a',
          fontSize: '0.9rem',
          marginBottom: '0.2rem',
        }}>
          {notification.priority === 'HIGH' || notification.priority === 'CRITICAL' ? (
            <span style={{ color: priorityColor, marginRight: '0.3rem' }}>●</span>
          ) : null}
          {notification.title}
        </div>
        <div style={{ fontSize: '0.82rem', color: '#555', marginBottom: '0.25rem' }}>
          {notification.body}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#999' }}>
          {timeAgo(notification.createdAt)}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
        {!notification.isRead && (
          <button
            onClick={(e) => { e.stopPropagation(); onMarkRead(notification.id); }}
            title="Mark as read"
            aria-label="Mark notification as read"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.7rem', color: '#1565c0', padding: '0.2rem 0.4rem',
              borderRadius: 4, whiteSpace: 'nowrap',
            }}
          >
            ✓ Read
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
          title="Delete notification"
          aria-label="Delete notification"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.7rem', color: '#999', padding: '0.2rem 0.4rem',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};
