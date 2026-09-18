import type { Job } from '../schemas/job';

export interface JobSearchFilters {
  searchTerm?: string;
  categoryId?: string;
  subcategoryId?: string;
  skillIds?: string[];
  workType?: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryType?: string;
  experienceLevel?: string[];
  isUrgent?: boolean;
  postedWithinDays?: number;
  location?: {
    lat: number;
    lng: number;
    radiusKm: number;
  };
}

export type JobSortOption = 'RELEVANCE' | 'NEWEST' | 'OLDEST' | 'SALARY_HIGH' | 'SALARY_LOW' | 'DISTANCE';

export interface JobSearchParams {
  filters: JobSearchFilters;
  sortBy: JobSortOption;
  limit?: number;
  startAfterId?: string; 
}

export interface SavedJob {
  jobId: string;
  savedAt: any; // Firestore Timestamp
}

export interface RecommendationReason {
  type: 'SKILL' | 'CATEGORY' | 'LOCATION' | 'EXPERIENCE' | 'WORK_TYPE' | 'FRESHNESS';
  message: string;
}

export interface JobRecommendation {
  job: Job;
  score: number;
  reasons: RecommendationReason[];
}
