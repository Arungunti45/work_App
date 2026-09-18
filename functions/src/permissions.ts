import * as admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/v2/https';

export type AdminRole = 'SUPER_ADMIN' | 'KYC_MANAGER' | 'OPERATIONS_MANAGER' | 'FINANCE_MANAGER' | 'SUPPORT_AGENT';

export const ADMIN_ROLES: AdminRole[] = [
  'SUPER_ADMIN',
  'KYC_MANAGER',
  'OPERATIONS_MANAGER',
  'FINANCE_MANAGER',
  'SUPPORT_AGENT'
];

/**
 * Validates that the user is authenticated and has an allowed admin role.
 * Throws HttpsError if unauthorized.
 * 
 * @param uid The user ID from the request auth
 * @param allowedRoles Array of allowed admin roles. If empty, allows any admin role.
 * @returns The user's role
 */
export async function requireAdminAuth(uid: string | undefined, allowedRoles: AdminRole[] = []): Promise<AdminRole> {
  if (!uid) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const userDoc = await admin.firestore().collection('users').doc(uid).get();
  if (!userDoc.exists) {
    throw new HttpsError('not-found', 'User record not found.');
  }

  const userData = userDoc.data();
  const role = userData?.role as string;
  const status = userData?.accountStatus as string;

  if (status === 'suspended' || status === 'blocked') {
    throw new HttpsError('permission-denied', 'Account is suspended or blocked.');
  }

  if (!ADMIN_ROLES.includes(role as AdminRole)) {
    throw new HttpsError('permission-denied', 'User is not an administrator.');
  }

  const adminRole = role as AdminRole;

  if (allowedRoles.length > 0 && !allowedRoles.includes(adminRole)) {
    throw new HttpsError('permission-denied', 'Administrator does not have the required role.');
  }

  return adminRole;
}

/**
 * Logs an administrative action to the audit_logs collection
 */
export async function logAdminAction(params: {
  actorUid: string;
  actorRole: AdminRole;
  action: string;
  targetType: string;
  targetId: string;
  reason?: string;
  metadata?: any;
}) {
  await admin.firestore().collection('audit_logs').add({
    ...params,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
}
