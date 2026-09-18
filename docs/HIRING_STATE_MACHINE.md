# Hiring State Machine

The application status follows a strict lifecycle managed by Cloud Functions to prevent invalid transitions.

## Valid Transitions

- **SUBMITTED**
  - -> `UNDER_REVIEW` (Employer views)
  - -> `SHORTLISTED` (Employer shortlists)
  - -> `REJECTED` (Employer rejects)
  - -> `WITHDRAWN` (Worker withdraws)

- **UNDER_REVIEW / SHORTLISTED**
  - -> `INTERVIEW_SCHEDULED` (Employer schedules interview)
  - -> `REJECTED`
  - -> `WITHDRAWN`

- **INTERVIEW_SCHEDULED**
  - -> `INTERVIEW_COMPLETED`
  - -> `REJECTED`

- **INTERVIEW_COMPLETED**
  - -> `OFFERED`
  - -> `HIRED`
  - -> `REJECTED`

- **OFFERED**
  - -> `HIRED`
  - -> `REJECTED`

- **HIRED**
  - Terminal state. No further transitions allowed.

## Atomic Hiring
When an application reaches `HIRED`:
1. A transaction reads the Job's current `filledCount` and `workersRequired`.
2. It verifies `filledCount < workersRequired`.
3. It increments `filledCount`.
4. If `filledCount == workersRequired`, the Job status becomes `FILLED`.
