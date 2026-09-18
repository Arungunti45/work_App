import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// ============================================================
// Notification Types (mirrored from frontend types)
// ============================================================
type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
type NotificationCategory = 'JOBS' | 'APPLICATIONS' | 'INTERVIEWS' | 'MESSAGES' | 'TEAMS' | 'PROJECTS' | 'ACCOUNT' | 'SYSTEM';
type NotificationType = string; // Kept loose on backend; validated by factory

interface CreateNotificationOptions {
  recipientId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  priority?: NotificationPriority;
  route?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
  idempotencyKey?: string; // prevents duplicate notifications
}

// ============================================================
// Core: createNotification()
// Writes to users/{uid}/notifications/{id}
// Called by other functions — never directly from frontend.
// ============================================================
export async function createNotification(opts: CreateNotificationOptions): Promise<string | null> {
  const {
    recipientId,
    type,
    category,
    title,
    body,
    priority = 'NORMAL',
    route,
    entityType,
    entityId,
    metadata,
    idempotencyKey
  } = opts;

  try {
    const notifCollection = db.collection('users').doc(recipientId).collection('notifications');

    // Idempotency check: if a key is provided, don't create duplicate
    if (idempotencyKey) {
      const existing = await notifCollection
        .where('idempotencyKey', '==', idempotencyKey)
        .limit(1)
        .get();
      if (!existing.empty) {
        console.log(`Notification already exists for key: ${idempotencyKey}`);
        return existing.docs[0].id;
      }
    }

    const notifRef = notifCollection.doc();
    await notifRef.set({
      id: notifRef.id,
      userId: recipientId,
      type,
      category,
      title,
      body,
      priority,
      isRead: false,
      readAt: null,
      route: route || null,
      entityType: entityType || null,
      entityId: entityId || null,
      metadata: metadata || {},
      idempotencyKey: idempotencyKey || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: null,
    });

    return notifRef.id;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}

// ============================================================
// Core: sendPushToUser()
// Sends FCM push notification to all registered tokens for a user.
// Only sends if user has enabled browserPush for the category.
// ============================================================
export async function sendPushToUser(
  uid: string,
  title: string,
  body: string,
  route?: string
): Promise<void> {
  try {
    // Preference checks are done by callers; here we just send to all registered tokens
    const tokensSnap = await db
      .collection('users').doc(uid)
      .collection('notificationTokens')
      .get();

    if (tokensSnap.empty) return;

    const tokens: string[] = tokensSnap.docs.map(d => d.data().token).filter(Boolean);
    if (tokens.length === 0) return;

    // 3. Send via FCM Admin SDK
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: { title, body },
      webpush: {
        notification: {
          title,
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
        },
        fcmOptions: route ? { link: route } : undefined,
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    // 4. Clean up invalid tokens
    const invalidTokenDocs: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const errCode = resp.error?.code;
        if (
          errCode === 'messaging/invalid-registration-token' ||
          errCode === 'messaging/registration-token-not-registered'
        ) {
          invalidTokenDocs.push(tokensSnap.docs[idx].id);
        }
      }
    });

    if (invalidTokenDocs.length > 0) {
      const batch = db.batch();
      invalidTokenDocs.forEach(docId => {
        const ref = db
          .collection('users').doc(uid)
          .collection('notificationTokens').doc(docId);
        batch.delete(ref);
      });
      await batch.commit();
      console.log(`Removed ${invalidTokenDocs.length} stale FCM tokens for user ${uid}`);
    }
  } catch (error) {
    // Push failure must not break the calling function
    console.error('sendPushToUser failed (non-fatal):', error);
  }
}

// ============================================================
// Scheduled: sendInterviewReminders
// Runs every hour, finds interviews 24h and 1h away, sends reminders.
// Idempotency: stores reminder flags on interview document.
// ============================================================
export const sendInterviewReminders = functions.pubsub
  .schedule('every 60 minutes')
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const nowMs = now.toMillis();

    const windows = [
      { label: '24h', msAhead: 24 * 60 * 60 * 1000, flag: 'reminder24hSent' },
      { label: '1h',  msAhead: 60 * 60 * 1000,       flag: 'reminder1hSent'  },
    ];

    for (const window of windows) {
      const windowStart = new Date(nowMs + window.msAhead - 5 * 60 * 1000); // 5-min buffer
      const windowEnd   = new Date(nowMs + window.msAhead + 5 * 60 * 1000);

      const snap = await db.collection('interviews')
        .where('status', '==', 'SCHEDULED')
        .where(window.flag, '==', false)
        .where('scheduledAt', '>=', admin.firestore.Timestamp.fromDate(windowStart))
        .where('scheduledAt', '<=', admin.firestore.Timestamp.fromDate(windowEnd))
        .limit(100)
        .get();

      if (snap.empty) continue;

      const batch = db.batch();
      for (const doc of snap.docs) {
        const interview = doc.data();
        const timeLabel = window.label === '24h' ? 'tomorrow' : 'in 1 hour';

        // Notify worker
        await createNotification({
          recipientId: interview.workerId,
          type: 'INTERVIEW_REMINDER',
          category: 'INTERVIEWS',
          title: `Interview reminder`,
          body: `Your interview is scheduled ${timeLabel}.`,
          priority: 'HIGH',
          route: `/my-applications/${interview.applicationId}`,
          entityType: 'INTERVIEW',
          entityId: doc.id,
          idempotencyKey: `INTERVIEW_REMINDER_${window.label}_${doc.id}_WORKER`,
        });

        // Notify employer
        await createNotification({
          recipientId: interview.employerId,
          type: 'INTERVIEW_REMINDER',
          category: 'INTERVIEWS',
          title: `Upcoming interview`,
          body: `You have an interview scheduled ${timeLabel}.`,
          priority: 'NORMAL',
          route: `/employer/applications`,
          entityType: 'INTERVIEW',
          entityId: doc.id,
          idempotencyKey: `INTERVIEW_REMINDER_${window.label}_${doc.id}_EMPLOYER`,
        });

        // Mark reminder sent on interview
        batch.update(doc.ref, { [window.flag]: true });
      }

      await batch.commit();
      console.log(`Sent ${window.label} reminders for ${snap.size} interviews`);
    }

    return null;
  });

// ============================================================
// Scheduled: cleanupExpiredNotifications
// Runs daily, removes notifications older than 90 days.
// Does NOT touch audit_logs or application history.
// ============================================================
export const cleanupExpiredNotifications = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const cutoffTs = admin.firestore.Timestamp.fromDate(cutoff);

    // We need to iterate users — use collectionGroup query
    const oldNotifs = await db.collectionGroup('notifications')
      .where('createdAt', '<', cutoffTs)
      .limit(500)
      .get();

    if (oldNotifs.empty) {
      console.log('No expired notifications to clean up.');
      return null;
    }

    const batch = db.batch();
    oldNotifs.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`Cleaned up ${oldNotifs.size} old notifications.`);

    return null;
  });
