import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Job } from '../../../schemas/job';
import { JobService } from '../../../services/jobService';
import { useAuth } from '../../../context/AuthContext';

export const EmployerJobs: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      JobService.getEmployerJobs(user.uid)
        .then(setJobs)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handlePublish = async (jobId: string) => {
    try {
      await JobService.publishJob(jobId);
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'PUBLISHED' } : j));
    } catch (e) {
      console.error(e);
      alert('Failed to publish job.');
    }
  };

  if (loading) return <p>Loading jobs...</p>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>My Jobs</h2>
        <Link to="/employer/jobs/new" style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>Post New Job</Link>
      </div>

      {jobs.length === 0 ? (
        <p>You haven't posted any jobs yet.</p>
      ) : (
        <table style={{ width: '100%', marginTop: '2rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
              <th>Title</th>
              <th>Status</th>
              <th>Moderation</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '1rem 0' }}>{job.title}</td>
                <td>{job.status}</td>
                <td>
                  {job.moderationStatus === 'REJECTED' && (
                    <div style={{ color: 'red', fontSize: '0.8rem' }}>Rejected: {job.moderationReason}</div>
                  )}
                  {job.moderationStatus}
                </td>
                <td>{job.createdAt?.toDate ? job.createdAt.toDate().toLocaleDateString() : 'Recent'}</td>
                <td>
                  <Link to={`/employer/jobs/${job.id}/edit`} style={{ marginRight: '1rem' }}>Edit</Link>
                  {job.moderationStatus === 'APPROVED' && job.status !== 'PUBLISHED' && (
                    <button onClick={() => handlePublish(job.id!)} style={{ background: '#28a745', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>Publish</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
