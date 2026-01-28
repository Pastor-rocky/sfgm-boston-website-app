# Pending Changes — Do Not Push Until Reviewed

**You asked:** Don’t push any changes until you’ve seen everything you want to do.

**Status:** All edits below are **local only**. No `git push` has been run.

---

## Summary of changes

Capacity upgrades for **Render + Neon**:

1. **DB pool default:** 25 → **30**
2. **API rate limit:** 200 → **250** req/15 min
3. **Docs:** `CONFIGURATION-SUMMARY`, env templates, and new upgrade plan updated

---

## Files modified (local)

| File | Change |
|------|--------|
| `server/db.ts` | Default `DB_POOL_SIZE` 25 → 30; comments updated |
| `server/routes.ts` | Health-check pool fallback 25 → 30 |
| `server/middleware/rateLimit.ts` | API `maxRequests` 200 → 250 |
| `env.example` | `DB_POOL_SIZE` docs: default 25 → 30 |
| `env.production.template` | Same |
| `CONFIGURATION-SUMMARY.md` | Defaults, capacity notes, verification steps updated |
| `AGENT-ONBOARDING-GUIDE.md` | Config references 25→30, 200→250; added upgrade docs |

---

## Files created (new)

| File | Purpose |
|------|---------|
| `RENDER-AND-NEON-CAPACITY-UPGRADE.md` | Render + Neon upgrade plan, instance types, env vars |
| `PENDING-CHANGES-NO-PUSH.md` | This file — list of changes, no push until you review |

---

## What you should do next

1. **Review**
   - Read `RENDER-AND-NEON-CAPACITY-UPGRADE.md`.
   - Check the modified files (diffs or open in editor).
   - Confirm pool default 30 and API limit 250 are what you want.

2. **Test locally** (see `AGENT-ONBOARDING-GUIDE.md`)
   - `npm run test:local`
   - Open `http://localhost:56000`
   - Login, courses, quizzes, progress — confirm everything works.
   - Check server logs for: `📊 Database connection pool configured: 30 max connections`

3. **Render + Neon** (when ready)
   - Follow `RENDER-AND-NEON-CAPACITY-UPGRADE.md`:
     - Neon: plan, compute size, pooled `DATABASE_URL`.
     - Render: instance type, env vars (`DB_POOL_SIZE`, `DATABASE_URL`, etc.).
   - Redeploy on Render after env changes.

4. **Push only after you’re satisfied**
   - Once you’ve reviewed and tested:
     - `git add` the files you want to keep
     - `git commit`
     - `git push`
   - Render will redeploy from the new commit.

---

## Quick verification

```bash
# Local
npm run test:local
# → expect log: "📊 Database connection pool configured: 30 max connections"

curl -s http://localhost:56000/api/health/detailed | jq '.services.database.connectionPool'
# → expect "max": 30
```

---

## Reverting (if you want to undo)

If you prefer to discard these changes:

```bash
git checkout -- server/db.ts server/routes.ts server/middleware/rateLimit.ts
git checkout -- env.example env.production.template CONFIGURATION-SUMMARY.md
rm RENDER-AND-NEON-CAPACITY-UPGRADE.md PENDING-CHANGES-NO-PUSH.md
```

Or use your editor’s undo / discard changes.

---

**Reminder:** No changes have been pushed. Push only after you’ve reviewed and tested.
