# Production database migrations (manual)

This project uses Postgres + Drizzle.

## Goal
Keep the **production Neon** database schema in sync with the code **without** running migrations automatically on every deploy.

## When to run this
Run a schema push when you deploy code that changes anything in `shared/schema.ts` (new columns/tables/constraints).

Examples:
- adding `users.sfgmChurch`
- adding `enrollments.chosenInstructorId`
- adding new tables (e.g. `church_instructor_info`)

## Safe manual procedure

1. Ensure your site is healthy:
   - `GET /api/health`
   - `GET /api/health/detailed`

2. Set your production `DATABASE_URL` **only in your terminal** (do not commit it to Git):

```bash
export DATABASE_URL='postgresql://USER:PASSWORD@HOST/DB?sslmode=require'
```

3. Run the manual schema push script (it will prompt you):

```bash
./scripts/db-push-prod.sh
```

4. Re-test the website:
- login
- student dashboard loads enrollments
- take a quiz
- play an audio chapter

## Notes / warnings
- If Drizzle shows **DROP/TRUNCATE** statements, stop and review.
- Never store the production `DATABASE_URL` in Markdown files or in `.env` committed to git.
