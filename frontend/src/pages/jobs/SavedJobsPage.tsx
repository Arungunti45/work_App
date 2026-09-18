import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SavedJobsService } from '../../services/savedJobsService';
import type { Job } from '../../schemas/job';
import { JobCard } from '../../components/JobCard';

export const SavedJobsPage: React.FC = () => {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState<{ savedAt: any, job: Job | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedJobs();
    }
  }, [user]);

  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const records = await SavedJobsService.getSavedJobs(user!.uid);
      setSavedJobs(records);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div style={{ padding: '2rem' }}>Please log in to view saved jobs.</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>My Saved Jobs</h2>
      
      {loading ? (
        <p>Loading saved jobs...</p>
      ) : savedJobs.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px' }}>
          <p>You haven't saved any jobs yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {savedJobs.map((record, idx) => (
            <div key={idx}>
              {record.job ? (
                <JobCard job={record.job} />
              ) : (
                <div style={{ padding: '1.5rem', border: '1px solid #ffc107', borderRadius: '8px', background: '#fffbeb' }}>
                  <p style={{ margin: 0 }}>This job is no longer available.</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#666' }}>Saved on: {record.savedAt?.toDate().toLocaleDateString()}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
