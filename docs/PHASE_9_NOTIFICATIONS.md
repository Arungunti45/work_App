# Phase 9 — Notifications & FCM

## Architecture

```
Business Event (application.shortlisted, etc.)
    ↓
Cloud Function (applications.ts / interviews.ts / messaging.ts)
    ↓
createNotification() in notifications.ts
    ↓
users/{uid}/notifications/{id}   ←— In-App (Firestore)
    ↓ (if FCM token exists)
sendPushToUser() → FCM Admin SDK → Browser Push
```

## Firestore Collections

| Path | Description |
|---|---|
| `users/{uid}/notifications/{id}` | Per-user notification inbox |
| `users/{uid}/notificationPreferences/settings` | Channel preferences per category |
| `users/{uid}/notificationTokens/{tokenId}` | FCM tokens (one per browser) |

## Event → Notification Mapping

| Trigger | Type | Recipient |
|---|---|---|
| Worker applies | APPLICATION_SUBMITTED | Employer |
| Employer reviews | APPLICATION_UNDER_REVIEW | Worker |
| Employer shortlists | APPLICATION_SHORTLISTED | Worker |
| Employer rejects | APPLICATION_REJECTED | Worker |
| Worker withdraws | APPLICATION_WITHDRAWN | Employer |
| Employer hires | APPLICATION_HIRED | Worker |
| Employer schedules interview | INTERVIEW_SCHEDULED | Worker |
| Interview rescheduled | INTERVIEW_RESCHEDULED | Worker |
| Interview cancelled | INTERVIEW_CANCELLED | Worker |
| 24h/1h before interview | INTERVIEW_REMINDER | Worker + Employer |
| New message sent | NEW_MESSAGE | Other participant |

## FCM Web Setup (Required Firebase Console steps)

1. Go to Firebase Console → **Project Settings** → **Cloud Messaging**
2. Under **Web Push certificates**, click **Generate key pair**
3. Copy the VAPID key
4. Add to `frontend/.env`:
   ```
   VITE_FIREBASE_VAPID_KEY=<your-vapid-key>
   ```
5. Deploy `firebase-messaging-sw.js` with your actual Firebase config values

## Scheduled Functions

- `sendInterviewReminders` — runs every 60 minutes, sends 24h and 1h reminders
- `cleanupExpiredNotifications` — runs every 24 hours, removes notifications >90 days old

## Security

- `users/{uid}/notifications/` — create is `false` (server only). Update restricted to `isRead/readAt` fields only. Delete allowed by owner.
- `notificationTokens/` — strictly per-user, no cross-user access
- Push sending only via Admin SDK in Cloud Functions — no client-side push capability

## Idempotency

Every notification call passes an `idempotencyKey`. If the Cloud Function is retried, a duplicate notification is not created.
