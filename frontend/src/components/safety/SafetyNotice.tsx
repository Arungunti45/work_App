import React from 'react';

type NoticeType = 'info' | 'warning' | 'danger';

interface Props {
  type?: NoticeType;
  title?: string;
  children: React.ReactNode;
}

const STYLES: Record<NoticeType, { bg: string; border: string; color: string; icon: string }> = {
  info:    { bg: '#e3f2fd', border: '#1565c0', color: '#1565c0', icon: 'ℹ️' },
  warning: { bg: '#fff8e1', border: '#f57c00', color: '#e65100', icon: '⚠️' },
  danger:  { bg: '#ffebee', border: '#c62828', color: '#c62828', icon: '🚨' },
};

export const SafetyNotice: React.FC<Props> = ({ type = 'info', title, children }) => {
  const s = STYLES[type];
  return (
    <div
      role="note"
      style={{
        background: s.bg, borderLeft: `4px solid ${s.border}`,
        borderRadius: 6, padding: '0.875rem 1rem', marginBottom: '1rem',
      }}
    >
      {title && (
        <div style={{ fontWeight: 700, color: s.color, marginBottom: '0.35rem' }}>
          {s.icon} {title}
        </div>
      )}
      <div style={{ color: '#333', fontSize: '0.875rem', lineHeight: 1.5 }}>
        {children}
      </div>
    </div>
  );
};
