import React from 'react';
import type { Application } from '../../schemas/application';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import { Link } from 'react-router-dom';

interface Props {
  application: Application;
  workerProfile: any;
  onShortlist?: () => void;
  onReject?: () => void;
  onScheduleInterview?: () => void;
  onHire?: () => void;
}

export const ApplicantCard: React.FC<Props> = ({ application, workerProfile, onShortlist, onReject, onScheduleInterview, onHire }) => {
  return (
    <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid #eaeaea', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#ccc', overflow: 'hidden' }}>
            {workerProfile?.photoUrl ? (
              <img src={workerProfile.photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white' }}>?</div>
            )}
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.25rem 0' }}>{workerProfile?.firstName} {workerProfile?.lastName}</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
              Applied: {application.appliedAt?.toDate ? application.appliedAt.toDate().toLocaleDateString() : 'Recently'}
            </p>
          </div>
        </div>
        <div>
          <ApplicationStatusBadge status={application.status} />
        </div>
      </div>

      <div style={{ margin: '1rem 0', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {(workerProfile?.skills || []).map((skill: string) => (
          <span key={skill} style={{ background: '#f5f5f5', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
            {skill}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #eaeaea' }}>
        <Link to={`/employer/applications/${application.id}/worker`} style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '4px', textDecoration: 'none', color: '#333' }}>
          View Profile
        </Link>
        
        {['SUBMITTED', 'UNDER_REVIEW'].includes(application.status) && onShortlist && (
          <button onClick={onShortlist} style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Shortlist
          </button>
        )}

        {application.status === 'SHORTLISTED' && onScheduleInterview && (
          <button onClick={onScheduleInterview} style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Schedule Interview
          </button>
        )}

        {['INTERVIEW_COMPLETED', 'OFFERED', 'SHORTLISTED'].includes(application.status) && onHire && (
          <button onClick={onHire} style={{ padding: '0.5rem 1rem', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Hire
          </button>
        )}

        {!['REJECTED', 'WITHDRAWN', 'HIRED'].includes(application.status) && onReject && (
          <button onClick={onReject} style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#d32f2f', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}>
            Reject
          </button>
        )}
      </div>
    </div>
  );
};
