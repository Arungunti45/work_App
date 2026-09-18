import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { ApplicationService } from '../../../services/applicationService';
import type { Application } from '../../../schemas/application';
import { ApplicationStatusBadge } from '../../../components/applications/ApplicationStatusBadge';
import { JobService } from '../../../services/jobService';
import { Link } from 'react-router-dom';

export const WorkerApplications: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobMap, setJobMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user]);

  const loadApplications = async () => {
    try {
      const apps = await ApplicationService.getWorkerApplications(user!.uid);
      setApplications(apps);
      
      // Load job basic data for display (in a real app, you might denormalize title into the application doc)
      const jobs: Record<string, any> = {};
      await Promise.all(apps.map(async (app) => {
        if (!jobs[app.jobId]) {
          const job = await JobService.getJob(app.jobId);
          jobs[app.jobId] = job;
        }
      }));
      setJobMap(jobs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading applications...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>My Applications</h1>
      
      {applications.length === 0 ? (
        <div style={{ padding: '3rem', background: '#f9f9f9', textAlign: 'center', borderRadius: '8px' }}>
          <p>You haven't applied to any jobs yet.</p>
          <Link to="/jobs">Find Jobs</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {applications.map((app: Application) => {
            const job = jobMap[app.jobId];
            return (
              <div key={app.id} style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{job?.title || 'Unknown Job'}</h3>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                    Applied: {app.appliedAt?.toDate ? app.appliedAt.toDate().toLocaleDateString() : 'Recently'}
                  </div>
                  <ApplicationStatusBadge status={app.status} />
                </div>
                <div>
                  <Link to={`/my-applications/${app.id}`} style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
