import { z } from 'zod';

export const LocationSchema = z.object({
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  area: z.string().min(1, 'Area is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Must be a 6-digit valid pincode'),
  locationText: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const WorkerProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  bio: z.string().optional(),
  profilePhoto: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
  
  // Location
  location: LocationSchema.optional(),
  
  // Professional
  skills: z.array(z.string()).default([]),
  experienceLevel: z.enum(['Fresher', 'Less than 1 year', '1-2 years', '3-5 years', '5+ years']).optional(),
  experienceYears: z.number().min(0).optional(),
  education: z.string().optional(),
  languages: z.array(z.string()).default([]),
  
  // Job Preferences
  expectedWage: z.number().min(0, 'Cannot be negative').optional(),
  salaryType: z.enum(['Monthly', 'Weekly', 'Daily', 'Hourly', 'Fixed Contract']).optional(),
  workTypes: z.array(z.string()).default([]),
  
  // Availability
  availableNow: z.boolean().default(true),
  availableFrom: z.string().optional(), // ISO Date
  
  // Portfolio
  portfolioPhotos: z.array(z.string()).default([]),
  
  // System
  verificationStatus: z.enum(['unverified', 'pending', 'verified', 'rejected']).default('unverified'),
  profileCompleteness: z.number().min(0).max(100).default(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const EmployerProfileSchema = z.object({
  companyName: z.string().min(2, 'Company/Employer name is required'),
  description: z.string().optional(),
  logo: z.string().optional(),
  businessCategory: z.string().min(1, 'Business category is required'),
  
  // Location
  location: LocationSchema.optional(),
  
  // Details
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  contactPolicy: z.string().optional(),
  companyPhotos: z.array(z.string()).default([]),
  
  // System
  verificationStatus: z.enum(['unverified', 'pending', 'verified', 'rejected']).default('unverified'),
  profileCompleteness: z.number().min(0).max(100).default(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const ContractorProfileSchema = z.object({
  contractorName: z.string().min(2, 'Contractor name is required'),
  companyName: z.string().optional(),
  profilePhoto: z.string().optional(),
  description: z.string().optional(),
  businessCategory: z.string().min(1, 'Business category is required'),
  
  // Location
  location: LocationSchema.optional(),
  
  // Team
  workerTypes: z.array(z.string()).default([]),
  teamSize: z.number().min(1, 'Team size must be at least 1').optional(),
  experienceYears: z.number().min(0).optional(),
  
  // System
  verificationStatus: z.enum(['unverified', 'pending', 'verified', 'rejected']).default('unverified'),
  profileCompleteness: z.number().min(0).max(100).default(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type LocationType = z.infer<typeof LocationSchema>;
export type WorkerProfile = z.infer<typeof WorkerProfileSchema>;
export type EmployerProfile = z.infer<typeof EmployerProfileSchema>;
export type ContractorProfile = z.infer<typeof ContractorProfileSchema>;
