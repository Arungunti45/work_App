// ============================================================
// Phase 10: Trust, Safety, Verification, Reporting & Blocking
// Centralized TypeScript types
// ============================================================

// ─── Verification ────────────────────────────────────────────

export type VerificationStatus =
  | 'NOT_STARTED'
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'SUSPENDED';

export type VerificationType =
  | 'IDENTITY'
  | 'EMPLOYER'
  | 'CONTRACTOR'
  | 'PHONE'
  | 'EMAIL';

export interface Verification {
  verificationId: string;
  userId: string;
  type: VerificationType;
  status: VerificationStatus;
  submittedData?: Record<string, string>; // non-sensitive metadata only
  documentPaths?: string[];               // Storage paths — admin access only
  submittedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  expiresAt?: string | null;
  rejectionReason?: string | null;        // Safe to show owner; no internal notes
  createdAt: string;
  updatedAt: string;
}

export interface SubmitVerificationPayload {
  type: VerificationType;
  submittedData?: Record<string, string>;
  documentPaths?: string[];
}

// ─── Reports ──────────────────────────────────────────────────

export type ReportTargetType =
  | 'USER'
  | 'JOB'
  | 'APPLICATION'
  | 'MESSAGE'
  | 'CONVERSATION'
  | 'PROJECT'
  | 'TEAM'
  | 'PROFILE';

export type ReportStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'ACTION_REQUIRED'
  | 'RESOLVED'
  | 'DISMISSED';

export type ReportPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface ReportCategory {
  targetType: ReportTargetType;
  label: string;
  value: string;
}

export interface Report {
  reportId: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  category: string;
  description: string;
  status: ReportStatus;
  priority: ReportPriority;
  evidencePaths?: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  resolution?: string | null;
}

export interface CreateReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  category: string;
  description: string;
  evidencePaths?: string[];
  // Extra context for message reports
  conversationId?: string;
  messageId?: string;
}

// Report categories per target type
export const REPORT_CATEGORIES: Record<ReportTargetType, string[]> = {
  USER: [
    'Harassment',
    'Spam',
    'Impersonation',
    'Fraudulent behavior',
    'Inappropriate behavior',
    'Safety concern',
  ],
  PROFILE: [
    'Fake profile',
    'Impersonation',
    'Misleading information',
    'Inappropriate content',
  ],
  JOB: [
    'Fake job',
    'Scam',
    'Misleading information',
    'Inappropriate content',
    'Illegal activity concern',
    'Duplicate job',
  ],
  MESSAGE: [
    'Harassment',
    'Spam',
    'Threatening content',
    'Inappropriate content',
    'Scam',
  ],
  CONVERSATION: [
    'Harassment',
    'Spam',
    'Threatening content',
    'Inappropriate content',
    'Scam',
  ],
  APPLICATION: [
    'Spam application',
    'Fraudulent application',
    'Inappropriate content',
  ],
  PROJECT: [
    'Fake project',
    'Scam',
    'Misleading information',
    'Inappropriate content',
  ],
  TEAM: [
    'Spam',
    'Fraudulent behavior',
    'Inappropriate content',
  ],
};

// ─── Blocking ─────────────────────────────────────────────────

export interface BlockedUser {
  blockedUserId: string;
  blockedAt: string;
  reason?: string;
  // Denormalized display info (fetched separately)
  displayName?: string;
}

// ─── Moderation ───────────────────────────────────────────────

export type ProfileModerationStatus =
  | 'NORMAL'
  | 'FLAGGED'
  | 'UNDER_REVIEW'
  | 'RESTRICTED'
  | 'REMOVED';

export type ModerationAction =
  | 'reviewReport'
  | 'resolveReport'
  | 'dismissReport'
  | 'flagUser'
  | 'restrictUser'
  | 'suspendUser'
  | 'restoreUser'
  | 'approveVerification'
  | 'rejectVerification'
  | 'removeJob'
  | 'restoreJob';

// ─── Account Status ───────────────────────────────────────────
// Mirrors schemas/user.ts AccountStatus — extended here for safety context
export type SafetyAccountStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'BLOCKED' | 'DELETED';
