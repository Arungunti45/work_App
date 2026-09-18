import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../config/firebase';
import type { Application, ApplicationHistory } from '../schemas/application';

const functions = getFunctions();

export class ApplicationService {
  
  static async getWorkerApplications(workerId: string): Promise<Application[]> {
    const q = query(
      collection(db, 'applications'),
      where('workerId', '==', workerId),
      orderBy('appliedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as Application);
  }

  static async getEmployerApplications(employerId: string, jobId?: string): Promise<Application[]> {
    let q;
    if (jobId) {
      q = query(
        collection(db, 'applications'),
        where('employerId', '==', employerId),
        where('jobId', '==', jobId),
        orderBy('appliedAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'applications'),
        where('employerId', '==', employerId),
        orderBy('appliedAt', 'desc')
      );
    }
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as Application);
  }

  static async getApplication(applicationId: string): Promise<Application | null> {
    const snap = await getDoc(doc(db, 'applications', applicationId));
    return snap.exists() ? (snap.data() as Application) : null;
  }

  static async getApplicationHistory(applicationId: string): Promise<ApplicationHistory[]> {
    const q = query(
      collection(db, 'applications', applicationId, 'statusHistory'),
      orderBy('changedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as ApplicationHistory);
  }

  static async submitApplication(jobId: string, coverMessage?: string, resumeUrl?: string) {
    const submitApp = httpsCallable(functions, 'submitApplication');
    const result = await submitApp({ jobId, coverMessage, resumeUrl });
    return result.data;
  }

  static async updateApplicationStatus(applicationId: string, status: string, message?: string) {
    const changeStatusFn = httpsCallable(functions, 'changeApplicationStatus');
    const result = await changeStatusFn({ applicationId, newStatus: status, reason: message });
    return result.data;
  }

  static async withdraw(applicationId: string) {
    return this.updateApplicationStatus(applicationId, 'WITHDRAWN');
  }

  static async hire(applicationId: string) {
    const hireFn = httpsCallable(functions, 'hireApplicant');
    const result = await hireFn({ applicationId });
    return result.data;
  }

  static async checkDuplicate(jobId: string, workerId: string): Promise<boolean> {
    const q = query(
      collection(db, 'applications'),
      where('jobId', '==', jobId),
      where('workerId', '==', workerId),
      where('status', 'in', ['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFERED', 'HIRED'])
    );
    const snap = await getDocs(q);
    return !snap.empty;
  }
}
