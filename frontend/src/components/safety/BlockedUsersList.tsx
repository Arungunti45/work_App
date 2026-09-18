import React, { useState } from 'react';
import type { BlockedUser } from '../../types/safety';
import { BlockService } from '../../services/blockService';

interface Props {
  blockedUsers: BlockedUser[];
  loading: boolean;
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

export const BlockedUsersList: React.FC<Props> = ({ blockedUsers, loading }) => {
  const [unblocking, setUnblocking] = useState<string | null>(null);

  const handleUnblock = async (uid: string) => {
    if (!window.confirm('Are you sure you want to unblock this user?')) return;
    setUnblocking(uid);
    try {
      await BlockService.unblockUser(uid);
      // List updates via realtime listener
    } finally {
      setUnblocking(null);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: '#999' }}>Loading blocked users...</div>;
  }

  if (blockedUsers.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#bbb' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔓</div>
        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No blocked users</div>
        <div style={{ fontSize: '0.85rem' }}>Users you block will appear here.</div>
      </div>
    );
  }

  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }} role="list">
      {blockedUsers.map(user => (
        <li
          key={user.blockedUserId}
          role="listitem"
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.875rem 1rem', borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
              {user.displayName ?? `User (${user.blockedUserId.slice(0, 8)}...)`}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#999' }}>
              Blocked {timeAgo(user.blockedAt)}
            </div>
          </div>
          <button
            onClick={() => handleUnblock(user.blockedUserId)}
            disabled={unblocking === user.blockedUserId}
            aria-label={`Unblock user ${user.displayName ?? user.blockedUserId}`}
            style={{
              background: 'none', border: '1px solid #1565c0', color: '#1565c0',
              borderRadius: 6, padding: '0.35rem 0.75rem',
              cursor: 'pointer', fontSize: '0.82rem',
              opacity: unblocking === user.blockedUserId ? 0.6 : 1,
            }}
          >
            {unblocking === user.blockedUserId ? 'Unblocking...' : 'Unblock'}
          </button>
        </li>
      ))}
    </ul>
  );
};
