import React from 'react';
import type { Verification, VerificationType } from '../../types/safety';

interface Props {
  verification: Verification | null;
  type: VerificationType;
  onStartVerification?: () => void;
}

const STATUS_DISPLAY: Record<string, { label: string; color: string; bg: string; icon: string; description: string }> = {
  NOT_STARTED: {
    label: 'Not Started',
    color: '#555', bg: '#f5f5f5', icon: '○',
    description: 'You have not submitted a verification request yet.',
  },
  PENDING: {
    label: 'Under Review',
    color: '#f57c00', bg: '#fff8e1', icon: '⏳',
    description: 'Your verification is being reviewed by our team.',
  },
  VERIFIED: {
    label: 'Verified',
    color: '#1565c0', bg: '#e3f2fd', icon: '✓',
    description: 'Your account has been verified.',
  },
  REJECTED: {
    label: 'Not Approved',
    color: '#c62828', bg: '#ffebee', icon: '✕',
    description: 'Your verification was not approved. You may resubmit.',
  },
  EXPIRED: {
    label: 'Expired',
    color: '#6d4c41', bg: '#efebe9', icon: '⚠',
    description: 'Your verification has expired. Please resubmit.',
  },
  SUSPENDED: {
    label: 'Suspended',
    color: '#c62828', bg: '#ffebee', icon: '🚫',
    description: 'This verification has been suspended.',
  },
};

export const VerificationStatusCard: React.FC<Props> = ({ verification, type, onStartVerification }) => {
  const status = verification?.status ?? 'NOT_STARTED';
  const display = STATUS_DISPLAY[status] ?? STATUS_DISPLAY.NOT_STARTED;
  const canSubmit = !verification || status === 'REJECTED' || status === 'EXPIRED';

  return (
    <div style={{
      border: `1px solid ${display.color}33`,
      borderLeft: `4px solid ${display.color}`,
      background: display.bg,
      borderRadius: 8,
      padding: '1rem 1.25rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.2rem' }}>{display.icon}</span>
            <span style={{ fontWeight: 700, color: display.color, fontSize: '0.95rem' }}>
              {type} Verification: {display.label}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#555' }}>{display.description}</p>
          {verification?.rejectionReason && status === 'REJECTED' && (
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.82rem', color: '#c62828' }}>
              Reason: {verification.rejectionReason}
            </p>
          )}
        </div>

        {canSubmit && onStartVerification && (
          <button
            onClick={onStartVerification}
            style={{
              background: '#1565c0', color: 'white', border: 'none',
              borderRadius: 6, padding: '0.45rem 1rem', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: '1rem',
            }}
          >
            {status === 'NOT_STARTED' ? 'Start Verification' : 'Resubmit'}
          </button>
        )}
      </div>
    </div>
  );
};
