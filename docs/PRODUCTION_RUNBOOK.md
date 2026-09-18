# PRODUCTION RUNBOOK

This runbook defines the operational procedures for deploying **GET YOUR JOB** into the Live Production environment.

## 1. Environment Verification
1. Ensure the staging release was fully signed off (see `STAGING_TEST_REPORT.md`).
2. Login to the production Firebase account: `firebase login`.
3. Set the active project: `firebase use get-your-job-prod`.

## 2. Secrets & Keys 
1. Validate `.env.production` is mapped properly on the build server.
2. Ensure LIVE Stripe/Razorpay keys are strictly assigned to Secret Manager:
   ```bash
   firebase functions:secrets:set PAYMENT_SECRET_KEY
   firebase functions:secrets:set WEBHOOK_SECRET
   ```

## 3. Build & Deploy Sequence

1. **Firestore & Storage Rules (Deploy First)**:
   ```bash
   firebase deploy --only firestore:rules,storage --project get-your-job-prod
   ```

2. **Cloud Functions**:
   ```bash
   cd functions
   npm run build
   firebase deploy --only functions --project get-your-job-prod
   ```

3. **Frontend Application**:
   ```bash
   cd frontend
   npm run build:prod
   npm run deploy:prod
   ```

## 4. Post-Deployment Smoke Test
- Verify domain routing on live URLs.
- Do NOT test payments using live money unless authorized by Finance.
- Test Admin Login with the pre-provisioned `SUPER_ADMIN` account.
