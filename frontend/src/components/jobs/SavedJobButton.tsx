import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SavedJobsService } from '../../services/savedJobsService';
import { useNavigate } from 'react-router-dom';

export const SavedJobButton: React.FC<{ jobId: string }> = ({ jobId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && jobId) {
      SavedJobsService.isJobSaved(user.uid, jobId).then(setIsSaved).catch(console.error);
    }
  }, [user, jobId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // If user isn't logged in, redirect or prompt (for now, redirect to login)
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      const saved = await SavedJobsService.toggleSaveJob(user.uid, jobId);
      setIsSaved(saved);
    } catch (error) {
      console.error("Failed to toggle save job", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={isSaved ? "Remove saved job" : "Save job"}
      style={{
        padding: '0.5rem 1rem',
        border: '1px solid #ccc',
        background: isSaved ? '#e0f7fa' : 'transparent',
        color: isSaved ? '#00796b' : '#333',
        borderRadius: '4px',
        cursor: isLoading ? 'wait' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}
    >
      {isLoading ? '...' : (isSaved ? 'Saved' : 'Save')}
    </button>
  );
};
