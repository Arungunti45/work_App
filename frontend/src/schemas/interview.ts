import { z } from 'zod';

export const InterviewStatus = z.enum([
  'SCHEDULED',
  'RESCHEDULE_REQUESTED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW'
]);

export const InterviewMode = z.enum(['ONLINE', 'PHONE', 'IN_PERSON']);

export const InterviewSchema = z.object({
  id: z.string(),
  applicationId: z.string(),
  jobId: z.string(),
  workerId: z.string(),
  employerId: z.string(),
  
  scheduledAt: z.string(), // ISO string for strict parsing before storing as Timestamp if needed, or stick to string for UI
  durationMinutes: z.number().int().min(15).max(480).default(30),
  
  mode: InterviewMode.default('ONLINE'),
  location: z.string().optional().nullable(), // For in-person or phone number
  meetingUrl: z.string().url().optional().nullable(), // For online
  
  notes: z.string().max(2000).optional().nullable(), // Employer private notes usually, but keeping simple for now
  
  status: InterviewStatus.default('SCHEDULED'),
  
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export type Interview = z.infer<typeof InterviewSchema>;
