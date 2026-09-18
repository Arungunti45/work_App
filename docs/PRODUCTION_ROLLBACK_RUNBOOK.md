# PRODUCTION ROLLBACK RUNBOOK

If a P0 (Blocker) or P1 (Critical) incident occurs during or immediately after the production deployment, execute the following rollback strategies.

## Frontend Rollback (Zero Downtime)
If the React application crashes on load or critical UI paths are broken:
1. Navigate to the Firebase Console -> Hosting.
2. Select the **Production** project.
3. Identify the previous stable release version.
4. Click the three dots -> **Roll back to this version**.
5. Within seconds, CDN caches will invalidate and users will receive the old bundle.

## Cloud Functions Rollback
If a backend Cloud Function causes continuous errors or payment loop failures:
1. Revert to the last known stable Git tag: `git checkout prod-vX.Y.Z`
2. Re-deploy functions specifically: `firebase deploy --only functions --project get-your-job-prod`
3. *Alternative*: In an extreme emergency where a webhook is duplicating transactions, disable the function entirely from the Google Cloud Console until patched.

## Database Rules Rollback
If users are suddenly locked out of their accounts due to a rules deploy:
1. Navigate to Firebase Console -> Firestore -> Rules.
2. View the history tab.
3. Select the previous rule set and click **Restore**.

## Incident Communication
- Escalate immediately to the Engineering Manager.
- If payments are affected, immediately notify Operations and Finance.
- Do NOT run destructive deletion scripts against Production databases to "fix" dirty data without approval.
