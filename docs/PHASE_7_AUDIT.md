# Phase 7 Audit: Worker Search & Contractor Features

## Existing Architecture & Entities
- **WorkerProfile**: Contains `fullName`, `skills`, `experienceLevel`, `experienceYears`, `location`, `availableNow`, `workTypes`. Well suited for search filtering.
- **ContractorProfile**: Contains `contractorName`, `businessCategory`, `teamSize`, `workerTypes`.
- **LocationSchema**: Captures `state`, `city`, `area`, `pincode`, `latitude`, `longitude`.

## Missing Requirements to Fulfill
- **Worker Search / Discovery**: Need a service to query `users` collection filtered by `role == 'WORKER'` and public attributes.
- **Contractor Projects**: Need a `contractorProjects` collection with states `DRAFT`, `OPEN`, `IN_PROGRESS`, etc.
- **Contractor Teams & Members**: Need `contractorTeams` collection and `teamInvitations`.
- **Privacy Controls**: Need to enforce that sensitive worker data (like exact phone numbers or email) is not exposed during public search.

## Planned Changes
1. **Firestore Collections**:
   - `contractorProjects`: to store contractor jobs.
   - `contractorTeams`: to store teams managed by contractors.
   - `teamInvitations`: to handle the lifecycle of inviting workers to a team.
2. **Cloud Functions**:
   - `inviteWorkerToTeam`
   - `respondToTeamInvitation`
3. **UI Routes**:
   - `/workers` & `/workers/:workerId`
   - `/contractor/projects/*`
   - `/contractor/teams/*`
   - `/my-teams` (for workers)
