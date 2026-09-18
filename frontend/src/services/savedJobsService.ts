import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { SavedJob } from '../types/jobDiscovery';
import type { Job } from '../schemas/job';

export class SavedJobsService {
  static async toggleSaveJob(userId: string, jobId: string): Promise<boolean> {
    const docRef = doc(db, 'users', userId, 'savedJobs', jobId);
    const snap = await getDoc(docRef);
    
    if (snap.exists()) {
      await deleteDoc(docRef);
      return false; // Unsaved
    } else {
      await setDoc(docRef, {
        jobId,
        savedAt: serverTimestamp()
      });
      return true; // Saved
    }
  }

  static async isJobSaved(userId: string, jobId: string): Promise<boolean> {
    const docRef = doc(db, 'users', userId, 'savedJobs', jobId);
    const snap = await getDoc(docRef);
    return snap.exists();
  }

  static async getSavedJobs(userId: string): Promise<{ savedAt: any, job: Job | null }[]> {
    const savedRef = collection(db, 'users', userId, 'savedJobs');
    const snap = await getDocs(savedRef);
    
    const savedRecords = snap.docs.map(doc => doc.data() as SavedJob);
    
    // Fetch actual job details
    const results = await Promise.all(savedRecords.map(async (record) => {
      const jobDoc = await getDoc(doc(db, 'jobs', record.jobId));
      return {
        savedAt: record.savedAt,
        job: jobDoc.exists() ? (jobDoc.data() as Job) : null
      };
    }));
    
    return results;
  }
}
