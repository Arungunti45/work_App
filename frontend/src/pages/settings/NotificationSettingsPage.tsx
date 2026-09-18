import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { NotificationSettings } from '../../components/notifications/NotificationSettings';

export const NotificationSettingsPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div style={{ padding: '2rem' }}>Please log in to manage notification settings.</div>;
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 720, margin: '0 auto' }}>
      <NotificationSettings uid={user.uid} />
    </div>
  );
};
