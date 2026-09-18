import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { AuthService } from '../services/authService';
import { ProfileService } from '../services/profileService';
import type { UserProfile, Role } from '../schemas/user';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  role: Role | null;
  onboardingComplete: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const profile = await AuthService.getUserProfile(uid);
      setUserProfile(profile);
      
      if (profile.role && profile.role !== 'ADMIN') {
        const roleProfile = await ProfileService.getProfile(uid, profile.role);
        setOnboardingComplete(roleProfile ? roleProfile.profileCompleteness === 100 : false);
      } else if (profile.role === 'ADMIN') {
        setOnboardingComplete(true);
      } else {
        setOnboardingComplete(false);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserProfile(null);
      setOnboardingComplete(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setUser(firebaseUser);
      
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid);
      } else {
        setUserProfile(null);
        setOnboardingComplete(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    setLoading(true);
    await AuthService.logout();
    // onAuthStateChanged will handle the rest
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      isAuthenticated: !!user && !!userProfile,
      role: userProfile?.role || null,
      onboardingComplete,
      logout,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
