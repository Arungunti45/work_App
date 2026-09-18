import type { Job } from '../schemas/job';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export class JobDiscoveryService {
  /**
   * Centralized logic to determine if a job is eligible for public discovery.
   */
  static isJobDiscoverable(job: Job): boolean {
    return job.status === 'PUBLISHED' && job.moderationStatus === 'APPROVED';
  }

  static async getRecentlyPostedJobs(maxCount: number = 10): Promise<Job[]> {
    const q = query(
      collection(db, 'jobs'),
      where('moderationStatus', '==', 'APPROVED'),
      where('status', '==', 'PUBLISHED'),
      orderBy('publishedAt', 'desc'),
      limit(maxCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as Job);
  }

  static async getUrgentJobs(maxCount: number = 10): Promise<Job[]> {
    const q = query(
      collection(db, 'jobs'),
      where('moderationStatus', '==', 'APPROVED'),
      where('status', '==', 'PUBLISHED'),
      where('urgent', '==', true),
      orderBy('publishedAt', 'desc'),
      limit(maxCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as Job);
  }

  static async getDailyJobs(maxCount: number = 10): Promise<Job[]> {
    const q = query(
      collection(db, 'jobs'),
      where('moderationStatus', '==', 'APPROVED'),
      where('status', '==', 'PUBLISHED'),
      where('workType', '==', 'DAILY'),
      orderBy('publishedAt', 'desc'),
      limit(maxCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as Job);
  }
}
