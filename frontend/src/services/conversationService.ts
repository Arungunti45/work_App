import { collection, query, where, orderBy, doc, onSnapshot, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../config/firebase';
import type { Conversation, Message } from '../schemas/messaging';

const functions = getFunctions();

export class ConversationService {
  
  static async getOrCreateApplicationConversation(applicationId: string): Promise<string> {
    const createFn = httpsCallable(functions, 'createConversation');
    const result: any = await createFn({ type: 'JOB_APPLICATION', referenceId: applicationId });
    return result.data.conversationId;
  }

  static subscribeToConversations(uid: string, callback: (conversations: Conversation[]) => void) {
    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', uid),
      orderBy('updatedAt', 'desc')
    );
    
    return onSnapshot(q, (snap) => {
      const convs = snap.docs.map(doc => doc.data() as Conversation);
      callback(convs);
    });
  }

  static subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void) {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(doc => doc.data() as Message);
      callback(msgs);
    });
  }

  static async sendMessage(conversationId: string, senderId: string, text: string, type: 'TEXT' | 'IMAGE' | 'DOCUMENT' = 'TEXT', attachmentIds: string[] = []) {
    const messageRef = doc(collection(db, 'conversations', conversationId, 'messages'));
    const messageData: Message = {
      id: messageRef.id,
      senderId,
      type,
      text,
      attachmentIds,
      status: 'SENT',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const batch = writeBatch(db);
    batch.set(messageRef, messageData);
    
    const convRef = doc(db, 'conversations', conversationId);
    batch.update(convRef, {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await batch.commit();
  }

  static async markAsRead(conversationId: string, uid: string) {
    const participantRef = doc(db, 'conversations', conversationId, 'participants', uid);
    await updateDoc(participantRef, {
      lastReadAt: serverTimestamp()
    }).catch(e => {
      console.warn("Could not update lastReadAt. Participant record might not exist if created implicitly.", e);
    });
  }
}
