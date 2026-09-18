import { useState, useCallback } from 'react';
import { SafetyService } from '../services/safetyService';

export function useSafety(myUid: string | null) {
  const [checkingCommunication, setCheckingCommunication] = useState(false);

  const canCommunicateWith = useCallback(async (targetUid: string): Promise<boolean> => {
    if (!myUid) return false;
    setCheckingCommunication(true);
    try {
      return await SafetyService.canCommunicate(myUid, targetUid);
    } finally {
      setCheckingCommunication(false);
    }
  }, [myUid]);

  return { canCommunicateWith, checkingCommunication };
}
