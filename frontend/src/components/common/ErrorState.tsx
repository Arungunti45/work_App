import React from 'react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title = "Something went wrong", 
  message = "An error occurred while loading this content. Please try again.",
  onRetry 
}) => {
  return (
    <div 
      style={{
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '3rem 1rem', 
        textAlign: 'center',
        background: '#fef2f2', // light red
        borderRadius: '8px',
        border: '1px solid #fecaca'
      }}
      role="alert"
      aria-live="assertive"
    >
      <div style={{ color: '#ef4444', marginBottom: '1rem' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#991b1b', marginBottom: '0.5rem' }}>
        {title}
      </h3>
      <p style={{ color: '#b91c1c', marginBottom: onRetry ? '1.5rem' : '0' }}>
        {message}
      </p>
      {onRetry && (
        <button 
          onClick={onRetry}
          style={{
            padding: '0.5rem 1rem',
            background: '#ef4444',
            color: 'white',
            borderRadius: '4px',
            fontWeight: 500
          }}
          aria-label="Retry loading content"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
