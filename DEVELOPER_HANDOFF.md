# SFGM Boston Website — Handoff for Designers & Web Specialists

This document explains **what this project is**, **where things live**, and **how pages, courses, and data connect**—in plain language first, with technical detail where it helps.

If you only read one section, read **“The big picture in one page”** and **“When you change something, where does it go?”**

---

## The big picture in one page

**What users see** is a **website** (pages, buttons, courses, quizzes). That website is built from two main parts that work together:

| Part | Simple explanation | Folder in this project |
|------|-------------------|------------------------|
| **The front end** | What loads in the browser: layouts, text, images, navigation, forms. | `client/` |
| **The back end** | A **server** that answers requests, talks to the **database**, handles login, saves quiz scores, etc. | `server/` |

**The database** is like a set of spreadsheets in the cloud: users, courses, quiz questions, enrollments, and so on. The structure of those “spreadsheets” is defined in code here:

- **`shared/schema.ts`** — the **single source of truth** for “what tables exist and what columns they have.”

**Important:** Changing how data is stored usually means changing `shared/schema.ts` and updating the database (migrations). Changing only how something *looks* is usually just `client/` (and sometimes images in `client/public`).

---

## Words you might hear (quick glossary)

- **React** — The JavaScript library used to build the interactive website UI.
- **Vite** — The tool that bundles and serves the front end during development and builds it for production.
- **Express** — The Node.js framework that runs the API (the back end).
- **API** — URLs that start with `/api/...`. The browser calls these to log in, load course data, submit quizzes, etc.
- **PostgreSQL** — The database type (industry-standard relational DB).
- **Drizzle** — The library that maps database tables to TypeScript code (`shared/schema.ts`).
- **ORM** — “Object–relational mapping”: code that reads/writes the database using types and tables instead of raw SQL everywhere.
- **Route / URL path** — The address bar path, e.g. `/course/5` or `/dont-be-a-jonah-player-ch9`.
- **Lazy loading** — Pages are loaded on demand so the first load stays fast; see `client/src/routes/route-config.tsx`.
- **Environment variables (.env)** — Secret or environment-specific settings (database URL, API keys). **Never commit real `.env` files.** Use `env.example` as a template.

---

## Folder map (where to look first)

```
project root/
├── client/                 # FRONT END — what users see in the browser
│   ├── src/
│   │   ├── pages/          # One file per screen (landing, course page, quiz, etc.)
│   │   ├── components/   # Reusable UI pieces (buttons, nav, modals)
│   │   ├── routes/
│   │   │   └── route-config.tsx   # ALL URL paths → which page to show
│   │   ├── hooks/        # e.g. useAuth — “am I logged in?”
│   │   └── lib/          # Helpers (API client, audio URLs, etc.)
│   ├── public/           # Static files served as-is (images, some media paths)
│   └── index.html        # HTML shell for the app
├── server/                 # BACK END — API + security + database access
│   ├── index.ts            # Starts the server
│   ├── routes.ts           # Wires middleware, health checks, registers feature routes
│   ├── routes/             # auth.ts, courses.ts, quizzes.ts, media.ts, etc.
│   ├── db.ts               # Database connection pool
│   ├── storage.ts          # Many DB read/write helpers
│   └── middleware/         # e.g. rate limits, “must be logged in”
├── shared/
│   └── schema.ts           # DATABASE SHAPE — tables, columns, relations, some Zod schemas
├── migrations/             # Database migration SQL (history of schema changes)
├── public/                 # Extra static files at repo root (legacy/additional assets)
├── uploads/                # Local uploads (e.g. profile images) when not using cloud storage
├── package.json            # Scripts and dependencies
├── vite.config.ts          # Front-end build settings (paths, aliases)
├── drizzle.config.ts       # Drizzle CLI → points at schema + DATABASE_URL
└── env.example             # List of environment variables (copy to .env locally)
```

---

## How routing works (URLs → pages)

**All main URLs are listed in one file:**

- **`client/src/routes/route-config.tsx`**

Each line says: “When the path is X, load page Y.” Pages are **lazy-loaded** (imported only when needed).

**To add a new public page:**

1. Create a component in `client/src/pages/YourPage.tsx`.
2. Add a route in `route-config.tsx` (copy the pattern from a similar page).
3. Do **not** only edit `App.tsx` — routing is centralized in `route-config.tsx`.

**Catch-all:** Unknown URLs eventually hit a not-found page defined in that same route setup.

---

## How the front end talks to the server

- **`client/src/lib/queryClient.ts`** — `fetch` to `/api/...` with **`credentials: "include"`** so **cookies** (login session) are sent.
- **`client/src/hooks/useAuth.ts`** — Calls **`/api/auth/me`** to know if someone is logged in.

**Auth cookies (high level):** After login, the server sets HTTP-only cookies (`auth_token` and a legacy name). The browser stores them; JavaScript cannot read the token from those cookies (good for security). The server reads them on each API request.

---

## Courses: what “a course” actually is

A **course** is not just one React file. It is usually **both**:

1. **Data in the database** — so the LMS can show it on dashboards, track progress, gate content, attach quizzes, etc.
2. **Pages and assets in the client** — ebook readers, chapter audio players, marketing copy, images.

### Database tables (most relevant)

Defined in **`shared/schema.ts`**. Core LMS concepts:

