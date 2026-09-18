import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const envKey = import.meta.env.VITE_FIREBASE_API_KEY;
const isDummyKey = !envKey || envKey === "your_api_key_here";

const firebaseConfig = {
  apiKey: isDummyKey ? "AIzaSyDemoApiKeyGETYOURJOB2026ValidFormat" : envKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "get-your-job-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "get-your-job-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "get-your-job-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:demo123456789012",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
