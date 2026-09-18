import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Report, CreateReportPayload } from '../types/safety';

const functions = getFunctions();

export class ReportService {
  /**
   * Submit a report via Cloud Function.
   */
  static async createReport(payload: CreateReportPayload): Promise<string> {
    const fn = httpsCallable<CreateReportPayload, { reportId: string }>(
      functions,
      'createReport'
    );
    const result = await fn(payload);
    return result.data.reportId;
  }

  /**
   * Get reports submitted by the current user (own reports only).
   */
  static async getMyReports(uid: string): Promise<Report[]> {
    const q = query(
      collection(db, 'reports'),
      where('reporterId', '==', uid),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      ...d.data(),
      reportId: d.id,
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? '',
      updatedAt: d.data().updatedAt?.toDate?.()?.toISOString() ?? '',
    })) as Report[];
  }
}
