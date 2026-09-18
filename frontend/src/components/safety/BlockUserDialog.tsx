import React, { useState } from 'react';
import { BlockService } from '../../services/blockService';

interface Props {
  targetUid: string;
  targetName?: string;
  onBlocked?: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export const BlockUserDialog: React.FC<Props> = ({
  targetUid, targetName = 'this user', onBlocked, onClose, isOpen
}) => {
  const [blocking, setBlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBlock = async () => {
    setBlocking(true);
    setError(null);
    try {
      await BlockService.blockUser(targetUid);
      onBlocked?.();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to block user');
    } finally {
      setBlocking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="block-dialog-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 1001,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)', padding: '1rem',
      }}
    >
      <div style={{
        background: 'white', borderRadius: 12, width: '100%', maxWidth: 400,
        padding: '1.5rem',
      }}>
        <h2 id="block-dialog-title" style={{ marginTop: 0, fontSize: '1.1rem' }}>
          Block {targetName}?
        </h2>
        <p style={{ color: '#555', fontSize: '0.9rem', lineHeight: 1.5 }}>
          You will no longer be able to communicate with this user through supported
          platform interactions. Existing records (applications, job history) will not be deleted.
        </p>
        {error && <div role="alert" style={{ color: '#c62828', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{error}</div>}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleBlock}
            disabled={blocking}
            style={{
              background: '#c62828', color: 'white', border: 'none',
              borderRadius: 6, padding: '0.6rem 1.25rem', cursor: 'pointer',
              fontWeight: 600, opacity: blocking ? 0.7 : 1,
            }}
            aria-label={`Confirm block ${targetName}`}
          >
            {blocking ? 'Blocking...' : 'Block User'}
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: '1px solid #ddd',
              borderRadius: 6, padding: '0.6rem 1rem', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
