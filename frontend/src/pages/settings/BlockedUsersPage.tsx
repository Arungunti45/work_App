import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBlockedUsers } from '../../hooks/useBlockedUsers';
import { BlockedUsersList } from '../../components/safety/BlockedUsersList';

export const BlockedUsersPage: React.FC = () => {
  const { user } = useAuth();
  const { blockedUsers, loading } = useBlockedUsers(user?.uid ?? null);

  if (!user) {
    return <div style={{ padding: '2rem' }}>Please log in to view blocked users.</div>;
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '1.5rem' }}>
      <h1 style={{ marginTop: 0 }}>Blocked Users</h1>
      <p style={{ color: '#555', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        Blocked users cannot initiate new conversations with you through the platform.
        You can unblock them at any time.
      </p>

      <div style={{ border: '1px solid #e0e0e0', borderRadius: 10, overflow: 'hidden' }}>
        <BlockedUsersList blockedUsers={blockedUsers} loading={loading} />
      </div>
    </div>
  );
};
