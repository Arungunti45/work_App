import * as admin from 'firebase-admin';

import { CallableRequest } from 'firebase-functions/v2/https';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

const db = admin.firestore();

// Helper for audit logs
async function createAuditLog(
  actorId: string,
  actorRole: string,
  action: string,
  entityType: string,
  entityId: string,
  before: any,
  after: any,
  reason: string = ''
) {
  await db.collection('audit_logs').add({
    actorId,
    actorRole,
    action,
    entityType,
    entityId,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    before,
    after,
    reason,
  });
}

export const submitJobForModeration = onCall(async (request: CallableRequest) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }
  
  const { jobId } = request.data;
  if (!jobId) {
    throw new HttpsError('invalid-argument', 'jobId is required.');
  }

  const jobRef = db.collection('jobs').doc(jobId);
  const jobDoc = await jobRef.get();

  if (!jobDoc.exists) {
    throw new HttpsError('not-found', 'Job not found.');
  }

  const job = jobDoc.data()!;
  
  if (job.employerId !== request.auth.uid) {
    throw new HttpsError('permission-denied', 'You do not own this job.');
  }

  if (job.moderationStatus !== 'NOT_SUBMITTED' && job.moderationStatus !== 'REJECTED') {
    throw new HttpsError('failed-precondition', 'Job is already in moderation or approved.');
  }

  const updateData = {
    status: 'SUBMITTED',
    moderationStatus: 'PENDING',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await jobRef.update(updateData);
  await createAuditLog(request.auth.uid, 'EMPLOYER', 'SUBMIT_JOB', 'jobs', jobId, { status: job.status, moderationStatus: job.moderationStatus }, updateData);

  return { success: true };
});

export const moderateJob = onCall(async (request: CallableRequest) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }

  // Assuming isAdmin validation here. In production, check custom claims or user role.
  const userDoc = await db.collection('users').doc(request.auth.uid).get();
  if (userDoc.data()?.role !== 'ADMIN') {
    throw new HttpsError('permission-denied', 'Must be an admin.');
  }

  const { jobId, action, reason } = request.data; // action: 'APPROVE' or 'REJECT'
  
  if (!jobId || !action) {
    throw new HttpsError('invalid-argument', 'jobId and action are required.');
  }

  const jobRef = db.collection('jobs').doc(jobId);
  const jobDoc = await jobRef.get();

  if (!jobDoc.exists) {
    throw new HttpsError('not-found', 'Job not found.');
  }

  const job = jobDoc.data()!;

  if (action === 'APPROVE') {
    const updateData = {
      moderationStatus: 'APPROVED',
      moderatedBy: request.auth.uid,
      moderatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await jobRef.update(updateData);
    await createAuditLog(request.auth.uid, 'ADMIN', 'APPROVE_JOB', 'jobs', jobId, { moderationStatus: job.moderationStatus }, updateData);
    return { success: true };
  } else if (action === 'REJECT') {
    if (!reason) {
      throw new HttpsError('invalid-argument', 'Reason is required for rejection.');
    }
    const updateData = {
      moderationStatus: 'REJECTED',
      moderationReason: reason,
      moderatedBy: request.auth.uid,
      moderatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await jobRef.update(updateData);
    await createAuditLog(request.auth.uid, 'ADMIN', 'REJECT_JOB', 'jobs', jobId, { moderationStatus: job.moderationStatus }, updateData, reason);
    return { success: true };
  } else {
    throw new HttpsError('invalid-argument', 'Invalid action.');
  }
});

export const publishJob = onCall(async (request: CallableRequest) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }
  
  const { jobId } = request.data;
  
  const jobRef = db.collection('jobs').doc(jobId);
  const jobDoc = await jobRef.get();
  
  if (!jobDoc.exists) {
    throw new HttpsError('not-found', 'Job not found.');
  }
  
  const job = jobDoc.data()!;
  
  if (job.employerId !== request.auth.uid) {
    throw new HttpsError('permission-denied', 'You do not own this job.');
  }

  if (job.moderationStatus !== 'APPROVED') {
    throw new HttpsError('failed-precondition', 'Job must be approved before publishing.');
  }

  const updateData = {
    status: 'PUBLISHED',
    publishedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await jobRef.update(updateData);
  await createAuditLog(request.auth.uid, 'EMPLOYER', 'PUBLISH_JOB', 'jobs', jobId, { status: job.status }, updateData);

  return { success: true };
});
