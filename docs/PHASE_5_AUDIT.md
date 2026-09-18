# Phase 5 Audit

## Existing Architecture Overview
- **Stack**: React, Vite, TypeScript, Firebase Auth/Firestore/Storage/Functions.
- **Roles**: Worker, Employer, Contractor (handled via `users` collection and respective profile collections).
- **Job Lifecycle**: DRAFT -> SUBMITTED -> PENDING (Moderation) -> APPROVED/REJECTED -> PUBLISHED.

## Existing Models (from `schemas/job.ts`)
- **Job**: `id`, `employerId`, `title`, `description`, `categoryId`, `skillIds`, `location` (city, state, coordinates), `salary` (min, max, type), `workersRequired`, `experienceLevel`, `workType`, `urgent`, `status`, `moderationStatus`.
- **Category / Skill**: Normalized tables mapped by ID.
- **Profiles**: `WorkerProfileSchema` contains `skills`, `experience`, `location`, which are critical for recommendations.

## Reusable Components & Services
- **Services**: `JobService` (fetching published jobs), `ProfileService` (fetching worker profiles).
- **Components**: `JobCard.tsx` (Needs enhancement for save buttons and distance).
- **Context**: `AuthContext` provides `user` and `profileCompleteness`.

## Missing Pieces Required for Phase 5
- `savedJobs` subcollection and rules.
- Discovery Service (`isJobDiscoverable`).
- Search Service (Firestore query abstraction for category, skills, location, salary).
- Recommendation Service (Scoring algorithm).
- Advanced UI (Filters, Sort, Pagination).

## Files to be Created
- `docs/FIRESTORE_INDEXES.md`
- `frontend/src/types/jobDiscovery.ts`
- `frontend/src/utils/distance.ts`
- `frontend/src/services/jobDiscoveryService.ts`
- `frontend/src/services/jobSearchService.ts`
- `frontend/src/services/savedJobsService.ts`
- `frontend/src/services/recommendationService.ts`
- `frontend/src/components/jobs/JobSearchBar.tsx`
- `frontend/src/components/jobs/JobFilters.tsx`
- `frontend/src/components/jobs/JobSort.tsx`
- `frontend/src/components/jobs/SavedJobButton.tsx`
- `frontend/src/components/jobs/JobList.tsx`
- `frontend/src/pages/jobs/JobsPage.tsx`
- `frontend/src/pages/jobs/JobDetailsPage.tsx`
- `frontend/src/pages/jobs/SavedJobsPage.tsx`

## Files to be Modified
- `firestore.rules` (Add `savedJobs` access).
- `frontend/src/App.tsx` (Add new routes).
- `frontend/src/components/JobCard.tsx` (Refactor to use new SavedJobButton and display more data).
