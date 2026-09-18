/**
 * contentModerationService.ts
 *
 * Abstraction layer for future content moderation integration.
 * Currently provides only client-side basic validation.
 *
 * Future integration points:
 * - Google Cloud Natural Language API for toxic content detection
 * - Firebase ML or Vertex AI for image moderation
 * - Custom Cloud Function backed moderation pipeline
 *
 * IMPORTANT: Client-side checks are not authoritative.
 * All safety enforcement must be verified server-side.
 */

export interface ContentModerationResult {
  isSafe: boolean;
  reason?: string;
}

export class ContentModerationService {
  /**
   * Basic client-side text validation.
   * Does NOT perform AI or ML analysis in this phase.
   */
  static validateText(
    text: string,
    maxLength: number = 5000
  ): ContentModerationResult {
    if (!text || text.trim().length === 0) {
      return { isSafe: false, reason: 'Content cannot be empty' };
    }
    if (text.length > maxLength) {
      return { isSafe: false, reason: `Content exceeds maximum length of ${maxLength} characters` };
    }
    // Check for suspicious URL patterns (very basic)
    const suspiciousPatterns = /bit\.ly|tinyurl\.com|t\.co\/(?!.*twitter)/i;
    if (suspiciousPatterns.test(text)) {
      return { isSafe: false, reason: 'Content contains potentially suspicious links' };
    }
    return { isSafe: true };
  }

  /**
   * Validate an uploaded file's type.
   * Images and PDFs only — no executables.
   */
  static validateFileType(file: File): ContentModerationResult {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'application/pdf',
    ];
    if (!allowedTypes.includes(file.type)) {
      return {
        isSafe: false,
        reason: `File type '${file.type}' is not allowed. Please upload an image or PDF.`,
      };
    }
    return { isSafe: true };
  }

  /**
   * Validate file size.
   */
  static validateFileSize(file: File, maxMb: number = 5): ContentModerationResult {
    const maxBytes = maxMb * 1024 * 1024;
    if (file.size > maxBytes) {
      return {
        isSafe: false,
        reason: `File is too large. Maximum allowed size is ${maxMb}MB.`,
      };
    }
    return { isSafe: true };
  }

  // ─── Future Integration Points ──────────────────────────────────────────
  // When an AI/ML provider is configured, replace the stub below:
  //
  // static async analyzeTextForToxicity(text: string): Promise<ContentModerationResult> {
  //   const fn = httpsCallable(functions, 'moderateContent');
  //   const result = await fn({ text });
  //   return result.data as ContentModerationResult;
  // }
  //
  // static async analyzeImageForSafety(storageUrl: string): Promise<ContentModerationResult> {
  //   // Future: call Cloud Vision API SafeSearch via Cloud Function
  //   return { isSafe: true }; // placeholder
  // }
}
