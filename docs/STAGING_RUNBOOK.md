# STAGING RUNBOOK

This runbook defines the operational procedures for deploying, monitoring, and rolling back the staging environment for **GET YOUR JOB**.

## 1. Environment Setup

Before starting a staging deployment:
1. Ensure you have the Firebase CLI installed (`npm install -g firebase-tools`).
2. Login to the staging Firebase account: `firebase login`.
3. Set the active project: `firebase use get-your-job-staging`.

## 2. Environment Variables

1. Copy `.env.staging.example` to `.env.staging` (frontend).
2. Populate the Google Maps API Key and Sandbox Payment Provider Key.
3. Validate Cloud Functions secrets using the Secret Manager:
   ```bash
   firebase functions:secrets:set PAYMENT_SECRET_KEY
   firebase functions:secrets:set WEBHOOK_SECRET
   ```

## 3. Build & Deploy

Run the designated staging deployment scripts located in the root package configurations:

1. **Frontend**:
   ```bash
   cd frontend
   npm run build:staging
   npm run deploy:staging
   ```

2. **Cloud Functions**:
   ```bash
   cd functions
   npm run build
   firebase deploy --only functions --project get-your-job-staging
   ```

3. **Firestore & Storage Rules**:
   ```bash
   firebase deploy --only firestore:rules,storage --project get-your-job-staging
   ```

## 4. Rollback Procedure

If the staging deployment causes critical failures (P0/P1):

### Frontend Rollback
1. Navigate to the Firebase Console -> Hosting.
2. Select the **Staging** project.
3. Identify the previous stable release.
4. Click the three dots -> **Roll back to this version**.

### Functions Rollback
1. Check out the previous stable git tag: `git checkout staging-vX.Y.Z`
2. Re-deploy functions: `firebase deploy --only functions --project get-your-job-staging`

### Rules Rollback
1. Navigate to Firebase Console -> Firestore -> Rules.
2. View history and restore the previous rule set.

## 5. Incident Escalation
If staging encounters P0 issues:
- Notify the team immediately.
- Pause all further feature merges to the `staging` branch until the failure is identified.
