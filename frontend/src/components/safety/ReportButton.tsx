import React, { useState } from 'react';
import { ReportDialog } from './ReportDialog';
import type { ReportTargetType } from '../../types/safety';

interface Props {
  targetType: ReportTargetType;
  targetId: string;
  targetLabel?: string;
  label?: string;
  variant?: 'button' | 'link' | 'icon';
  conversationId?: string;
  messageId?: string;
}

export const ReportButton: React.FC<Props> = ({
  targetType,
  targetId,
  targetLabel,
  label = 'Report',
  variant = 'button',
  conversationId,
  messageId,
}) => {
  const [open, setOpen] = useState(false);

  const buttonStyles: Record<string, React.CSSProperties> = {
    button: {
      background: 'none', border: '1px solid #e0e0e0',
      borderRadius: 6, padding: '0.4rem 0.75rem',
      cursor: 'pointer', color: '#c62828', fontSize: '0.82rem',
    },
    link: {
      background: 'none', border: 'none',
      cursor: 'pointer', color: '#c62828', fontSize: '0.82rem',
      textDecoration: 'underline', padding: 0,
    },
    icon: {
      background: 'none', border: 'none',
      cursor: 'pointer', color: '#999', fontSize: '0.85rem', padding: '0.2rem',
    },
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={buttonStyles[variant]}
        aria-label={`Report ${targetLabel ?? targetType.toLowerCase()}`}
      >
        {variant === 'icon' ? '🚩' : label}
      </button>

      <ReportDialog
        targetType={targetType}
        targetId={targetId}
        targetLabel={targetLabel}
        isOpen={open}
        onClose={() => setOpen(false)}
        conversationId={conversationId}
        messageId={messageId}
      />
    </>
  );
};
