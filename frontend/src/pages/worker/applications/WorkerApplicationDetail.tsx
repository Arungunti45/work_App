import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ApplicationService } from '../../../services/applicationService';
import { JobService } from '../../../services/jobService';
import { ConversationService } from '../../../services/conversationService';
import type { Application, ApplicationHistory } from '../../../schemas/application';
import { ApplicationStatusBadge } from '../../../components/applications/ApplicationStatusBadge';
import { ApplicationTimeline } from '../../../components/applications/ApplicationTimeline';

export const WorkerApplicationDetail: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [app, setApp] = useState<Application | null>(null);
  const [history, setHistory] = useState<ApplicationHistory[]>([]);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (applicationId) {
      loadData();
    }
  }, [applicationId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const appData = await ApplicationService.getApplication(applicationId!);
      setApp(appData);
      
      if (appData) {
        const histData = await ApplicationService.getApplicationHistory(applicationId!);
        setHistory(histData);
        
        const jobData = await JobService.getJob(appData.jobId);
        setJob(jobData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (window.confirm('Are you sure you want to withdraw this application? This cannot be undone.')) {
      try {
        await ApplicationService.withdraw(applicationId!);
        loadData(); // Reload to show updated status
      } catch (e: any) {
        alert(e.message || 'Failed to withdraw');
      }
    }
  };

  const handleStartChat = async () => {
    try {
      setLoading(true);
      const convId = await ConversationService.getOrCreateApplicationConversation(applicationId!);
      navigate(`/messages/${convId}`);
    } catch (e: any) {
      alert(e.message || 'Failed to start chat');
      setLoading(false);
    }
  };

  if (loading) return <div>Loading details...</div>;
  if (!app) return <div>Application not found.</div>;

  const canWithdraw = ['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED'].includes(app.status);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/my-applications" style={{ display: 'inline-block', marginBottom: '1rem' }}>&larr; Back to Applications</Link>
      
      <div style={{ padding: '2rem', background: 'white', borderRadius: '8px', border: '1px solid #eaeaea' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ marginTop: 0 }}>{job?.title || 'Job Details'}</h1>
            <p style={{ color: '#666' }}>{job?.locationText || 'Remote'}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
            <ApplicationStatusBadge status={app.status} />
            <button onClick={handleStartChat} style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Message Employer
            </button>
          </div>
        </div>

        {app.coverMessage && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
            <h4 style={{ marginTop: 0 }}>Cover Message</h4>
            <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{app.coverMessage}</p>
          </div>
        )}

        <ApplicationTimeline history={history} currentStatus={app.status} />

        {canWithdraw && (
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #eaeaea', textAlign: 'right' }}>
            <button 
              onClick={handleWithdraw}
              style={{ padding: '0.75rem 1.5rem', background: '#fff', color: '#d32f2f', border: '1px solid #d32f2f', borderRadius: '4px', cursor: 'pointer' }}
            >
              Withdraw Application
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
