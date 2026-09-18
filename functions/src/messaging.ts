import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { createNotification, sendPushToUser } from './notifications';
import { isBlocked } from './safety';

const db = admin.firestore();

export const createConversation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { type, referenceId } = data; // type: 'JOB_APPLICATION', referenceId: applicationId
  const uid = context.auth.uid;

  if (type !== 'JOB_APPLICATION') {
    throw new functions.https.HttpsError('invalid-argument', 'Only JOB_APPLICATION type is currently supported for creation via UI');
  }

  // 1. Verify Application
  const appRef = db.collection('applications').doc(referenceId);
  const appDoc = await appRef.get();

  if (!appDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Application not found');
  }

  const appData = appDoc.data()!;
  
  // 2. Validate Membership
  const workerId = appData.workerId;
  const employerId = appData.employerId;

  if (uid !== workerId && uid !== employerId) {
    throw new functions.https.HttpsError('permission-denied', 'Only authorized participants can start a conversation');
  }

  // 3. Block check — server-side enforcement
  if (await isBlocked(workerId, employerId)) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Communication is not available between these accounts.'
    );
  }

  // 3. Create deterministic ID to prevent duplicates
  const conversationId = `JOB_APPLICATION_${referenceId}`;
  const conversationRef = db.collection('conversations').doc(conversationId);

  return db.runTransaction(async (transaction) => {
    const doc = await transaction.get(conversationRef);
    if (doc.exists) {
      // Already exists, return it
      return { success: true, conversationId };
    }

    // 4. Create Conversation
    const conversationData = {
      id: conversationId,
      type: 'JOB_APPLICATION',
      applicationId: referenceId,
      jobId: appData.jobId,
      createdBy: uid,
      participantIds: [workerId, employerId],
      status: 'ACTIVE',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    transaction.set(conversationRef, conversationData);

    // 5. Create Participant records
    const workerParticipantRef = conversationRef.collection('participants').doc(workerId);
    const employerParticipantRef = conversationRef.collection('participants').doc(employerId);

    transaction.set(workerParticipantRef, {
      uid: workerId,
      role: 'WORKER',
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      isMuted: false
    });

    transaction.set(employerParticipantRef, {
      uid: employerId,
      role: 'EMPLOYER',
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      isMuted: false
    });
    
    return { success: true, conversationId };
  }).then((result) => {
    return result;
  });
});

// ============================================================
// Firestore trigger: onMessageCreated
// Fires when a message is written to conversations/{id}/messages/{id}
// Notifies the other participant that they have a new message.
// ============================================================
export const onMessageCreated = functions.firestore
  .document('conversations/{conversationId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const { conversationId } = context.params;

    if (!message || message.type === 'SYSTEM') return null;

    const senderId: string = message.senderId;
    if (!senderId) return null;

    // Get the conversation to find the other participant(s)
    const convSnap = await db.collection('conversations').doc(conversationId).get();
    if (!convSnap.exists) return null;

    const conv = convSnap.data()!;
    const participantIds: string[] = conv.participantIds || [];

    // Notify everyone except the sender
    const recipients = participantIds.filter(uid => uid !== senderId);

    // Get sender display name
    const senderSnap = await db.collection('users').doc(senderId).get();
    const senderName = senderSnap.data()?.displayName || 'Someone';

    for (const recipientId of recipients) {
      await createNotification({
        recipientId,
        type: 'NEW_MESSAGE',
        category: 'MESSAGES',
        title: `New message from ${senderName}`,
        body: 'You have a new message.',
        priority: 'NORMAL',
        route: `/messages/${conversationId}`,
        entityType: 'CONVERSATION',
        entityId: conversationId,
        // Idempotency per message — prevents duplicate if trigger fires twice
        idempotencyKey: `NEW_MESSAGE_${snap.id}_${recipientId}`,
      });
      await sendPushToUser(
        recipientId,
        `New message from ${senderName}`,
        'You have a new message.',
        `/messages/${conversationId}`
      );
    }

    return null;
  });
