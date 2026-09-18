import React from 'react';
import type { Message } from '../../schemas/messaging';

interface Props {
  message: Message;
  isOwn: boolean;
}

export const MessageBubble: React.FC<Props> = ({ message, isOwn }) => {
  return (
    <div style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', marginBottom: '1rem' }}>
      <div style={{ 
        maxWidth: '70%', 
        padding: '0.75rem 1rem', 
        borderRadius: '8px',
        background: isOwn ? '#0070f3' : '#f1f1f1',
        color: isOwn ? 'white' : 'black',
        borderBottomRightRadius: isOwn ? '0' : '8px',
        borderBottomLeftRadius: isOwn ? '8px' : '0'
      }}>
        {message.type === 'SYSTEM' ? (
          <div style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>{message.text}</div>
        ) : (
          <>
            {message.attachmentIds.length > 0 && (
              <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', padding: '0.5rem', background: 'rgba(0,0,0,0.1)', borderRadius: '4px' }}>
                📎 Attachment included
              </div>
            )}
            <div style={{ whiteSpace: 'pre-wrap' }}>{message.text}</div>
          </>
        )}
        <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.25rem', textAlign: 'right' }}>
          {message.createdAt?.toDate ? message.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </div>
      </div>
    </div>
  );
};
