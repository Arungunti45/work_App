import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Verification, SubmitVerificationPayload } from '../types/safety';

const functions = getFunctions();

export class VerificationService {
  /**
   * Submit a verification request via Cloud Function.
   * Returns the new verificationId.
   */
  static async submitVerification(payload: SubmitVerificationPayload): Promise<string> {
    const fn = httpsCallable<SubmitVerificationPayload, { verificationId: string }>(
      functions,
      'submitVerification'
    );
    const result = await fn(payload);
    return result.data.verificationId;
  }

  /**
   * Get all verification records for the current user.
   * Cloud Function creates them; user reads their own.
   */
  static async getMyVerifications(uid: string): Promise<Verification[]> {
    const q = query(
      collection(db, 'verifications'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      ...d.data(),
      verificationId: d.id,
      submittedAt: d.data().submittedAt?.toDate?.()?.toISOString() ?? '',
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? '',
      updatedAt: d.data().updatedAt?.toDate?.()?.toISOString() ?? '',
    })) as Verification[];
  }

  /**
   * Get the most recent verification of a given type for a user.
   */
  static async getVerificationByType(
    uid: string,
    type: string
  ): Promise<Verification | null> {
    const q = query(
      collection(db, 'verifications'),
      where('userId', '==', uid),
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return {
      ...d.data(),
      verificationId: d.id,
      submittedAt: d.data().submittedAt?.toDate?.()?.toISOString() ?? '',
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? '',
      updatedAt: d.data().updatedAt?.toDate?.()?.toISOString() ?? '',
    } as Verification;
  }
}
