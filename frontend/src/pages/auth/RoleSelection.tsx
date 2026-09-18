import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../schemas/user';

export const RoleSelection: React.FC = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSelectRole = async (role: Role) => {
    if (!user) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await AuthService.updateUserRole(user.uid, role);
      await refreshProfile();
      navigate(`/${role.toLowerCase()}/dashboard`);
    } catch (err: any) {
      setError(err.message || 'Failed to assign role');
      setIsSubmitting(false);
    }
  };

  if (!userProfile) return <div>Loading...</div>;
  if (userProfile.role) {
    navigate(`/${userProfile.role.toLowerCase()}/dashboard`);
    return null;
  }

  const roleCardStyle = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '1.5rem',
    cursor: 'pointer',
    textAlign: 'center' as const,
    flex: '1',
    background: '#f9f9f9',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '2rem' }}>
      <h2 style={{ textAlign: 'center' }}>Select Your Path</h2>
      <p style={{ textAlign: 'center', marginBottom: '2rem' }}>How will you use GET YOUR JOB?</p>
      {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}
      
      <div style={{ display: 'flex', gap: '1.5rem', flexDirection: 'row', flexWrap: 'wrap' }}>
        <div 
          style={roleCardStyle} 
          onClick={() => !isSubmitting && handleSelectRole('WORKER')}
        >
          <h3>WORKER</h3>
          <p>Find jobs and build your career.</p>
          <button disabled={isSubmitting} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Select Worker</button>
        </div>

        <div 
          style={roleCardStyle} 
          onClick={() => !isSubmitting && handleSelectRole('EMPLOYER')}
        >
          <h3>EMPLOYER</h3>
          <p>Post jobs and hire workers.</p>
          <button disabled={isSubmitting} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Select Employer</button>
        </div>

        <div 
          style={roleCardStyle} 
          onClick={() => !isSubmitting && handleSelectRole('CONTRACTOR')}
        >
          <h3>CONTRACTOR</h3>
          <p>Create projects and hire worker teams.</p>
          <button disabled={isSubmitting} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Select Contractor</button>
        </div>
      </div>
    </div>
  );
};
