import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { userProfile, logout } = useAuth();
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome Administrator: {userProfile?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
