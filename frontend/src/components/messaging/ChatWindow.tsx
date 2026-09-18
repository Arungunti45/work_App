import React, { useEffect, useState, useRef } from 'react';
import type { Conversation, Message } from '../../schemas/messaging';
import { ConversationService } from '../../services/conversationService';
import { useAuth } from '../../context/AuthContext';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';

interface Props {
  conversation: Conversation;
}

export const ChatWindow: React.FC<Props> = ({ conversation }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversation.id) return;
    
    // Subscribe to messages
    const unsubscribe = ConversationService.subscribeToMessages(conversation.id, (msgs: Message[]) => {
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    // Mark as read
    ConversationService.markAsRead(conversation.id, user!.uid);

    return () => unsubscribe();
  }, [conversation.id, user]);

  const handleSend = async (text: string, file?: File) => {
    let type: 'TEXT' | 'IMAGE' | 'DOCUMENT' = 'TEXT';
    let attachmentIds: string[] = [];

    if (file) {
      if (file.size > 5 * 1024 * 1024) throw new Error("File too large");
      type = file.type.startsWith('image/') ? 'IMAGE' : 'DOCUMENT';
      
      const storageRef = ref(storage, `conversations/${conversation.id}/attachments/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      // We would store the metadata in firestore in a full implementation, 
      // but for MVP we just include the download URL in the text or store paths
      const url = await getDownloadURL(storageRef);
      text = text ? `${text}\n\n[Attached: ${url}]` : `[Attached: ${url}]`;
    }

    await ConversationService.sendMessage(conversation.id!, user!.uid, text, type, attachmentIds);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fafafa' }}>
      <div style={{ padding: '1rem', background: 'white', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
        Chat - {conversation.type.replace('_', ' ')}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', marginTop: '2rem' }}>No messages yet. Say hello!</div>
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === user?.uid} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageComposer onSend={handleSend} />
    </div>
  );
};
