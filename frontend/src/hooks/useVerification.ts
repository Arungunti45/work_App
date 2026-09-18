import { useState, useEffect } from 'react';
import { VerificationService } from '../services/verificationService';
import type { Verification, SubmitVerificationPayload, VerificationType } from '../types/safety';

export function useVerification(uid: string | null, type?: VerificationType) {
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }

    const load = async () => {
      setLoading(true);
      try {
        if (type) {
          const v = await VerificationService.getVerificationByType(uid, type);
          setVerification(v);
        } else {
          const all = await VerificationService.getMyVerifications(uid);
          setVerification(all[0] ?? null);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load verification');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [uid, type]);

  const submit = async (payload: SubmitVerificationPayload): Promise<boolean> => {
    if (!uid) return false;
    setSubmitting(true);
    setError(null);
    try {
      await VerificationService.submitVerification(payload);
      // Reload after submission
      if (type) {
        const v = await VerificationService.getVerificationByType(uid, type);
        setVerification(v);
      }
      return true;
    } catch (e: any) {
      setError(e.message || 'Submission failed');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { verification, loading, error, submitting, submit, setError };
}
