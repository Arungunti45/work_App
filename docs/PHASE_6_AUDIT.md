# Phase 6 Audit

## Existing Architecture Overview
- **Roles**: Worker, Employer, Contractor. Controlled by `AuthContext` and Firestore rules.
- **Jobs Schema (`schemas/job.ts`)**: 
  - `id`, `employerId`, `workersRequired` (default 1)
  - `status`: DRAFT, SUBMITTED, PUBLISHED, PAUSED, FILLED, CLOSED, ARCHIVED.
  - `moderationStatus`: NOT_SUBMITTED, PENDING, APPROVED, REJECTED.
- **Routing**: `App.tsx` handles role-based protected routes.
- **Worker Profile**: Exists in `workerProfiles/{uid}` with skills, experience, and contact data.
- **Employer Profile**: Exists in `employerProfiles/{uid}`.
- **File Uploads**: `Firebase Storage` handles profile pictures. Resume storage can follow the same pattern (`users/{uid}/resume/`).

## Application Requirements
- **Application Structure**: `applications/{applicationId}`
- **Interviews Structure**: `interviews/{interviewId}`
- **Application Statuses**: SUBMITTED, UNDER_REVIEW, SHORTLISTED, INTERVIEW_SCHEDULED, INTERVIEW_COMPLETED, OFFERED, HIRED, REJECTED, WITHDRAWN.
- **Interview Statuses**: SCHEDULED, RESCHEDULE_REQUESTED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW.
- **Actions Required**: Apply (Worker), Shortlist (Employer), Reject (Employer), Schedule Interview (Employer), Hire (Employer), Withdraw (Worker).

## Data Models to Create
1. **Application Model** (`schemas/application.ts`): Zod schema for Application.
2. **Interview Model** (`schemas/interview.ts`): Zod schema for Interview.

## Files to Create
- `frontend/src/schemas/application.ts`
- `frontend/src/schemas/interview.ts`
- `frontend/src/services/applicationService.ts`
- `frontend/src/services/interviewService.ts`
- `frontend/src/services/hiringService.ts`
- `frontend/src/pages/jobs/ApplyPage.tsx`
- `frontend/src/pages/worker/applications/WorkerApplications.tsx`
- `frontend/src/pages/worker/applications/ApplicationDetail.tsx`
- `frontend/src/pages/employer/applications/EmployerApplications.tsx`
- `frontend/src/pages/employer/applications/JobApplicants.tsx`
- `frontend/src/pages/employer/applications/ApplicantDetail.tsx`
- `frontend/src/components/applications/ApplicationCard.tsx`
- `frontend/src/components/applications/ApplicantCard.tsx`
- `frontend/src/components/applications/ApplicationTimeline.tsx`
- `functions/src/applications.ts` (Cloud functions for transactional state changes like Hiring and Application Submission)
- `functions/src/interviews.ts`

## Files to Modify
- `frontend/src/App.tsx` (Add routes)
- `frontend/src/pages/jobs/JobDetailsPage.tsx` (Update Apply button logic)
- `firestore.rules` (Security rules for applications and interviews)
- `functions/src/index.ts` (Export new functions)

## Security Rules Strategy
- `applications`: 
  - Worker: `read` if `request.auth.uid == resource.data.workerId`, `create` handled via Cloud Function, `update` limited to Withdrawal.
  - Employer: `read` if `request.auth.uid == resource.data.employerId`.
- `interviews`:
  - Worker: `read` if `workerId == auth.uid`.
  - Employer: `read`, `create`, `update` if `employerId == auth.uid`.

## Transactional / Server-Side Logic (Cloud Functions)
- `submitApplication`: Validate eligibility, prevent duplicate applications, create record.
- `hireApplicant`: Transaction to mark application as HIRED, increment job's filled count, and change job status to FILLED if `filledCount >= workersRequired`.
- `changeApplicationStatus`: Centralized status transition logic with audit history.
