import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { ApplicationService } from '../../../services/applicationService';
import type { Application } from '../../../schemas/application';
import { ProfileService } from '../../../services/profileService';
import { ApplicantCard } from '../../../components/applications/ApplicantCard';
import { Link } from 'react-router-dom';

export const EmployerApplications: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [workerProfiles, setWorkerProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const apps = await ApplicationService.getEmployerApplications(user!.uid);
      setApplications(apps);

      const profiles: Record<string, any> = {};
      for (const app of apps) {
        if (!profiles[app.workerId]) {
          const profile = await ProfileService.getProfile(app.workerId, 'WORKER');
          profiles[app.workerId] = profile;
        }
      }
      setWorkerProfiles(profiles);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: any) => {
    try {
      await ApplicationService.updateApplicationStatus(appId, newStatus);
      loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const handleHire = async (appId: string) => {
    if (window.confirm("Are you sure you want to hire this applicant? This will fill the job vacancy.")) {
      try {
        await ApplicationService.hire(appId);
        loadData();
      } catch (e: any) {
        alert(e.message || 'Failed to hire applicant');
      }
    }
  };

  if (loading) return <div>Loading applications...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>All Received Applications</h1>
      
      {applications.length === 0 ? (
        <div style={{ padding: '3rem', background: '#f9f9f9', textAlign: 'center' }}>
          <p>You haven't received any applications yet.</p>
        </div>
      ) : (
        <div>
          {applications.map(app => (
            <div key={app.id}>
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>For Job ID: <Link to={`/jobs/${app.jobId}`}>{app.jobId}</Link></div>
              <ApplicantCard 
                application={app} 
                workerProfile={workerProfiles[app.workerId]}
                onShortlist={() => handleStatusChange(app.id!, 'SHORTLISTED')}
                onReject={() => {
                  if (window.confirm('Reject this applicant?')) handleStatusChange(app.id!, 'REJECTED');
                }}
                onHire={() => handleHire(app.id!)}
                onScheduleInterview={() => {
                  alert('Interview scheduling is handled from the applicant detail view in this MVP phase.');
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
