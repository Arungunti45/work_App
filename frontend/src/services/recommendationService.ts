import type { Job } from '../schemas/job';
import type { JobRecommendation, RecommendationReason } from '../types/jobDiscovery';
import { calculateDistance } from '../utils/distance';

export class RecommendationService {
  /**
   * Scores jobs against a worker profile to generate recommendations.
   * This is a client-side implementation for Phase 5.
   */
  static generateRecommendations(jobs: Job[], workerProfile: any): JobRecommendation[] {
    if (!workerProfile) return [];

    const recommendations: JobRecommendation[] = [];

    for (const job of jobs) {
      let score = 0;
      const reasons: RecommendationReason[] = [];

      // 1. Skill Match (High Weight)
      if (workerProfile.skills && workerProfile.skills.length > 0 && job.skillIds) {
        const commonSkills = job.skillIds.filter(s => workerProfile.skills.includes(s));
        if (commonSkills.length > 0) {
          score += 30 * (commonSkills.length / job.skillIds.length);
          reasons.push({ type: 'SKILL', message: 'Matches your skills' });
        }
      }

      // 2. Category Match (High Weight)
      if (workerProfile.categoryId && job.categoryId === workerProfile.categoryId) {
        score += 25;
        reasons.push({ type: 'CATEGORY', message: 'Matches your preferred category' });
      }

      // 3. Location Match (Medium Weight)
      if (workerProfile.latitude && workerProfile.longitude && job.latitude && job.longitude) {
        const dist = calculateDistance(workerProfile.latitude, workerProfile.longitude, job.latitude, job.longitude);
        if (dist <= 25) { // Within 25km
          score += 20;
          reasons.push({ type: 'LOCATION', message: 'Near your location' });
        }
      } else if (workerProfile.city && job.city && workerProfile.city.toLowerCase() === job.city.toLowerCase()) {
        score += 15;
        reasons.push({ type: 'LOCATION', message: 'In your city' });
      }

      // 4. Experience Match (Medium Weight)
      // Basic string match for now
      if (workerProfile.experience && job.experienceLevel === workerProfile.experience) {
        score += 10;
        reasons.push({ type: 'EXPERIENCE', message: 'Matches your experience' });
      }

      // 5. Freshness (Lower Weight)
      if (job.publishedAt) {
        const daysOld = (Date.now() - job.publishedAt.toMillis()) / (1000 * 60 * 60 * 24);
        if (daysOld <= 3) {
          score += 5;
          reasons.push({ type: 'FRESHNESS', message: 'Recently posted' });
        }
      }

      if (score > 20) { // Threshold for recommendation
        recommendations.push({ job, score, reasons });
      }
    }

    // Sort by score descending
    return recommendations.sort((a, b) => b.score - a.score);
  }
}
