import React, { useState } from 'react';
import { ApplicationService } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Job } from '../../schemas/job';

interface Props {
  job: Job;
  onApplySuccess: () => void;
  onCancel: () => void;
}

export const ApplyForm: React.FC<Props> = ({ job, onApplySuccess, onCancel }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coverMessage, setCoverMessage] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await ApplicationService.submitApplication(job.id!, coverMessage, resumeUrl);
      onApplySuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit application. You may have already applied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '500px', width: '100%' }}>
        <h2 style={{ marginTop: 0 }}>Apply for {job.title}</h2>
        
        {error && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Cover Message (Optional)</label>
            <textarea 
              rows={5}
              value={coverMessage}
              onChange={(e) => setCoverMessage(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
              placeholder="Why are you a good fit?"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Resume Link (Optional)</label>
            <input 
              type="url"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
              placeholder="https://..."
            />
            <small style={{ color: '#666' }}>In a full implementation, you can upload a file directly here.</small>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onCancel} disabled={loading} style={{ padding: '0.5rem 1rem', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
