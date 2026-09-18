import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type { WorkerProfile, EmployerProfile, ContractorProfile } from '../schemas/profile';

type ProfileTypeMap = {
  WORKER: WorkerProfile;
  EMPLOYER: EmployerProfile;
  CONTRACTOR: ContractorProfile;
  ADMIN: any; // Stubs for Admin if needed
};

export class ProfileService {
  
  static getCollectionName(role: keyof ProfileTypeMap): string {
    switch(role) {
      case 'WORKER': return 'workerProfiles';
      case 'EMPLOYER': return 'employerProfiles';
      case 'CONTRACTOR': return 'contractorProfiles';
      default: throw new Error("Invalid role for profile collection");
    }
  }

  static async getProfile<T extends keyof ProfileTypeMap>(uid: string, role: T): Promise<ProfileTypeMap[T] | null> {
    const collectionName = this.getCollectionName(role);
    const docRef = doc(db, collectionName, uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as ProfileTypeMap[T];
    }
    return null;
  }

  static async saveProfile<T extends keyof ProfileTypeMap>(uid: string, role: T, data: Partial<ProfileTypeMap[T]>): Promise<void> {
    const collectionName = this.getCollectionName(role);
    const docRef = doc(db, collectionName, uid);
    const snap = await getDoc(docRef);
    
    // Calculate completeness (mock simple logic, can be expanded)
    let completeness = 0;
    const fields = Object.keys(data);
    if (fields.length > 3) completeness = 50;
    if (fields.length > 7) completeness = 100;
    
    const payload = {
      ...data,
      profileCompleteness: completeness,
      updatedAt: serverTimestamp(),
    };

    if (snap.exists()) {
      await updateDoc(docRef, payload);
    } else {
      await setDoc(docRef, {
        ...payload,
        createdAt: serverTimestamp()
      });
    }
  }

  static async uploadMedia(_uid: string, path: string, file: File, onProgress?: (progress: number) => void): Promise<string> {
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error) => {
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  }
}
