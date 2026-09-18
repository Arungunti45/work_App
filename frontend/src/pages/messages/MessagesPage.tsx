import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ConversationService } from '../../services/conversationService';
import type { Conversation } from '../../schemas/messaging';
import { ConversationList } from '../../components/messaging/ConversationList';
import { ChatWindow } from '../../components/messaging/ChatWindow';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = ConversationService.subscribeToConversations(user.uid, (convs) => {
      setConversations(convs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const activeConversation = conversations.find(c => c.id === conversationId);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Sidebar List */}
      <div style={{ width: '350px', borderRight: '1px solid #eaeaea', background: 'white', overflowY: 'auto' }}>
        <div style={{ padding: '1.5rem 1rem', borderBottom: '1px solid #eaeaea', fontWeight: 'bold', fontSize: '1.2rem' }}>
          Messages
        </div>
        
        {loading ? (
          <div style={{ padding: '1rem', color: '#666' }}>Loading conversations...</div>
        ) : (
          <ConversationList 
            conversations={conversations} 
            selectedId={conversationId || null} 
            onSelect={(id) => navigate(`/messages/${id}`)}
          />
        )}
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeConversation ? (
          <ChatWindow conversation={activeConversation} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', background: '#fafafa' }}>
            {conversations.length > 0 ? "Select a conversation to start chatting" : "You have no active conversations"}
          </div>
        )}
      </div>
    </div>
  );
};
