import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// ─── Helper: createAuditLog ────────────────────────────────────────────────
async function createAuditLog(
  action: string,
  actorUid: string,
  targetId: string,
  metadata: Record<string, any> = {}
) {
  await db.collection('audit_logs').add({
    action,
    actorUid,
    targetId,
    metadata,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
}

// ─── Helper: isBlocked ────────────────────────────────────────────────────
/**
 * Check if userA has blocked userB OR userB has blocked userA.
 * Used server-side before allowing new conversations or messages.
 */
export async function isBlocked(userAId: string, userBId: string): Promise<boolean> {
  const [aBlocksB, bBlocksA] = await Promise.all([
    db.collection('users').doc(userAId).collection('blockedUsers').doc(userBId).get(),
    db.collection('users').doc(userBId).collection('blockedUsers').doc(userAId).get(),
  ]);
  return aBlocksB.exists || bBlocksA.exists;
}

// ============================================================
// submitVerification
// Creates a verification record for the authenticated user.
// Prevents duplicate PENDING submissions.
// ============================================================
export const submitVerification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const uid = context.auth.uid;
  const { type, submittedData } = data as {
    type: string;
    submittedData?: Record<string, string>;
  };

  const validTypes = ['IDENTITY', 'EMPLOYER', 'CONTRACTOR', 'PHONE', 'EMAIL'];
  if (!type || !validTypes.includes(type)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid verification type');
  }

  // Verify user exists and has a role
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User not found');
  }

  const userRole = userDoc.data()?.role;

  // Type-role consistency checks
  if (type === 'EMPLOYER' && userRole !== 'EMPLOYER') {
    throw new functions.https.HttpsError('permission-denied', 'Only employers can submit employer verification');
  }
  if (type === 'CONTRACTOR' && userRole !== 'CONTRACTOR') {
    throw new functions.https.HttpsError('permission-denied', 'Only contractors can submit contractor verification');
  }

  // Prevent duplicate PENDING submission
  const existingPending = await db.collection('verifications')
    .where('userId', '==', uid)
    .where('type', '==', type)
    .where('status', '==', 'PENDING')
    .limit(1)
    .get();

  if (!existingPending.empty) {
    throw new functions.https.HttpsError(
      'already-exists',
      'A verification request is already pending for this type. Please wait for review.'
    );
  }

  // Create the verification record
  const verificationRef = db.collection('verifications').doc();
  const now = admin.firestore.FieldValue.serverTimestamp();

  await verificationRef.set({
    verificationId: verificationRef.id,
    userId: uid,
    type,
    status: 'PENDING',
    submittedData: submittedData || {},
    documentPaths: [],
    submittedAt: now,
    reviewedAt: null,
    reviewedBy: null,
    expiresAt: null,
    rejectionReason: null,
    createdAt: now,
    updatedAt: now,
  });

  // Update profile verificationStatus to pending
  const profileCollection =
    userRole === 'WORKER' ? 'workerProfiles'
    : userRole === 'EMPLOYER' ? 'employerProfiles'
    : 'contractorProfiles';

  await db.collection(profileCollection).doc(uid).update({
    verificationStatus: 'pending',
    updatedAt: now,
  }).catch(() => {}); // Don't fail if profile doesn't exist yet

  await createAuditLog('VERIFICATION_SUBMITTED', uid, verificationRef.id, { type });

  return { success: true, verificationId: verificationRef.id };
});

// ============================================================
// createReport
// Submits a user safety report.
// Prevents duplicate reports (same reporter + target + category within 24h).
// ============================================================
export const createReport = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const uid = context.auth.uid;
  const { targetType, targetId, category, description, conversationId, messageId } = data as {
    targetType: string;
    targetId: string;
    category: string;
    description: string;
    conversationId?: string;
    messageId?: string;
  };

  const validTargetTypes = ['USER', 'JOB', 'APPLICATION', 'MESSAGE', 'CONVERSATION', 'PROJECT', 'TEAM', 'PROFILE'];
  if (!targetType || !validTargetTypes.includes(targetType) || !targetId || !category) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  if (!description || description.trim().length < 5) {
    throw new functions.https.HttpsError('invalid-argument', 'Description must be at least 5 characters');
  }

  if (description.length > 2000) {
    throw new functions.https.HttpsError('invalid-argument', 'Description too long (max 2000 characters)');
  }

  // Prevent self-report on USER/PROFILE targets
  if ((targetType === 'USER' || targetType === 'PROFILE') && targetId === uid) {
    throw new functions.https.HttpsError('invalid-argument', 'You cannot report yourself');
  }

  // Duplicate prevention: same reporter + target + category in last 24 hours
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const duplicateCheck = await db.collection('reports')
    .where('reporterId', '==', uid)
    .where('targetId', '==', targetId)
    .where('category', '==', category)
    .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(cutoff))
    .limit(1)
    .get();

  if (!duplicateCheck.empty) {
    throw new functions.https.HttpsError(
      'already-exists',
      'You have already submitted a similar report recently. Our team is reviewing it.'
    );
  }

  // Determine initial priority from target type
  const highPriorityTargets = ['MESSAGE', 'USER'];
  const priority = highPriorityTargets.includes(targetType) ? 'HIGH' : 'NORMAL';

  const reportRef = db.collection('reports').doc();
  const now = admin.firestore.FieldValue.serverTimestamp();

  await reportRef.set({
    reportId: reportRef.id,
    reporterId: uid,
    targetType,
    targetId,
    category,
    description: description.trim(),
    status: 'OPEN',
    priority,
    evidencePaths: [],
    conversationId: conversationId || null,
    messageId: messageId || null,
    createdAt: now,
    updatedAt: now,
    resolvedAt: null,
    resolvedBy: null,
    resolution: null,
    // Internal: reporter identity NOT exposed to target user
  });

  await createAuditLog('REPORT_CREATED', uid, reportRef.id, { targetType, targetId, category });

  return { success: true, reportId: reportRef.id };
});

// ============================================================
// blockUser
// Adds targetUid to the authenticated user's private block list.
// ============================================================
export const blockUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const uid = context.auth.uid;
  const { targetUid, reason } = data as { targetUid: string; reason?: string };

  if (!targetUid) {
    throw new functions.https.HttpsError('invalid-argument', 'targetUid is required');
  }

  if (targetUid === uid) {
    throw new functions.https.HttpsError('invalid-argument', 'You cannot block yourself');
  }

  // Verify target user exists and is not admin
  const targetDoc = await db.collection('users').doc(targetUid).get();
  if (!targetDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User not found');
  }
  if (targetDoc.data()?.role === 'ADMIN') {
    throw new functions.https.HttpsError('permission-denied', 'Cannot block admin accounts');
  }

  const blockRef = db
    .collection('users').doc(uid)
    .collection('blockedUsers').doc(targetUid);

  await blockRef.set({
    blockedUserId: targetUid,
    blockedAt: admin.firestore.FieldValue.serverTimestamp(),
    reason: reason?.trim() || null,
  });

  return { success: true };
});

// ============================================================
// unblockUser
// Removes targetUid from the authenticated user's block list.
// ============================================================
export const unblockUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const uid = context.auth.uid;
  const { targetUid } = data as { targetUid: string };

  if (!targetUid) {
    throw new functions.https.HttpsError('invalid-argument', 'targetUid is required');
  }

  const blockRef = db
    .collection('users').doc(uid)
    .collection('blockedUsers').doc(targetUid);

  await blockRef.delete();

  return { success: true };
});
