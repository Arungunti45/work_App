export type Role = 'WORKER' | 'EMPLOYER' | 'CONTRACTOR' | 'SUPER_ADMIN' | 'KYC_MANAGER' | 'OPERATIONS_MANAGER' | 'FINANCE_MANAGER' | 'SUPPORT_AGENT';
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