| Table (concept) | Role |
|-----------------|------|
| `courses` | Course title, description, duration, instructor link, flags, etc. |
| `course_modules` | Weeks/modules: order, type (video, reading, quiz, textbook), links to content |
| `course_videos` | Video metadata per course/module |
| `enrollments` | Which student is in which course |
| `quizzes` | Quiz metadata (title, time limit, passing score, final exam flag, …) |
| `quiz_questions` | Questions, options (JSON), correct answers, order |
| `quiz_attempts` | Student submissions and scores |
| `content_progress` / `progress` | What the student completed |
| `course_completions`, `certificates` | Completion and certificate records |

**Quizzes are tied to courses/modules by IDs** — if you add quizzes in the DB, IDs must match what the app expects.

### Front-end course experience

- **Course hub / detail:** e.g. `client/src/pages/course-detail.tsx`, catalog pages.
- **Taking a quiz:** `client/src/pages/quiz-take.tsx` (route `/quiz/:id`).
- **Chapter / ebook / audio “readers”:** many dedicated pages under `client/src/pages/` (e.g. `dont-be-a-jonah-player-ch9.tsx`) **plus** matching routes in **`route-config.tsx`**.

**Pattern:** For a book with many chapters, this repo often has **one TSX file per chapter** and **one route per chapter**. A designer changing layout should open the chapter file; adding a chapter means **new page + new route** (and usually new content/audio URLs).

---

## Where content is “stored” (decision guide)

| Kind of content | Usually stored | Notes |
|-----------------|----------------|-------|
| Course/quiz/enrollment facts | **PostgreSQL** via API | `shared/schema.ts` + `server/routes/*.ts` |
| Page layout and copy (React) | **`client/src/pages/*.tsx`** | Can embed long text or import data |
| Static images, PDFs in public folder | **`client/public/`** | URL paths often start at `/...` from site root |
| Bundled images imported in code | **`client/src/assets/`** | Vite processes these; paths differ dev vs prod—prefer `public/` for simple static assets if unsure |
| User profile photo uploads | **`uploads/`** on server | See `server/routes/media.ts` |
| Textbook audio (production) | **Cloudflare R2** (optional) | Front end uses `VITE_R2_PUBLIC_URL`; helper: `client/src/lib/audio-storage.ts` |
| Bulk quiz sync between environments | **Root scripts** | e.g. `export-and-import-all-quizzes.ts`, `import-all-quizzes-complete.ts` — require DB URLs in env |

---

## Scripts: running and deploying (what the specialist needs to know)

From **`package.json`**:

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development: server + Vite (typical port in script is set via `PORT` / `.env`) |
| `npm run check` | TypeScript check (`tsc`) |
| `npm run lint` | ESLint |
| `npm run build` | Production build: includes DB push automation script + Vite build + server bundle to `dist/` |
| `npm run start` | Run compiled production server (`dist/index.js`) |

**`DATABASE_URL` is required** for the server to connect to the DB (`server/db.ts`).

**Production:** The hosting platform (e.g. Render) runs `build` then `start` and must provide `DATABASE_URL` and other secrets via environment variables—not committed files.

---

## API surface (where behavior lives)

Registration happens in **`server/routes.ts`**, which mounts:

- `server/routes/auth.ts` — login, register, session
- `server/routes/courses.ts` — course CRUD, progress, enrollment-related flows
- `server/routes/quizzes.ts` — quiz fetch, submit, attempts
- `server/routes/media.ts` — uploads, image listing
- `server/routes/profile.ts`, `essays.ts`, `forum.ts`, `admin.ts`, `instructor.ts`, etc.

**Health checks:** `GET /api/health`, `GET /api/health/detailed` (DB connectivity, pool stats).

**Unmatched `/api/*`:** Returns JSON 404 (not HTML).

---

## Safe workflow for a designer-heavy change

1. **Visual-only** (colors, spacing, typography): `client/src/index.css`, Tailwind classes in components/pages, `tailwind.config.ts` if needed.
2. **New screen**: new file in `client/src/pages/` + entry in `route-config.tsx`.
3. **New field on user/course/quiz**: `shared/schema.ts` + migration + API route + UI form.
4. **New static asset**: put in `client/public/` unless you know the bundler import pattern well.

Always run **`npm run check`** (and **`npm run lint`** if the team uses it) before handing work back.

---

## Security & privacy (don’t skip)

- Never commit **`.env`** with real passwords or API keys.
- **Admin/diagnostic** endpoints may require extra headers/passwords in production—see `server/routes.ts`.
- **Rate limiting** is applied to `/api/*` (in-memory; scaling to multiple servers may need a shared store later).

---

## Who to ask / what to read next

**If the goal is “make it look better”:** start in `client/src/pages/` and shared components under `client/src/components/ui/`.

**If the goal is “add a course like an existing one”:** clone the closest existing course’s **DB pattern** + **page set** + **routes**, then align IDs and URLs.

**Canonical deep references:**

1. `package.json` — scripts and stack
2. `client/src/routes/route-config.tsx` — all URLs
3. `shared/schema.ts` — all persisted data shapes
4. `server/routes.ts` + `server/routes/courses.ts` + `server/routes/quizzes.ts` — how data is read/written
5. `client/src/lib/queryClient.ts` — how the browser calls the API
6. `env.example` — required and optional configuration

---

## Document info

- **Purpose:** Onboard a web specialist or developer who will design pages and ship updates without getting lost in the repo.
- **Maintainer tip:** When you add a major new subsystem, add one short subsection here under “Folder map” or “Courses” so the next person stays oriented.

---

*End of handoff document.*
