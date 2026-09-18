/**
 * safetyService.ts
 * Thin orchestration layer that composes block + verification + report checks.
 * Used by UI components that need combined safety state.
 */
import { BlockService } from './blockService';

export class SafetyService {
  /**
   * Checks if communication should be allowed between two users.
   * This is a client-side UX check only — server enforces authoritatively.
   */
  static async canCommunicate(myUid: string, targetUid: string): Promise<boolean> {
    const blocked = await BlockService.isBlocked(myUid, targetUid);
    return !blocked;
  }

  /**
   * Get a user's verified status for display purposes.
   * Returns true only if verificationStatus is explicitly 'VERIFIED'.
   */
  static isProfileVerified(verificationStatus?: string): boolean {
    return verificationStatus === 'verified' || verificationStatus === 'VERIFIED';
  }
}
