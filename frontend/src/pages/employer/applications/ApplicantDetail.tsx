import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ApplicationService } from '../../../services/applicationService';
import { ProfileService } from '../../../services/profileService';
import { ConversationService } from '../../../services/conversationService';
import type { Application } from '../../../schemas/application';
import { ApplicationStatusBadge } from '../../../components/applications/ApplicationStatusBadge';

export const ApplicantDetail: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [app, setApp] = useState<Application | null>(null);
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (applicationId) loadData();
  }, [applicationId]);

  const loadData = async () => {
    try {
      const appData = await ApplicationService.getApplication(applicationId!);
      setApp(appData);
      if (appData) {
        const workerData = await ProfileService.getProfile(appData.workerId, 'WORKER');
        setWorker(workerData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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

  if (loading) return <div>Loading...</div>;
  if (!app || !worker) return <div>Applicant not found</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/employer/applications" style={{ display: 'inline-block', marginBottom: '1rem' }}>&larr; Back to Applications</Link>
      
      <div style={{ padding: '2rem', background: 'white', borderRadius: '8px', border: '1px solid #eaeaea' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ccc', overflow: 'hidden' }}>
              {worker.photoUrl ? <img src={worker.photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
            </div>
            <div>
              <h1 style={{ margin: '0 0 0.5rem 0' }}>{worker.firstName} {worker.lastName}</h1>
              <p style={{ margin: 0, color: '#666' }}>{worker.city}, {worker.state}</p>
              <p style={{ margin: '0.25rem 0', fontWeight: 'bold' }}>Experience: {worker.experience}</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
            <ApplicationStatusBadge status={app.status} />
            <button onClick={handleStartChat} style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Message Applicant
            </button>
          </div>
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #eaeaea' }}>
          <h3>Application Details</h3>
          <p><strong>Cover Message:</strong></p>
          <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
            {app.coverMessage || 'No cover message provided.'}
          </div>
          {app.resumeUrl && (
            <p style={{ marginTop: '1rem' }}>
              <strong>Resume:</strong> <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">View Resume</a>
            </p>
          )}
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #eaeaea' }}>
          <h3>Skills</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {(worker.skills || []).map((skill: string) => (
              <span key={skill} style={{ background: '#e3f2fd', color: '#1976d2', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        {/* Placeholder for Interview Component */}
        {['SHORTLISTED', 'INTERVIEW_SCHEDULED'].includes(app.status) && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#ede7f6', borderRadius: '8px' }}>
            <h4>Interview Management</h4>
            <p>Interview scheduling API implemented. UI is pending integration.</p>
          </div>
        )}

      </div>
    </div>
  );
};
