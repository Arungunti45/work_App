import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const ContractorDashboard: React.FC = () => {
  const { userProfile, logout } = useAuth();
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Contractor Dashboard</h1>
      <p>Welcome, {userProfile?.displayName || userProfile?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
