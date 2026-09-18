import { useState, useEffect, useCallback } from 'react';
import { BlockService } from '../services/blockService';
import type { BlockedUser } from '../types/safety';

export function useBlockedUsers(uid: string | null) {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    const unsub = BlockService.subscribeToBlockedUsers(uid, (users) => {
      setBlockedUsers(users);
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  const blockUser = useCallback(async (targetUid: string, reason?: string) => {
    await BlockService.blockUser(targetUid, reason);
  }, []);

  const unblockUser = useCallback(async (targetUid: string) => {
    await BlockService.unblockUser(targetUid);
  }, []);

  const isBlocked = useCallback(async (targetUid: string): Promise<boolean> => {
    if (!uid) return false;
    return BlockService.isBlocked(uid, targetUid);
  }, [uid]);

  return { blockedUsers, loading, blockUser, unblockUser, isBlocked };
}
