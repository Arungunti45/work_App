import React, { useState, useEffect } from 'react';
import type { Job } from '../../../schemas/job';
import { JobService } from '../../../services/jobService';

export const AdminModeration: React.FC = () => {
  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchPendingJobs();
  }, []);

  const fetchPendingJobs = async () => {
    setLoading(true);
    try {
      const jobs = await JobService.getPendingModerationJobs();
      setPendingJobs(jobs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jobId: string) => {
    try {
      await JobService.moderateJob(jobId, 'APPROVE');
      fetchPendingJobs();
    } catch (e) {
      console.error(e);
      alert('Failed to approve job.');
    }
  };

  const handleReject = async (jobId: string) => {
    const reason = rejectReason[jobId];
    if (!reason) {
      alert("Please provide a rejection reason.");
      return;
    }
    try {
      await JobService.moderateJob(jobId, 'REJECT', reason);
      fetchPendingJobs();
    } catch (e) {
      console.error(e);
      alert('Failed to reject job.');
    }
  };

  if (loading) return <p>Loading moderation queue...</p>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>Moderation Queue</h2>
      {pendingJobs.length === 0 ? (
        <p>No jobs pending moderation.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {pendingJobs.map(job => (
            <div key={job.id} style={{ border: '1px solid #ccc', padding: '1.5rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3>{job.title}</h3>
                {job.urgent && <span style={{ color: 'red' }}>URGENT</span>}
              </div>
              <p><strong>Employer UID:</strong> {job.employerId}</p>
              <p><strong>Description:</strong> {job.description}</p>
              <p><strong>Salary:</strong> ₹{job.salaryMin} - ₹{job.salaryMax}</p>
              
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button onClick={() => handleApprove(job.id!)} style={{ background: '#28a745', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px' }}>
                  Approve
                </button>
                <input 
                  type="text" 
                  placeholder="Rejection Reason..." 
                  value={rejectReason[job.id!] || ''}
                  onChange={(e) => setRejectReason({ ...rejectReason, [job.id!]: e.target.value })}
                  style={{ padding: '0.5rem', flex: 1 }}
                />
                <button onClick={() => handleReject(job.id!)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px' }}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
