import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { createNotification, sendPushToUser } from './notifications';

const db = admin.firestore();

export const scheduleInterview = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { applicationId, scheduledAt, durationMinutes, mode, location, meetingUrl, notes } = data;
  const uid = context.auth.uid;

  const appRef = db.collection('applications').doc(applicationId);
  const appDoc = await appRef.get();
  
  if (!appDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Application not found');
  }

  const appData = appDoc.data()!;
  if (appData.employerId !== uid) {
    throw new functions.https.HttpsError('permission-denied', 'Unauthorized');
  }

  const interviewRef = db.collection('interviews').doc();
  const interviewData = {
    id: interviewRef.id,
    applicationId,
    jobId: appData.jobId,
    workerId: appData.workerId,
    employerId: appData.employerId,
    scheduledAt,
    durationMinutes: durationMinutes || 30,
    mode: mode || 'ONLINE',
    location: location || null,
    meetingUrl: meetingUrl || null,
    notes: notes || null,
    status: 'SCHEDULED',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await interviewRef.set(interviewData);

  // Update application status to INTERVIEW_SCHEDULED
  await appRef.update({
    status: 'INTERVIEW_SCHEDULED',
    interviewScheduledAt: admin.firestore.FieldValue.serverTimestamp(),
    lastStatusChangedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  await db.collection('applications').doc(applicationId).collection('statusHistory').add({
    applicationId,
    status: 'INTERVIEW_SCHEDULED',
    changedBy: uid,
    changedAt: admin.firestore.FieldValue.serverTimestamp(),
    reason: 'Interview scheduled'
  });

  // Notify worker about interview
  const jobDoc = await db.collection('jobs').doc(appData.jobId).get();
  const jobTitle = jobDoc.data()?.title || 'Job';
  const schedDate = scheduledAt ? new Date(scheduledAt).toLocaleDateString() : 'soon';
  await createNotification({
    recipientId: appData.workerId,
    type: 'INTERVIEW_SCHEDULED',
    category: 'INTERVIEWS',
    title: 'Interview scheduled',
    body: `Interview for ${jobTitle} is scheduled on ${schedDate}.`,
    priority: 'HIGH',
    route: `/my-applications/${applicationId}`,
    entityType: 'INTERVIEW',
    entityId: interviewRef.id,
    idempotencyKey: `INTERVIEW_SCHEDULED_${interviewRef.id}`,
  });
  await sendPushToUser(
    appData.workerId,
    'Interview scheduled',
    `Your interview for ${jobTitle} is on ${schedDate}.`
  );

  // Store reminder flags for scheduled reminder function
  await interviewRef.update({ reminder24hSent: false, reminder1hSent: false });

  return { success: true, interviewId: interviewRef.id };
});

export const updateInterviewStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { interviewId, status } = data;
  const uid = context.auth.uid;

  const interviewRef = db.collection('interviews').doc(interviewId);
  const doc = await interviewRef.get();

  if (!doc.exists) {
    throw new functions.https.HttpsError('not-found', 'Interview not found');
  }

  if (doc.data()!.employerId !== uid) {
    throw new functions.https.HttpsError('permission-denied', 'Unauthorized');
  }

  const interviewData = doc.data()!;
  await interviewRef.update({
    status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Notify worker of status change
  const statusNotifMap: Record<string, { title: string; body: string }> = {
    RESCHEDULED: { title: 'Interview rescheduled', body: 'Your interview has been rescheduled. Please check the new details.' },
    CANCELLED:   { title: 'Interview cancelled',   body: 'Your interview has been cancelled by the employer.' },
    COMPLETED:   { title: 'Interview completed',   body: 'Your interview has been marked as completed.' },
  };
  const notifData = statusNotifMap[status];
  if (notifData) {
    await createNotification({
      recipientId: interviewData.workerId,
      type: `INTERVIEW_${status}` as any,
      category: 'INTERVIEWS',
      title: notifData.title,
      body: notifData.body,
      priority: status === 'CANCELLED' ? 'HIGH' : 'NORMAL',
      route: `/my-applications/${interviewData.applicationId}`,
      entityType: 'INTERVIEW',
      entityId: interviewId,
      idempotencyKey: `INTERVIEW_${status}_${interviewId}`,
    });
    await sendPushToUser(interviewData.workerId, notifData.title, notifData.body);
  }

  return { success: true };
});
