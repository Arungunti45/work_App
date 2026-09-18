// ============================================================
// Phase 9: Centralized Notification Types
// ============================================================

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export type NotificationCategory =
  | 'JOBS'
  | 'APPLICATIONS'
  | 'INTERVIEWS'
  | 'MESSAGES'
  | 'TEAMS'
  | 'PROJECTS'
  | 'ACCOUNT'
  | 'SYSTEM';

export type NotificationType =
  // Account
  | 'ACCOUNT_SECURITY'
  | 'ACCOUNT_STATUS_CHANGED'
  | 'LOGIN_ALERT'
  // Jobs
  | 'JOB_PUBLISHED'
  | 'JOB_UPDATED'
  | 'JOB_CLOSED'
  | 'JOB_MATCH'
  | 'URGENT_JOB'
  // Applications
  | 'APPLICATION_SUBMITTED'
  | 'APPLICATION_UNDER_REVIEW'
  | 'APPLICATION_SHORTLISTED'
  | 'APPLICATION_REJECTED'
  | 'APPLICATION_WITHDRAWN'
  | 'APPLICATION_OFFERED'
  | 'APPLICATION_HIRED'
  // Interviews
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_RESCHEDULED'
  | 'INTERVIEW_CANCELLED'
  | 'INTERVIEW_REMINDER'
  | 'INTERVIEW_COMPLETED'
  // Messaging
  | 'NEW_MESSAGE'
  // Contractor / Teams
  | 'TEAM_INVITATION'
  | 'TEAM_INVITATION_ACCEPTED'
  | 'TEAM_INVITATION_DECLINED'
  | 'TEAM_MEMBER_ADDED'
  | 'TEAM_MEMBER_REMOVED'
  // Projects
  | 'PROJECT_ASSIGNED'
  | 'PROJECT_UPDATED';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: string | null;
  // Deep link routing
  route?: string;
  // Entity reference (not the full document)
  entityType?: string;
  entityId?: string;
  // Extra context without duplicating large documents
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
  expiresAt?: string | null;
}

export interface NotificationChannelPrefs {
  inApp: boolean;
  browserPush: boolean;
  email: boolean; // stored for future use, not delivered yet
}

export interface NotificationPreferences {
  jobs: NotificationChannelPrefs;
  applications: NotificationChannelPrefs;
  interviews: NotificationChannelPrefs;
  messages: NotificationChannelPrefs;
  teams: NotificationChannelPrefs;
  projects: NotificationChannelPrefs;
  account: NotificationChannelPrefs; // mandatory — cannot disable security alerts
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  jobs:         { inApp: true, browserPush: true,  email: false },
  applications: { inApp: true, browserPush: true,  email: false },
  interviews:   { inApp: true, browserPush: true,  email: false },
  messages:     { inApp: true, browserPush: true,  email: false },
  teams:        { inApp: true, browserPush: false, email: false },
  projects:     { inApp: true, browserPush: false, email: false },
  account:      { inApp: true, browserPush: true,  email: false }, // always on
};

export interface NotificationToken {
  token: string;
  platform: 'web';
  browser: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string;
}

/** Map notification types to categories */
export const NOTIFICATION_CATEGORY_MAP: Record<NotificationType, NotificationCategory> = {
  ACCOUNT_SECURITY:           'ACCOUNT',
  ACCOUNT_STATUS_CHANGED:     'ACCOUNT',
  LOGIN_ALERT:                'ACCOUNT',
  JOB_PUBLISHED:              'JOBS',
  JOB_UPDATED:                'JOBS',
  JOB_CLOSED:                 'JOBS',
  JOB_MATCH:                  'JOBS',
  URGENT_JOB:                 'JOBS',
  APPLICATION_SUBMITTED:      'APPLICATIONS',
  APPLICATION_UNDER_REVIEW:   'APPLICATIONS',
  APPLICATION_SHORTLISTED:    'APPLICATIONS',
  APPLICATION_REJECTED:       'APPLICATIONS',
  APPLICATION_WITHDRAWN:      'APPLICATIONS',
  APPLICATION_OFFERED:        'APPLICATIONS',
  APPLICATION_HIRED:          'APPLICATIONS',
  INTERVIEW_SCHEDULED:        'INTERVIEWS',
  INTERVIEW_RESCHEDULED:      'INTERVIEWS',
  INTERVIEW_CANCELLED:        'INTERVIEWS',
  INTERVIEW_REMINDER:         'INTERVIEWS',
  INTERVIEW_COMPLETED:        'INTERVIEWS',
  NEW_MESSAGE:                'MESSAGES',
  TEAM_INVITATION:            'TEAMS',
  TEAM_INVITATION_ACCEPTED:   'TEAMS',
  TEAM_INVITATION_DECLINED:   'TEAMS',
  TEAM_MEMBER_ADDED:          'TEAMS',
  TEAM_MEMBER_REMOVED:        'TEAMS',
  PROJECT_ASSIGNED:           'PROJECTS',
  PROJECT_UPDATED:            'PROJECTS',
};

/** Category labels for UI display */
export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  JOBS:         'Jobs',
  APPLICATIONS: 'Applications',
  INTERVIEWS:   'Interviews',
  MESSAGES:     'Messages',
  TEAMS:        'Teams',
  PROJECTS:     'Projects',
  ACCOUNT:      'Account',
  SYSTEM:       'System',
};

/** Category icons for UI */
export const NOTIFICATION_CATEGORY_ICONS: Record<NotificationCategory, string> = {
  JOBS:         '💼',
  APPLICATIONS: '📋',
  INTERVIEWS:   '🗓️',
  MESSAGES:     '💬',
  TEAMS:        '👥',
  PROJECTS:     '🏗️',
  ACCOUNT:      '🔐',
  SYSTEM:       '⚙️',
};
