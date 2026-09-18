import React from 'react';
import { Link } from 'react-router-dom';

interface Action {
  label: string;
  icon: string;
  to?: string;
  onClick?: () => void;
}

interface Props {
  actions?: Action[];
}

const DEFAULT_ACTIONS: Action[] = [
  { label: 'Safety Center',     icon: '🛡️', to: '/safety' },
  { label: 'Blocked Users',     icon: '🚫', to: '/settings/blocked-users' },
  { label: 'Notification Settings', icon: '🔔', to: '/settings/notifications' },
  { label: 'Verification',      icon: '✓',  to: '/verification' },
];

export const SafetyActions: React.FC<Props> = ({ actions = DEFAULT_ACTIONS }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
    {actions.map(action => (
      action.to ? (
        <Link
          key={action.label}
          to={action.to}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            background: '#f5f5f5', border: '1px solid #e0e0e0',
            borderRadius: 20, padding: '0.4rem 0.9rem',
            color: '#1565c0', textDecoration: 'none', fontSize: '0.82rem',
            fontWeight: 500,
          }}
        >
          <span aria-hidden="true">{action.icon}</span>
          {action.label}
        </Link>
      ) : (
        <button
          key={action.label}
          onClick={action.onClick}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            background: '#f5f5f5', border: '1px solid #e0e0e0',
            borderRadius: 20, padding: '0.4rem 0.9rem',
            color: '#1565c0', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
          }}
          aria-label={action.label}
        >
          <span aria-hidden="true">{action.icon}</span>
          {action.label}
        </button>
      )
    ))}
  </div>
);
