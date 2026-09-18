import React from 'react';
import type { NotificationCategory } from '../../types/notifications';
import { NOTIFICATION_CATEGORY_LABELS, NOTIFICATION_CATEGORY_ICONS } from '../../types/notifications';
import { NotificationItem } from './NotificationItem';
import type { AppNotification } from '../../types/notifications';

const CATEGORIES: Array<NotificationCategory | 'ALL'> = [
  'ALL', 'JOBS', 'APPLICATIONS', 'INTERVIEWS', 'MESSAGES', 'TEAMS', 'PROJECTS', 'ACCOUNT',
];

interface Props {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  activeCategory: NotificationCategory | 'ALL';
  onCategoryChange: (cat: NotificationCategory | 'ALL') => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
}

export const NotificationList: React.FC<Props> = ({
  notifications, unreadCount, loading,
  activeCategory, onCategoryChange,
  onMarkRead, onMarkAllRead, onDelete,
}) => {
  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 1.25rem', borderBottom: '2px solid #eee',
        position: 'sticky', top: 0, background: 'white', zIndex: 10,
      }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
          Notifications {unreadCount > 0 && (
            <span style={{
              background: '#1565c0', color: 'white',
              borderRadius: 12, fontSize: '0.75rem',
              padding: '2px 8px', marginLeft: 8,
            }}>
              {unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            style={{
              background: 'none', border: '1px solid #1565c0',
              color: '#1565c0', borderRadius: 6, padding: '0.35rem 0.75rem',
              cursor: 'pointer', fontSize: '0.82rem',
            }}
            aria-label="Mark all notifications as read"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div style={{
        display: 'flex', overflowX: 'auto', gap: '0.25rem',
        padding: '0.5rem 1rem', borderBottom: '1px solid #eee',
        scrollbarWidth: 'none',
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            aria-pressed={activeCategory === cat}
            style={{
              whiteSpace: 'nowrap',
              padding: '0.35rem 0.75rem',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: activeCategory === cat ? 700 : 400,
              background: activeCategory === cat ? '#1565c0' : '#f5f5f5',
              color: activeCategory === cat ? 'white' : '#444',
              transition: 'all 0.15s',
            }}
          >
            {cat === 'ALL' ? 'All' : `${NOTIFICATION_CATEGORY_ICONS[cat]} ${NOTIFICATION_CATEGORY_LABELS[cat]}`}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#bbb' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔔</div>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>All caught up!</div>
          <div style={{ fontSize: '0.85rem' }}>
            {activeCategory === 'ALL'
              ? "You don't have any notifications yet."
              : `No ${NOTIFICATION_CATEGORY_LABELS[activeCategory as NotificationCategory]} notifications.`}
          </div>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }} role="list">
          {notifications.map(n => (
            <li key={n.id} role="listitem">
              <NotificationItem
                notification={n}
                onMarkRead={onMarkRead}
                onDelete={onDelete}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
