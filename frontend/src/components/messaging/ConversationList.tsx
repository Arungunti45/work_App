import React from 'react';
import type { Conversation } from '../../schemas/messaging';

interface Props {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const ConversationList: React.FC<Props> = ({ conversations, selectedId, onSelect }) => {
  
  if (conversations.length === 0) {
    return <div style={{ padding: '1rem', color: '#666' }}>No conversations found.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {conversations.map(conv => {
        // Quick label deduction based on context
        let label = 'Unknown';
        if (conv.type === 'JOB_APPLICATION') label = `Application Chat`;

        const isSelected = selectedId === conv.id;
        
        return (
          <div 
            key={conv.id} 
            onClick={() => onSelect(conv.id!)}
            style={{ 
              padding: '1rem', 
              borderBottom: '1px solid #eee', 
              cursor: 'pointer',
              background: isSelected ? '#f0f7ff' : 'white',
              borderLeft: isSelected ? '4px solid #0070f3' : '4px solid transparent'
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{label}</div>
            <div style={{ fontSize: '0.85rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {conv.lastMessage || 'Start the conversation'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
              {conv.lastMessageAt?.toDate ? conv.lastMessageAt.toDate().toLocaleDateString() : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
};
