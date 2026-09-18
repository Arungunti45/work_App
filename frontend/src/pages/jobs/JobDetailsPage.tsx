import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { JobService } from '../../services/jobService';
import { ApplicationService } from '../../services/applicationService';
import type { Job } from '../../schemas/job';
import { SavedJobButton } from '../../components/jobs/SavedJobButton';
import { ApplyForm } from '../../components/applications/ApplyForm';
import { useAuth } from '../../context/AuthContext';

export const JobDetailsPage: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    if (jobId) {
      JobService.getJob(jobId)
        .then(data => {
          if (data && data.status === 'PUBLISHED' && data.moderationStatus === 'APPROVED') {
            setJob(data);
          } else {
            setJob(null);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [jobId]);

  useEffect(() => {
    if (user && jobId && userProfile?.role === 'WORKER') {
      ApplicationService.checkDuplicate(jobId, user.uid).then(setHasApplied).catch(console.error);
    }
  }, [user, jobId, userProfile]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading job details...</div>;
  
  if (!job) return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <h2>Job not found</h2>
      <p>This job may have been closed or is no longer available.</p>
      <Link to="/jobs">Back to Jobs</Link>
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0' }}>{job.title}</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '1.1rem' }}>
            {job.locationText || job.city || 'Location unspecified'} • {job.workType || 'Full Time'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {job.id && <SavedJobButton jobId={job.id} />}
          
          {hasApplied ? (
            <button disabled style={{ padding: '0.75rem 1.5rem', background: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7', borderRadius: '4px', cursor: 'not-allowed', fontWeight: 'bold' }}>
              Application Submitted
            </button>
          ) : (
            <button 
              onClick={() => setShowApplyModal(true)}
              style={{ padding: '0.75rem 1.5rem', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Apply Now
            </button>
          )}
        </div>
      </div>

      {showApplyModal && (
        <ApplyForm 
          job={job} 
          onApplySuccess={() => { setShowApplyModal(false); setHasApplied(true); }}
          onCancel={() => setShowApplyModal(false)}
        />
      )}

      <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0 }}>Job Overview</h3>
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <li><strong>Salary:</strong> ₹{job.salaryMin} - ₹{job.salaryMax} {job.salaryType ? `/ ${job.salaryType.toLowerCase()}` : ''}</li>
          <li><strong>Experience:</strong> {job.experienceLevel || 'Not specified'}</li>
          <li><strong>Workers Needed:</strong> {job.workersRequired}</li>
          <li><strong>Posted:</strong> {job.publishedAt?.toDate().toLocaleDateString()}</li>
        </ul>
      </div>

      <div>
        <h3>Description</h3>
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{job.description}</p>
      </div>

      {job.skillIds && job.skillIds.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Required Skills</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {job.skillIds.map(skill => (
              <span key={skill} style={{ background: '#e0f7fa', color: '#00796b', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.9rem' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
