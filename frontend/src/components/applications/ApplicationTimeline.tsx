import React from 'react';


interface Props {
  history: any[]; // Using any array to represent ApplicationHistory items
  currentStatus: string;
}

export const ApplicationTimeline: React.FC<Props> = ({ history, currentStatus }) => {
  return (
    <div style={{ margin: '2rem 0', padding: '1.5rem', background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Application Timeline</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {history.map((event, idx) => (
          <div key={event.id || idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              backgroundColor: event.status === currentStatus ? '#0070f3' : '#ccc',
              marginTop: '5px'
            }} />
            <div>
              <div style={{ fontWeight: 'bold' }}>{event.status.replace('_', ' ')}</div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                {event.changedAt?.toDate ? event.changedAt.toDate().toLocaleString() : 'Just now'}
              </div>
              {event.reason && <div style={{ fontSize: '0.9rem', marginTop: '0.25rem', fontStyle: 'italic' }}>Note: {event.reason}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
