import React from 'react';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, message, actionLabel, onAction }) => {
  return (
    <div 
      style={{
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '3rem 1rem', 
        textAlign: 'center',
        background: '#f9fafb',
        borderRadius: '8px',
        border: '1px dashed #d1d5db'
      }}
      role="status"
      aria-live="polite"
    >
      <div style={{ color: '#9ca3af', marginBottom: '1rem' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>
        {title}
      </h3>
      <p style={{ color: '#4b5563', marginBottom: actionLabel ? '1.5rem' : '0' }}>
        {message}
      </p>
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          style={{
            padding: '0.5rem 1rem',
            background: '#3b82f6',
            color: 'white',
            borderRadius: '4px',
            fontWeight: 500
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
