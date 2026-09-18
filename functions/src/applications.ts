import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { createNotification, sendPushToUser } from './notifications';

const db = admin.firestore();

/**
 * Creates an audit log in the global `audit_logs` collection.
 */
async function createAuditLog(action: string, actorUid: string, targetId: string, metadata: any = {}) {
  await db.collection('audit_logs').add({
    action,
    actorUid,
    targetId,
    metadata,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
}

/**
 * Helper to add history to an application.
 */
async function addStatusHistory(applicationId: string, status: string, changedBy: string, reason?: string) {
  await db.collection('applications').doc(applicationId).collection('statusHistory').add({
    applicationId,
    status,
    changedBy,
    changedAt: admin.firestore.FieldValue.serverTimestamp(),
    reason: reason || null
  });
}

export const submitApplication = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { jobId, coverMessage, resumeUrl } = data;
  const workerId = context.auth.uid;

  if (!jobId) {
    throw new functions.https.HttpsError('invalid-argument', 'jobId is required');
  }

  // 1. Verify User Role
  const userDoc = await db.collection('users').doc(workerId).get();
  if (!userDoc.exists || userDoc.data()?.role !== 'WORKER') {
    throw new functions.https.HttpsError('permission-denied', 'Only workers can apply');
  }

  // 2. Verify Job Eligibility
  const jobRef = db.collection('jobs').doc(jobId);
  const jobDoc = await jobRef.get();
  if (!jobDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Job not found');
  }

  const jobData = jobDoc.data();
  if (jobData?.status !== 'PUBLISHED' || jobData?.moderationStatus !== 'APPROVED') {
    throw new functions.https.HttpsError('failed-precondition', 'Job is not open for applications');
  }

  // 3. Prevent Duplicate Application
  const existingApp = await db.collection('applications')
    .where('jobId', '==', jobId)
    .where('workerId', '==', workerId)
    .where('status', 'in', ['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFERED', 'HIRED'])
    .get();

  if (!existingApp.empty) {
    throw new functions.https.HttpsError('already-exists', 'You have already applied to this job');
  }

  // 4. Create Application
  const applicationRef = db.collection('applications').doc();
  const applicationData = {
    id: applicationRef.id,
    jobId,
    workerId,
    employerId: jobData!.employerId,
    status: 'SUBMITTED',
    coverMessage: coverMessage || null,
    resumeUrl: resumeUrl || null,
    appliedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastStatusChangedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await applicationRef.set(applicationData);
  await addStatusHistory(applicationRef.id, 'SUBMITTED', workerId);
  await createAuditLog('APPLICATION_SUBMITTED', workerId, applicationRef.id, { jobId });

  // Notify employer
  const jobDoc2 = await db.collection('jobs').doc(jobId).get();
  const jobTitle = jobDoc2.data()?.title || 'Job';
  await createNotification({
    recipientId: jobData!.employerId,
    type: 'APPLICATION_SUBMITTED',
    category: 'APPLICATIONS',
    title: 'New application received',
    body: `A worker has applied for: ${jobTitle}`,
    priority: 'NORMAL',
    route: `/employer/applications`,
    entityType: 'APPLICATION',
    entityId: applicationRef.id,
    idempotencyKey: `APPLICATION_SUBMITTED_${applicationRef.id}`,
  });
  await sendPushToUser(jobData!.employerId, 'New application received', `A worker applied for: ${jobTitle}`, `/employer/applications`);

  return { success: true, applicationId: applicationRef.id };
});

export const changeApplicationStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { applicationId, newStatus, reason } = data;
  const uid = context.auth.uid;

  if (!applicationId || !newStatus) {
    throw new functions.https.HttpsError('invalid-argument', 'applicationId and newStatus required');
  }

  const appRef = db.collection('applications').doc(applicationId);
  
  return db.runTransaction(async (transaction) => {
    const appDoc = await transaction.get(appRef);
    if (!appDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Application not found');
    }

    const appData = appDoc.data()!;

    // Verification
    const isEmployer = appData.employerId === uid;
    const isWorker = appData.workerId === uid;

    if (!isEmployer && !isWorker) {
      throw new functions.https.HttpsError('permission-denied', 'Unauthorized access');
    }

    if (isWorker && newStatus !== 'WITHDRAWN') {
      throw new functions.https.HttpsError('permission-denied', 'Workers can only withdraw');
    }

    // Update
    const updateData: any = {
      status: newStatus,
      lastStatusChangedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (newStatus === 'SHORTLISTED') updateData.shortlistedAt = updateData.updatedAt;
    if (newStatus === 'REJECTED') updateData.rejectedAt = updateData.updatedAt;
    if (newStatus === 'WITHDRAWN') updateData.withdrawnAt = updateData.updatedAt;

    transaction.update(appRef, updateData);

    // Creating status history inside a transaction requires passing transaction reference, 
    // but FieldValue works for set() in transaction.
    const historyRef = appRef.collection('statusHistory').doc();
    transaction.set(historyRef, {
      applicationId,
      status: newStatus,
      changedBy: uid,
      changedAt: admin.firestore.FieldValue.serverTimestamp(),
      reason: reason || null
    });
  }).then(async () => {
    createAuditLog(`APPLICATION_${newStatus}`, uid, applicationId);

    // Re-fetch app data to get workerId/employerId for notifications
    const appSnap = await db.collection('applications').doc(applicationId).get();
    const app = appSnap.data();
    if (!app) return { success: true };

    const jobSnap = await db.collection('jobs').doc(app.jobId).get();
    const jobTitle = jobSnap.data()?.title || 'Job';

    // Determine who to notify and with what message
    const notifMap: Record<string, { recipientId: string; title: string; body: string; priority: 'LOW' | 'NORMAL' | 'HIGH' }> = {
      UNDER_REVIEW:   { recipientId: app.workerId,   title: 'Application under review',  body: `Your application for ${jobTitle} is now under review.`, priority: 'NORMAL' },
      SHORTLISTED:    { recipientId: app.workerId,   title: 'You have been shortlisted!', body: `Great news! You were shortlisted for ${jobTitle}.`,      priority: 'HIGH'   },
      REJECTED:       { recipientId: app.workerId,   title: 'Application not selected',  body: `Your application for ${jobTitle} was not selected.`,    priority: 'NORMAL' },
      OFFERED:        { recipientId: app.workerId,   title: 'Job offer received!',        body: `You received an offer for ${jobTitle}!`,                  priority: 'HIGH'   },
      WITHDRAWN:      { recipientId: app.employerId, title: 'Applicant withdrew',         body: `An applicant withdrew their application for ${jobTitle}.`, priority: 'NORMAL' },
    };

    const notif = notifMap[newStatus];
    if (notif) {
      await createNotification({
        recipientId: notif.recipientId,
        type: `APPLICATION_${newStatus}` as any,
        category: 'APPLICATIONS',
        title: notif.title,
        body: notif.body,
        priority: notif.priority,
        route: notif.recipientId === app.workerId
          ? `/my-applications/${applicationId}`
          : `/employer/applications/${applicationId}/worker`,
        entityType: 'APPLICATION',
        entityId: applicationId,
        idempotencyKey: `APPLICATION_${newStatus}_${applicationId}`,
      });
      await sendPushToUser(notif.recipientId, notif.title, notif.body);
    }

    return { success: true };
  });
});

