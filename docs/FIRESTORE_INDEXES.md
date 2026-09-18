# Firestore Indexes (Phase 5)

To support the Advanced Job Discovery and Search queries, the following composite indexes must be created in the Firebase Console or deployed via `firestore.indexes.json`.

## Collection: `jobs`

1. **Category Filter & Sorting**
   - Fields: `moderationStatus` (ASC), `status` (ASC), `categoryId` (ASC), `publishedAt` (DESC)
   - Reason: Discovering published jobs within a category, sorted by newest.

2. **Subcategory Filter & Sorting**
   - Fields: `moderationStatus` (ASC), `status` (ASC), `subcategoryId` (ASC), `publishedAt` (DESC)
   - Reason: Discovering published jobs within a subcategory.

3. **Urgency Filter**
   - Fields: `moderationStatus` (ASC), `status` (ASC), `urgent` (ASC), `publishedAt` (DESC)
   - Reason: Querying urgent jobs sorted by newest.

4. **Work Type Filter**
   - Fields: `moderationStatus` (ASC), `status` (ASC), `workType` (ASC), `publishedAt` (DESC)
   - Reason: Querying specific work types (e.g. DAILY) sorted by newest.

5. **Default Feed**
   - Fields: `moderationStatus` (ASC), `status` (ASC), `publishedAt` (DESC)
   - Reason: Fetching the default "Recently Posted" list.

## Collection: `savedJobs` (Subcollection)
- No composite indexes strictly required yet, as they are queried by `userId` directly inside `users/{userId}/savedJobs`.
