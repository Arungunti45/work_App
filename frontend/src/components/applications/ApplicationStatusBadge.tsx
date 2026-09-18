import React from 'react';
export const ApplicationStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let bgColor = '#e0e0e0';
  let color = '#333';
  let label = status.replace('_', ' ');

  switch (status) {
    case 'SUBMITTED':
      bgColor = '#e3f2fd';
      color = '#1976d2';
      break;
    case 'UNDER_REVIEW':
      bgColor = '#fff3e0';
      color = '#f57c00';
      break;
    case 'SHORTLISTED':
      bgColor = '#e8f5e9';
      color = '#388e3c';
      break;
    case 'INTERVIEW_SCHEDULED':
      bgColor = '#ede7f6';
      color = '#512da8';
      break;
    case 'INTERVIEW_COMPLETED':
      bgColor = '#e8eaf6';
      color = '#3f51b5';
      break;
    case 'OFFERED':
      bgColor = '#f3e5f5';
      color = '#7b1fa2';
      break;
    case 'HIRED':
      bgColor = '#dcedc8';
      color = '#33691e';
      break;
    case 'REJECTED':
      bgColor = '#ffebee';
      color = '#d32f2f';
      break;
    case 'WITHDRAWN':
      bgColor = '#eeeeee';
      color = '#616161';
      break;
  }

  return (
    <span style={{
      display: 'inline-block',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      backgroundColor: bgColor,
      color: color,
      fontSize: '0.75rem',
      fontWeight: 'bold',
      textTransform: 'uppercase'
    }}>
      {label}
    </span>
  );
};
