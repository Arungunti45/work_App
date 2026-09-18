import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../schemas/user';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading Application...</div>;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export const RoleProtectedRoute: React.FC<{ allowedRoles: Role[], requireOnboarding?: boolean }> = ({ allowedRoles, requireOnboarding = true }) => {
  const { isAuthenticated, role, loading, userProfile, onboardingComplete } = useAuth();

  if (loading) return <div>Loading Role...</div>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (userProfile?.accountStatus !== 'active') {
    return <div style={{ padding: '2rem', color: 'red' }}>Access Denied. Account Status: {userProfile?.accountStatus}. Please contact support.</div>;
  }

  if (!role) return <Navigate to="/select-role" replace />;

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />; // or unauthorized page
  }

  if (requireOnboarding && !onboardingComplete) {
    return <Navigate to={`/${role.toLowerCase()}/onboarding`} replace />;
  }

  return <Outlet />;
};
