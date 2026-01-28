# Render + Neon Capacity Upgrade Plan

**Status:** Draft — **do not push changes until you've reviewed everything.**  
**Reference:** `AGENT-ONBOARDING-GUIDE.md` for architecture and testing workflow.

---

## 1. Current Setup (from CONFIGURATION-SUMMARY)

| Component | Current | Capacity |
|----------|---------|----------|
| **App DB pool** | 25 connections (default) | 100–150 concurrent users |
| **API rate limit** | 200 req / 15 min | — |
| **Render** | Depends on your plan | — |
| **Neon** | Depends on your plan | — |

---

## 2. Render Upgrades (Web Service)

Render bills **per workspace plan** (Hobby / Pro / etc.) **plus compute** for each service.

### Web service instance types (compute)

| Instance | $/mo | RAM | CPU | Use case |
|----------|------|-----|-----|----------|
| Free | $0 | 512 MB | 0.1 | Dev only |
| Starter | $7 | 512 MB | 0.5 | Low traffic |
| **Standard** | **$25** | **2 GB** | **1** | **Good next step** |
| Pro | $85 | 4 GB | 2 | Higher traffic |
| Pro Plus | $175 | 8 GB | 4 | Heavy traffic |
| Pro Max | $225 | 16 GB | 4 | Very high traffic |

### Suggested Render changes

1. **Upgrade instance type**
   - If on Free/Starter → **Standard** ($25/mo): 2 GB RAM, 1 CPU.
   - For more headroom → **Pro** ($85/mo): 4 GB RAM, 2 CPU.

2. **Where to change**
   - Render Dashboard → your **Web Service** → **Settings** → **Instance Type**.
   - Change instance, save. Render will redeploy.

3. **Workspace plan**
   - **Horizontal autoscaling** needs **Professional** workspace ($19/user/mo + compute).
   - If you want autoscaling later, upgrade the workspace plan; for now, a bigger instance is enough.

---

## 3. Neon Upgrades (Database)

Neon uses **Free / Launch / Scale**. Billing is **usage-based** (CU-hours, storage).

### Neon plans (summary)

| Plan | Compute | Connections | PITR | Notes |
|------|---------|-------------|------|--------|
| **Free** | Up to 2 CU (8 GB) | — | 6 h / 1 GB | Scale-to-zero, 100 CU-hrs/project |
| **Launch** | Up to 16 CU (64 GB) | Up to 1M | 7 days | Usage-based |
| **Scale** | Up to 56 CU (224 GB) | Up to 1M | 30 days | + 99.95% SLA, private networking, etc. |

### Connection pooling

- Neon uses **pgBouncer**; supports many connections.
- Use the **pooled** connection string (often `-pooler` in hostname or pooler-specific endpoint).
- Our app’s `DB_POOL_SIZE` limits **our** pool. Neon can handle far more.

### Suggested Neon changes

1. **Plan**
   - **Free → Launch** if you need more than 100 CU-hrs or 2 CU.
   - **Launch → Scale** if you want 30-day PITR, SLA, private networking.

2. **Compute size**
   - In Neon: **Project → Compute →** set **min/max** or **fixed** size.
   - Example: 2 CU (8 GB) or 4 CU (16 GB) for growth.
   - Scale plan allows up to 56 CU.

3. **Connection string**
   - Use the **pooled** `DATABASE_URL` from Neon dashboard.
   - Ensure `DATABASE_URL` in Render env points to this pooled URL.

---

## 4. App-Side Changes (Local Edits — Not Pushed Yet)

These stay **local** until you’ve reviewed and are ready to deploy.

### 4.1 Database connection pool

- **File:** `server/db.ts`
- **Change:** Increase default pool size.
- **Current:** `DB_POOL_SIZE` default `25`.
- **Proposed:** default `30` (or `35` if you prefer).
- **Effect:** More concurrent DB operations per app instance.

You can override anytime with env `DB_POOL_SIZE`.

### 4.2 Rate limiting

- **File:** `server/middleware/rateLimit.ts`
- **Current:** API `200` req / 15 min.
- **Optional:** Raise to `250` (or keep 200) when you increase capacity.

### 4.3 Env and config docs

- **Files:** `env.example`, `env.production.template`
- **Updates:** Document `DB_POOL_SIZE=30` (or 35) as recommended for upgraded Render + Neon.
- **CONFIGURATION-SUMMARY.md:** Update “current” defaults and scaling notes to match.

---

## 5. Environment Variables (Render)

Set these in **Render Dashboard → your Web Service → Environment**:

| Variable | Recommended | Notes |
|----------|-------------|--------|
| `DATABASE_URL` | Neon **pooled** URL | From Neon project |
| `NODE_ENV` | `production` | Required |
| `PORT` | Render sets automatically | Don’t override unless needed |
| `DB_POOL_SIZE` | `30` or `35` | Match new default; adjust if you change code |

After changing env, **redeploy** the service.

---

## 6. Order of Operations (When You’re Ready)

1. **Neon**
   - Upgrade plan (Free → Launch or Launch → Scale) if needed.
   - Set compute size (e.g. 2–4 CU).
   - Confirm **pooled** `DATABASE_URL`; update Render env if it changed.

2. **Render**
   - Upgrade **instance type** (e.g. to Standard or Pro).
   - Set `DB_POOL_SIZE=30` (or 35) and `DATABASE_URL` (and `NODE_ENV`).
   - Redeploy.

3. **Code**
   - Only **after** you’ve reviewed **all** local changes (see `PENDING-CHANGES-NO-PUSH.md`).
   - Commit and push when satisfied; Render will redeploy from Git.

4. **Verify**
   - Hit `/api/health/detailed` and confirm `connectionPool.max` matches `DB_POOL_SIZE`.
   - Run through login, courses, quizzes, progress (and any other critical flows).

---

## 7. Capacity After Upgrades

Rough ranges:

| Setup | Students | Concurrent users | Notes |
|-------|----------|-------------------|--------|
| **Current (25 pool)** | 500–1k | 100–150 | Existing |
| **+ Render Standard + pool 30** | 1k–1.5k | 120–180 | Good next step |
| **+ Render Pro + pool 35** | 1.5k–2k | 150–200 | Higher headroom |
| **+ Neon Launch/Scale, larger compute** | 2k+ | 200+ | Depends on Neon size |

---

## 8. Reference Links

- [Render pricing](https://render.com/pricing)
- [Render scaling](https://docs.render.com/scaling)
- [Neon pricing](https://neon.tech/pricing)
- [Neon connection pooling](https://neon.tech/docs/connect/connection-pooling)
- [Neon autoscaling](https://neon.tech/docs/introduction/autoscaling)

---

**Reminder:** Do **not** push Git changes until you’ve reviewed everything. See `PENDING-CHANGES-NO-PUSH.md` for the full list of local edits.
