import { collection, query, where, orderBy, getDocs, QueryConstraint } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Job } from '../schemas/job';
import type { JobSearchParams } from '../types/jobDiscovery';
import { calculateDistance } from '../utils/distance';

export class JobSearchService {
  /**
   * Search jobs using Firestore constraints where possible, and client-side filtering 
   * for features Firestore lacks (like text search or complex radius calculations).
   * Note: In a production app with heavy traffic, a third party search like Algolia is recommended.
   */
  static async searchJobs(params: JobSearchParams): Promise<Job[]> {
    let constraints: QueryConstraint[] = [
      where('moderationStatus', '==', 'APPROVED'),
      where('status', '==', 'PUBLISHED')
    ];

    if (params.filters.categoryId) {
      constraints.push(where('categoryId', '==', params.filters.categoryId));
    }
    if (params.filters.subcategoryId) {
      constraints.push(where('subcategoryId', '==', params.filters.subcategoryId));
    }
    if (params.filters.isUrgent) {
      constraints.push(where('urgent', '==', true));
    }
    if (params.filters.workType && params.filters.workType.length > 0) {
      constraints.push(where('workType', 'in', params.filters.workType));
    }

    // Default sorting constraint (Required by Firebase if not doing in memory)
    if (params.sortBy === 'NEWEST') {
      constraints.push(orderBy('publishedAt', 'desc'));
    } else if (params.sortBy === 'OLDEST') {
      constraints.push(orderBy('publishedAt', 'asc'));
    }

    const q = query(collection(db, 'jobs'), ...constraints);
    const snap = await getDocs(q);
    
    let results = snap.docs.map(doc => doc.data() as Job);

    // Client-side filtering for limitations of Firestore
    const { searchTerm, skillIds, salaryMin, salaryMax, location } = params.filters;

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      results = results.filter(job => 
        job.title.toLowerCase().includes(lowerTerm) || 
        job.description.toLowerCase().includes(lowerTerm)
      );
    }

    if (skillIds && skillIds.length > 0) {
      results = results.filter(job => 
        job.skillIds.some(skill => skillIds.includes(skill))
      );
    }

    if (salaryMin !== undefined) {
      results = results.filter(job => (job.salaryMin || 0) >= salaryMin || (job.dailyWage || 0) >= salaryMin);
    }

    if (salaryMax !== undefined) {
      results = results.filter(job => (job.salaryMax || Infinity) <= salaryMax || (job.dailyWage || Infinity) <= salaryMax);
    }

    // Radius filtering
    if (location && location.lat && location.lng && location.radiusKm) {
      results = results.filter(job => {
        if (!job.latitude || !job.longitude) return false;
        const dist = calculateDistance(location.lat, location.lng, job.latitude, job.longitude);
        return dist <= location.radiusKm;
      });
    }

    // Client-side sorting overrides (if needed for things not handled by Firestore query)
    if (params.sortBy === 'SALARY_HIGH') {
      results.sort((a, b) => ((b.salaryMax || b.dailyWage || 0) - (a.salaryMax || a.dailyWage || 0)));
    } else if (params.sortBy === 'SALARY_LOW') {
      results.sort((a, b) => ((a.salaryMin || a.dailyWage || 0) - (b.salaryMin || b.dailyWage || 0)));
    } else if (params.sortBy === 'DISTANCE' && location) {
      results.sort((a, b) => {
        const distA = a.latitude && a.longitude ? calculateDistance(location.lat, location.lng, a.latitude, a.longitude) : Infinity;
        const distB = b.latitude && b.longitude ? calculateDistance(location.lat, location.lng, b.latitude, b.longitude) : Infinity;
        return distA - distB;
      });
    }

    // Simple Pagination simulation (For real cursor, we need pure firestore queries without client filtering)
    // To support complex queries without Algolia, we do it in memory here for limits.
    const limitCount = params.limit || 20;
    
    // In a real production setup, client-side filtering breaks standard Firestore cursor pagination.
    // So we just slice the array for MVP phase.
    
    return results.slice(0, limitCount);
  }
}
