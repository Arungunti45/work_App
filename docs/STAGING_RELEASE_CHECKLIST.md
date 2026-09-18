# STAGING RELEASE CHECKLIST

### Code
- [ ] TypeScript passes (`npm run typecheck`)
- [ ] Lint passes (`npm run lint`)
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Build passes (`npm run build:staging`)

### Firebase
- [ ] Correct staging project selected (`firebase use get-your-job-staging`)
- [ ] Auth configured
- [ ] Firestore configured
- [ ] Storage configured
- [ ] Functions deployed
- [ ] Hosting deployed
- [ ] FCM configured
- [ ] App Check verified
- [ ] Rules deployed
- [ ] Indexes deployed

### Security
- [ ] No production secrets in `.env.staging`
- [ ] No production database connected
- [ ] No production Storage connected
- [ ] No live payment credentials used (Sandbox keys only)
- [ ] Authorization tested (Roles cannot be escalated)
- [ ] IDOR tested (Private fields secure)
- [ ] Storage security tested (Invoices/Resumes protected)

### Features
- [ ] Authentication
- [ ] Profiles
- [ ] Jobs (Creation, Moderation, Search)
- [ ] Hiring (Applications, Interviews)
- [ ] Contractors (Projects, Teams)
- [ ] Messaging (Attachments, Read States)
- [ ] Notifications
- [ ] Trust & Safety (Verification, Reports, Blocking)
- [ ] Admin (Users, Support, Analytics)
- [ ] Finance (Premium, Payments, Refunds, Invoices)
- [ ] UX (Localization, Accessibility, Responsive)

### QA
- [ ] Smoke test (Login to Hire flow)
- [ ] Full regression
- [ ] Security verification
- [ ] Responsive test (320px - 1440px)
- [ ] Browser test (Chrome, Firefox, Safari)
- [ ] Payment sandbox test (Webhook verification)
- [ ] Notification test
- [ ] Performance sanity test
