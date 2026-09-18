import { z } from 'zod';

export const ApplicationStatus = z.enum([
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW_SCHEDULED',
  'INTERVIEW_COMPLETED',
  'OFFERED',
  'HIRED',
  'REJECTED',
  'WITHDRAWN'
]);

export const ApplicationSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  workerId: z.string(),
  employerId: z.string(),
  status: ApplicationStatus.default('SUBMITTED'),
  
  coverMessage: z.string().max(2000).optional().nullable(),
  resumeUrl: z.string().url().optional().nullable(),
  
  appliedAt: z.any().optional(), // Firestore Timestamp
  lastStatusChangedAt: z.any().optional(),
  
  // Specific status timestamps
  shortlistedAt: z.any().optional(),
  interviewScheduledAt: z.any().optional(),
  interviewCompletedAt: z.any().optional(),
  offeredAt: z.any().optional(),
  hiredAt: z.any().optional(),
  rejectedAt: z.any().optional(),
  withdrawnAt: z.any().optional(),
  
  // Audit properties
  updatedAt: z.any().optional(),
});

export const ApplicationStatusHistorySchema = z.object({
  id: z.string(),
  applicationId: z.string(),
  status: ApplicationStatus,
  changedBy: z.string(),
  changedAt: z.any(),
  reason: z.string().optional().nullable(),
});

export type Application = z.infer<typeof ApplicationSchema>;
export type ApplicationHistory = z.infer<typeof ApplicationStatusHistorySchema>;
