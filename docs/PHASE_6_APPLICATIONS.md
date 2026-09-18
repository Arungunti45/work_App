# Phase 6: Applications, Applicant Management & Interviews

This document describes the application architecture implemented in Phase 6.

## Structure
- **Worker Applications**: Handled via `WorkerApplications.tsx` and `WorkerApplicationDetail.tsx`.
- **Employer Dashboards**: Handled via `EmployerApplications.tsx` and `ApplicantDetail.tsx`.
- **Apply Form**: Handled contextually in `ApplyForm.tsx` (called from `JobDetailsPage.tsx`).

## Security
- `firestore.rules` enforces that:
  - Workers can only read their own applications.
  - Employers can only read applications for jobs they own.
  - All writes (creating applications, changing status, scheduling interviews, hiring) must occur via verified Cloud Functions.

## Cloud Functions
- `submitApplication`: Validates identity, prevents duplicates, sets initial `SUBMITTED` state.
- `changeApplicationStatus`: Allows transitions (e.g. `SHORTLISTED`, `REJECTED`, `WITHDRAWN`). Tracks history.
- `hireApplicant`: Transactional atomic operation to transition application to `HIRED`, increment `filledCount` on the Job, and optionally close the Job if full.
- `scheduleInterview`: Creates interview records and moves application status to `INTERVIEW_SCHEDULED`.
