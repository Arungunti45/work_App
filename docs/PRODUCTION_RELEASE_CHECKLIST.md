# PRODUCTION RELEASE CHECKLIST

## Code
- [ ] Approved staging commit selected
- [ ] TypeScript passes
- [ ] Lint passes
- [ ] Tests pass
- [ ] Production build passes (`npm run build:prod`)

## Firebase
- [ ] Production project verified (`get-your-job-prod`)
- [ ] Auth configured
- [ ] Firestore configured
- [ ] Storage configured
- [ ] Functions deployed
- [ ] Hosting deployed
- [ ] FCM configured
- [ ] App Check verified
- [ ] Rules deployed
- [ ] Indexes deployed

## Security
- [ ] Production secrets secured in Secret Manager
- [ ] No staging credentials in `.env.production`
- [ ] No development credentials in `.env.production`
- [ ] Authorization verified
- [ ] IDOR verified
- [ ] Storage security verified
- [ ] Admin security verified
- [ ] Payment security verified

## Payments
- [ ] Live Stripe/Razorpay credentials verified
- [ ] Webhook verified
- [ ] Signature verification active
- [ ] Idempotency active
- [ ] Subscription creation active
- [ ] Invoice creation active
- [ ] Refund logic protected

## Infrastructure
- [ ] Official Domain connected
- [ ] DNS propagated
- [ ] HTTPS enforced
- [ ] Firebase Hosting live
- [ ] Monitoring active
- [ ] Alerts configured
- [ ] Backup/recovery tested

## Application
- [ ] Authentication
- [ ] Profiles
- [ ] Jobs (Search/Apply)
- [ ] Hiring & Interviews
- [ ] Contractors (Projects/Teams)
- [ ] Messaging & Notifications
- [ ] Trust & Safety
- [ ] Admin Dashboard
- [ ] Subscriptions & Payments
- [ ] Localization & Accessibility
