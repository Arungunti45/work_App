import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../config/firebase';
import type { Interview } from '../schemas/interview';

const functions = getFunctions();

export class InterviewService {
  
  static async getInterviewsForApplication(applicationId: string): Promise<Interview[]> {
    const q = query(
      collection(db, 'interviews'),
      where('applicationId', '==', applicationId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as Interview);
  }

  static async getWorkerInterviews(workerId: string): Promise<Interview[]> {
    const q = query(
      collection(db, 'interviews'),
      where('workerId', '==', workerId),
      orderBy('scheduledAt', 'asc') // Nearest upcoming first
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as Interview);
  }

  static async getEmployerInterviews(employerId: string): Promise<Interview[]> {
    const q = query(
      collection(db, 'interviews'),
      where('employerId', '==', employerId),
      orderBy('scheduledAt', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as Interview);
  }

  static async scheduleInterview(params: {
    applicationId: string,
    scheduledAt: string,
    durationMinutes: number,
    mode: string,
    location?: string,
    meetingUrl?: string,
    notes?: string
  }) {
    const scheduleFn = httpsCallable(functions, 'scheduleInterview');
    const result = await scheduleFn(params);
    return result.data;
  }

  static async updateInterviewStatus(interviewId: string, status: string) {
    const updateFn = httpsCallable(functions, 'updateInterviewStatus');
    const result = await updateFn({ interviewId, status });
    return result.data;
  }
}
