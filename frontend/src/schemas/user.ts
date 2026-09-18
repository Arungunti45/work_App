export type Role = 'WORKER' | 'EMPLOYER' | 'CONTRACTOR' | 'ADMIN';
export type AccountStatus = 'active' | 'suspended' | 'blocked' | 'pending';

export interface UserProfile {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  role: Role | null;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}
