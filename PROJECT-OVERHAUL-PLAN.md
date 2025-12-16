## SFGM Boston Website Overhaul Plan

Goal: deliver a simpler, reliable LMS with durable quiz data, streamlined auth, and maintainable routing.

### Phase 0 — Baseline & Safeguards
- [ ] Inventory current environment variables, DB connection strings, third‑party creds.
- [ ] Snapshot Postgres (export `users`, `courses`, `quiz_attempts`, `essays`, `reading_progress`).
- [ ] Confirm automated backup path (manual script acceptable initially).
- [ ] Document current deployment blockers (stack traces, hosting limits).

### Phase 1 — Authentication Simplification
- [x] Extract auth endpoints into `server/routes/auth.ts`.
- [x] Standardize API (`POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`).
- [ ] Persist sessions via Postgres `sessions` table or JWT with refresh tokens (decision to make).
- [x] Trim registration form to essentials, move optional profile fields to dashboard.
- [x] Update `useAuth` + context provider to consume new endpoints.

### Phase 2 — Route & Page Restructure
- [ ] Create content config files for repetitive chapter/audio pages.
- [ ] Build generic `ChapterAudioPage`, `EbookPage`, etc., consuming configs.
- [ ] Replace dozens of static routes with dynamic ones (`/chapter/:seriesId/:chapterId`).
- [x] Group routes in `App.tsx` by domain and lazy load heavy sections.

### Phase 3 — Backend Modularization
- [x] Split quiz endpoints into `server/routes/quizzes.ts`.
- [x] Extract course/content/enrollment endpoints into `server/routes/courses.ts`.
- [x] Move admin/dean tooling out of the active router (deferred until requested).
- [x] Separate media + Bible AI routes into `server/routes/media.ts` & `server/routes/bible.ts`.
- [x] Isolate essay submissions into `server/routes/essays.ts`.
- [ ] Extract instructor tooling (deferred) + shared services when those roles return.
- [ ] Ensure shared middleware (auth, error handling) applied consistently.
- [ ] Move business logic into services (e.g., `quizService.submitAttempt`).
- [ ] Add request validation using Zod schemas matching Drizzle definitions.

### Phase 4 — Quiz Data Hardening
- [x] Wrap quiz submissions in transactions (attempt + essay + progress).
- [x] Add retry/rollback handling and detailed logging.
- [x] Build `/api/quizzes/export` for scheduled backups (JSON/CSV format).
- [x] Add monitoring hooks (console or external) for failed submissions.
- [x] Verify indexes on `quiz_attempts`, `content_progress` (migration created).
- [x] Create `npm run backup-quizzes` script for scheduled backups.

### Phase 5 — Deployment & Operations
- [x] Produce `env.example` for dev + `env.production.template` for production.
- [x] Write deployment checklist (build, migrate, backup, health check) in `DEPLOYMENT.md`.
- [x] Add `npm run backup-quizzes` script (created in Phase 4).
- [x] Provide uptime/health endpoints for monitoring (`/api/health`, `/api/health/detailed`, `/api/uptime`).
- [x] Document quickstart for contributors (auth flow, route configs, quiz testing) in `QUICKSTART.md`.

### Phase 6 — Polish & Verification
- [ ] Regression test flows: registration, login, enroll, take quiz, admin analytics.
- [ ] Validate content pages still accessible via new dynamic routes.
- [ ] Confirm backups restore successfully.
- [ ] Gather user feedback for any further UX simplifications.

> Progress will be tracked per phase. Each phase should land in main before starting the next to avoid large unreviewable diffs.

