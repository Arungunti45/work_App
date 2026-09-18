export type AdPlacement = 'HOME_BANNER' | 'JOB_LIST' | 'JOB_DETAIL' | 'WORKER_LIST' | 'DASHBOARD';

export interface Ad {
  adId: string;
  title: string;
  description: string;
  imageUrl: string;
  destinationUrl: string;
  placement: AdPlacement;
  targetAudience: Record<string, any>; // e.g. location, roles
  startAt: string;
  endAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdMetrics {
  adId: string;
  impressions: number;
  clicks: number;
  lastUpdated: string;
}