export const hireApplicant = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { applicationId } = data;
  const uid = context.auth.uid;

  const appRef = db.collection('applications').doc(applicationId);

  return db.runTransaction(async (transaction) => {
    const appDoc = await transaction.get(appRef);
    if (!appDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Application not found');
    }

    const appData = appDoc.data()!;

    if (appData.employerId !== uid) {
      throw new functions.https.HttpsError('permission-denied', 'Only the employer can hire');
    }

    if (['HIRED', 'REJECTED', 'WITHDRAWN'].includes(appData.status)) {
      throw new functions.https.HttpsError('failed-precondition', 'Cannot hire from current status');
    }

    const jobRef = db.collection('jobs').doc(appData.jobId);
    const jobDoc = await transaction.get(jobRef);
    
    if (!jobDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Job not found');
    }

    const jobData = jobDoc.data()!;
    const workersRequired = jobData.workersRequired || 1;
    const filledCount = jobData.filledCount || 0;

    if (filledCount >= workersRequired) {
      throw new functions.https.HttpsError('failed-precondition', 'Job is already completely filled');
    }

    const newFilledCount = filledCount + 1;
    
    // Update Job
    transaction.update(jobRef, {
      filledCount: newFilledCount,
      status: newFilledCount >= workersRequired ? 'FILLED' : jobData.status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update Application
    transaction.update(appRef, {
      status: 'HIRED',
      hiredAt: admin.firestore.FieldValue.serverTimestamp(),
      lastStatusChangedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const historyRef = appRef.collection('statusHistory').doc();
    transaction.set(historyRef, {
      applicationId,
      status: 'HIRED',
      changedBy: uid,
      changedAt: admin.firestore.FieldValue.serverTimestamp(),
      reason: null
    });
  }).then(async () => {
    createAuditLog('APPLICATION_HIRED', uid, applicationId);

    const appSnap = await db.collection('applications').doc(applicationId).get();
    const app = appSnap.data();
    if (app) {
      const jobSnap = await db.collection('jobs').doc(app.jobId).get();
      const jobTitle = jobSnap.data()?.title || 'Job';
      await createNotification({
        recipientId: app.workerId,
        type: 'APPLICATION_HIRED',
        category: 'APPLICATIONS',
        title: 'Congratulations! You are hired!',
        body: `You have been hired for: ${jobTitle}`,
        priority: 'HIGH',
        route: `/my-applications/${applicationId}`,
        entityType: 'APPLICATION',
        entityId: applicationId,
        idempotencyKey: `APPLICATION_HIRED_${applicationId}`,
      });
      await sendPushToUser(app.workerId, 'Congratulations! You are hired!', `You have been hired for: ${jobTitle}`);
    }

    return { success: true };
  });
});
