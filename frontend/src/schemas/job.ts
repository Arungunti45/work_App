import { z } from 'zod';


export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  parentCategoryId: z.string().optional().nullable(),
  type: z.enum(['Main Category', 'Subcategory']),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  sortOrder: z.number().default(0),
  createdAt: z.any().optional(), // Server timestamp
  updatedAt: z.any().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  categoryId: z.string(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  sortOrder: z.number().default(0),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export const JobStatus = z.enum(['DRAFT', 'SUBMITTED', 'PUBLISHED', 'PAUSED', 'FILLED', 'CLOSED', 'ARCHIVED']);
export const ModerationStatus = z.enum(['NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED']);

export const JobSchema = z.object({
  id: z.string(),
  employerId: z.string(),
  contractorId: z.string().optional().nullable(),
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title is too long"),
  slug: z.string().optional(),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().optional().nullable(),
  skillIds: z.array(z.string()).default([]),
  
  // Location (Flat + Object for querying ease if needed)
  locationText: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  area: z.string().optional(),
  pincode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  locationVisibility: z.enum(['PUBLIC', 'APPROXIMATE']).default('APPROXIMATE'),
  
  // Salary
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  dailyWage: z.number().min(0).optional(),
  salaryType: z.enum(['MONTHLY', 'WEEKLY', 'DAILY', 'HOURLY', 'FIXED_CONTRACT']).optional(),
  
  // Requirements
  workersRequired: z.number().int().min(1).default(1),
  filledCount: z.number().int().min(0).default(0),
  experienceLevel: z.enum(['Fresher', 'Less than 1 year', '1-2 years', '3-5 years', '5+ years']).optional(),
  experienceYears: z.number().min(0).optional(),
  
  // Work specifics
  workType: z.enum(['FULL_TIME', 'PART_TIME', 'DAILY', 'CONTRACT', 'TEMPORARY', 'PERMANENT', 'REMOTE', 'ON_SITE']).optional(),
  workingHours: z.string().optional(),
  duration: z.string().optional(),
  
  // Dates
  startDate: z.string().optional(), // ISO String
  applicationDeadline: z.string().optional(), // ISO String
  
  urgent: z.boolean().default(false),
  
  // Lifecycle
  status: JobStatus.default('DRAFT'),
  moderationStatus: ModerationStatus.default('NOT_SUBMITTED'),
  
  // Audit/Moderation data (managed by server)
  moderationReason: z.string().optional().nullable(),
  moderatedBy: z.string().optional().nullable(),
  moderatedAt: z.any().optional().nullable(),
  publishedAt: z.any().optional().nullable(),
  pausedAt: z.any().optional().nullable(),
  closedAt: z.any().optional().nullable(),
  archivedAt: z.any().optional().nullable(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export type Category = z.infer<typeof CategorySchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Job = z.infer<typeof JobSchema>;
