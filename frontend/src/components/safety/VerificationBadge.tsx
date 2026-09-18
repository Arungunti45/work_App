import React from 'react';

interface Props {
  verified?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = { sm: '0.75rem', md: '0.85rem', lg: '1rem' };
const BADGE_SIZE = { sm: 14, md: 16, lg: 20 };

export const VerificationBadge: React.FC<Props> = ({ verified = false, size = 'md' }) => {
  if (!verified) return null;

  return (
    <span
      title="Verified account"
      aria-label="Verified account"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.2rem',
        background: '#e3f2fd',
        color: '#1565c0',
        borderRadius: 20,
        padding: `2px 8px`,
        fontSize: SIZE_MAP[size],
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      <svg
        width={BADGE_SIZE[size]}
        height={BADGE_SIZE[size]}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2L13.09 8.26L19 7L16.09 12L19 17L13.09 15.74L12 22L10.91 15.74L5 17L7.91 12L5 7L10.91 8.26L12 2Z" opacity="0.2"/>
        <path d="M9 12L11 14L15 10M12 2L13.5 8.5L20 7L17 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L7 12L4 7L10.5 8.5L12 2Z" strokeWidth="1.5" stroke="currentColor" fill="none"/>
        <polyline points="9,12 11,14 15,10" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Verified
    </span>
  );
};
