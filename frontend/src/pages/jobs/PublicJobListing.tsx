import React, { useState, useEffect } from 'react';
import type { Job } from '../../schemas/job';
import { JobService } from '../../services/jobService';
import { JobCard } from '../../components/JobCard';

export const PublicJobListing: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    JobService.getPublishedJobs()
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', background: '#f9f9f9', minHeight: '100vh' }}>
      <h2>Available Jobs</h2>
      
      {loading ? (
        <p>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {jobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};
