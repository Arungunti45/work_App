import { collection, doc, getDoc, getDocs, setDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db } from '../config/firebase';
import { getFunctions } from 'firebase/functions';
import type { Job, Category, Skill } from '../schemas/job';

const functions = getFunctions();

export class JobService {
  // Categories & Skills
  static async getCategories(): Promise<Category[]> {
    const q = query(collection(db, 'categories'), where('status', '==', 'ACTIVE'), orderBy('sortOrder'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Category);
  }

  static async getSkills(categoryId?: string): Promise<Skill[]> {
    let q = query(collection(db, 'skills'), where('status', '==', 'ACTIVE'), orderBy('sortOrder'));
    if (categoryId) {
      q = query(collection(db, 'skills'), where('categoryId', '==', categoryId), where('status', '==', 'ACTIVE'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Skill);
  }

  // Employer Job Drafting & Management
  static async saveJobDraft(job: Partial<Job>, jobId?: string): Promise<string> {
    const jobsRef = collection(db, 'jobs');
    const docRef = jobId ? doc(jobsRef, jobId) : doc(jobsRef);
    
    const payload = {
      ...job,
      id: docRef.id,
      status: 'DRAFT',
      moderationStatus: 'NOT_SUBMITTED',
      updatedAt: serverTimestamp(),
    };

    if (!jobId) {
      (payload as any).createdAt = serverTimestamp();
    }

    await setDoc(docRef, payload, { merge: true });
    return docRef.id;
  }

  static async getEmployerJobs(employerId: string): Promise<Job[]> {
    const q = query(collection(db, 'jobs'), where('employerId', '==', employerId), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Job);
  }

  static async getJob(jobId: string): Promise<Job | null> {
    const docRef = doc(db, 'jobs', jobId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Job;
    }
    return null;
  }

  // Cloud Function triggers for State changes
  static async submitForModeration(jobId: string): Promise<void> {
    const submitJob = httpsCallable(functions, 'submitJobForModeration');
    await submitJob({ jobId });
  }

  static async publishJob(jobId: string): Promise<void> {
    const publish = httpsCallable(functions, 'publishJob');
    await publish({ jobId });
  }

  // Admin Actions
  static async getPendingModerationJobs(): Promise<Job[]> {
    const q = query(collection(db, 'jobs'), where('moderationStatus', '==', 'PENDING'), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Job);
  }

  static async moderateJob(jobId: string, action: 'APPROVE' | 'REJECT', reason?: string): Promise<void> {
    const moderate = httpsCallable(functions, 'moderateJob');
    await moderate({ jobId, action, reason });
  }

  // Public Discovery
  static async getPublishedJobs(): Promise<Job[]> {
    const q = query(collection(db, 'jobs'), 
                    where('moderationStatus', '==', 'APPROVED'), 
                    where('status', '==', 'PUBLISHED'),
                    orderBy('publishedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Job);
  }
}
