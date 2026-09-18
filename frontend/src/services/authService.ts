import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendPasswordResetEmail
} from "firebase/auth";
import type { ConfirmationResult } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import type { UserProfile, Role } from "../schemas/user";

export class AuthService {
  /**
   * Registers a new user with Email and Password
   */
  static async registerWithEmail(email: string, password: string, fullName: string): Promise<UserProfile> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        phoneNumber: null,
        displayName: fullName,
        role: null, // Pending selection
        accountStatus: 'active',
        emailVerified: user.emailVerified,
        phoneVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      // Save to Firestore
      await setDoc(doc(db, "users", user.uid), {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });

      return userProfile;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Logs in an existing user with Email and Password
   */
  static async loginWithEmail(email: string, password: string): Promise<UserProfile> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update last login
      await updateDoc(doc(db, "users", user.uid), {
        lastLoginAt: serverTimestamp()
      });

      return await this.getUserProfile(user.uid);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sends OTP to a phone number
   */
  static async sendPhoneOtp(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<ConfirmationResult> {
    try {
      return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Verifies Phone OTP and logs in or registers the user
   */
  static async verifyPhoneOtp(confirmationResult: ConfirmationResult, otp: string): Promise<UserProfile> {
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      let userProfile: UserProfile;
      try {
        userProfile = await this.getUserProfile(user.uid);
        // Existing user, update last login
        await updateDoc(doc(db, "users", user.uid), {
          lastLoginAt: serverTimestamp()
        });
      } catch (e) {
        // New user, create profile
        userProfile = {
          uid: user.uid,
          email: user.email,
          phoneNumber: user.phoneNumber,
          displayName: null,
          role: null,
          accountStatus: 'active',
          emailVerified: user.emailVerified,
          phoneVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        await setDoc(doc(db, "users", user.uid), {
          ...userProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        });
      }

      return userProfile;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sends a password reset email
   */
  static async forgotPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Logs out the current user
   */
  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Retrieves the user profile from Firestore
   */
  static async getUserProfile(uid: string): Promise<UserProfile> {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      throw new Error("User profile not found.");
    }
  }

  /**
   * Updates the user's role
   */
  static async updateUserRole(uid: string, role: Role): Promise<void> {
    if (role === 'ADMIN') throw new Error("Cannot set ADMIN role from client.");
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, { 
      role,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Maps Firebase Auth errors to user-friendly messages
   */
  private static handleAuthError(error: any): Error {
    console.error("Auth Error:", error);
    let message = "An unexpected authentication error occurred.";
    
    switch (error.code) {
      case 'auth/invalid-email':
        message = "The email address is invalid.";
        break;
      case 'auth/user-disabled':
        message = "This account has been disabled.";
        break;
      case 'auth/user-not-found':
        message = "No account found with this email.";
        break;
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        message = "Incorrect email or password.";
        break;
      case 'auth/email-already-in-use':
        message = "An account with this email already exists.";
        break;
      case 'auth/invalid-phone-number':
        message = "The phone number is invalid.";
        break;
      case 'auth/invalid-verification-code':
        message = "The OTP code is incorrect.";
        break;
      case 'auth/code-expired':
        message = "The OTP code has expired. Please request a new one.";
        break;
      case 'auth/too-many-requests':
        message = "Too many attempts. Please try again later.";
        break;
      case 'auth/network-request-failed':
        message = "Network error. Please check your connection.";
        break;
      case 'auth/invalid-api-key':
      case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      case 'auth/api-key-not-valid':
        message = "Invalid Firebase API key. Please update VITE_FIREBASE_API_KEY in frontend/.env with your real Firebase Project API Key, or set VITE_USE_EMULATOR=true to use Firebase Local Emulators.";
        break;
    }
    
    return new Error(message);
  }
}
