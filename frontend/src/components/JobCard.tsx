import React from 'react';
import { Link } from 'react-router-dom';
import type { Job } from '../schemas/job';
import { SavedJobButton } from './jobs/SavedJobButton';

export const JobCard: React.FC<{ job: Job }> = ({ job }) => {
  return (
    <div style={{ 
      border: '1px solid #eaeaea', 
      borderRadius: '8px', 
      padding: '1.5rem', 
      marginBottom: '1rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      background: 'white'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>{job.title}</h3>
          <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
            {job.locationText || job.city || 'Location unspecified'} • {job.workType || 'Full Time'}
          </p>
        </div>
        {job.urgent && (
          <span style={{ background: '#ffebee', color: '#d32f2f', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
            URGENT
          </span>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p style={{ margin: '0 0 0.25rem 0', fontWeight: '500' }}>
          ₹{job.salaryMin || 0} - ₹{job.salaryMax || 0} {job.salaryType ? `/ ${job.salaryType.toLowerCase()}` : ''}
        </p>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
          Workers Needed: {job.workersRequired} • Exp: {job.experienceLevel || 'Not specified'}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: '#888' }}>
          Posted {job.publishedAt?.toDate ? job.publishedAt.toDate().toLocaleDateString() : 'Recently'}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {job.id && <SavedJobButton jobId={job.id} />}
          <Link to={`/jobs/${job.id}`} style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            View Job
          </Link>
        </div>
      </div>
    </div>
  );
};
