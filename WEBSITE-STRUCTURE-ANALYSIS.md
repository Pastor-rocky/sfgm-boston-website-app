# SFGM Boston Website - Complete Structure Analysis

## Overview
This is a full-stack Bible school learning management system built with:
- **Frontend**: React + TypeScript + Vite + Wouter (routing) + TanStack Query (data fetching)
- **Backend**: Express.js + TypeScript + Node.js
- **Database**: PostgreSQL (currently local, migrating to Neon)
- **ORM**: Drizzle ORM
- **Authentication**: Token-based (stored in localStorage + cookies)

---

## Architecture Overview

### Tech Stack
```
Frontend (client/)
├── React 18.3.1
├── TypeScript 5.6.3
├── Vite 5.4.19 (build tool)
├── Wouter 3.3.5 (routing)
├── TanStack Query 5.60.5 (API state management)
├── Tailwind CSS 3.4.17 (styling)
└── Radix UI (component library)

Backend (server/)
├── Express 4.21.2
├── TypeScript 5.6.3
├── Drizzle ORM 0.39.1
├── PostgreSQL (via pg 8.16.3)
└── bcryptjs 3.0.2 (password hashing)

Database
├── PostgreSQL (local development)
└── Neon (production target)
```

---

## Project Structure

```
SFGM Boston Website/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── pages/            # All page components (100+ pages)
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/          # Radix UI components
│   │   │   └── *.tsx        # Custom components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities (queryClient, utils)
│   │   ├── routes/         # Route configuration
│   │   └── assets/         # Images, logos, videos
│   └── index.html
│
├── server/                   # Express backend API
│   ├── routes/              # API route handlers
│   │   ├── auth.ts         # Authentication endpoints
│   │   ├── courses.ts      # Course management
│   │   ├── quizzes.ts      # Quiz operations
│   │   ├── essays.ts       # Essay submissions
│   │   ├── media.ts         # Media uploads
│   │   ├── bible.ts         # Bible study features
│   │   └── profile.ts       # User profiles
│   ├── services/            # Business logic
│   ├── middleware/          # Express middleware
│   ├── utils/              # Helper functions
│   ├── storage.ts          # Database operations (3000+ lines)
│   ├── db.ts               # Database connection
│   └── index.ts            # Server entry point
│
├── shared/                  # Shared code between frontend/backend
│   └── schema.ts           # Drizzle ORM schema (900+ lines)
│
├── migrations/              # Database migrations
│   ├── 0000_neat_raza.sql  # Initial schema
│   └── 0001_add_quiz_indexes.sql
│
└── dist/                    # Build output (production)
```

---

## Database Schema (PostgreSQL)

### Core Tables

#### Users & Authentication
- **users**: User accounts (id, email, username, password, role, profile data)
- **auth_tokens**: Authentication tokens with expiration
- **sessions**: OAuth session storage

#### Courses & Content
- **courses**: Course definitions (id, name, description, duration, instructor)
- **course_modules**: Course modules/weeks (videos, readings, quizzes)
- **course_videos**: Video content for courses
- **course_readings**: Reading materials (legacy, now using textbook_chapters)
- **enrollments**: Student course enrollments
- **course_completions**: Course completion tracking
- **certificates**: Generated certificates

#### Quizzes & Assessments
- **quizzes**: Quiz definitions (linked to modules)
- **quiz_questions**: Quiz questions (multiple choice, true/false, essay)
- **quiz_attempts**: Student quiz submissions (answers, scores, essays)
- **quiz_retake_permissions**: Instructor-approved retakes
- **essays**: Separate essay submissions for final exams
- **essay_submissions**: Essay tracking and grading

#### Progress Tracking
- **progress**: Module completion tracking
- **content_progress**: Video/reading/quiz completion
- **reading_progress**: Textbook reading progress (page tracking)
- **course_instructions_viewed**: Tracks if user viewed course instructions

#### Textbooks & Books
- **textbook_projects**: AI-generated textbook projects
- **textbook_chapters**: Chapter content for textbooks
- **textbook_chapter_tests**: Tests for textbook chapters
- **external_books**: PDF books and suggested reading
- **book_chapters**: Extracted PDF content
- **personal_library**: User's saved book suggestions

#### Mini Courses
- **mini_courses**: Optional courses (Genesis to Revelation, etc.)
- **mini_course_content**: Lesson content for mini courses
- **mini_course_progress**: Student progress in mini courses
- **mini_course_enrollments**: Mini course enrollments

#### Special Features
- **announcements**: Site-wide announcements
- **genesis_videos**: Genesis study videos
- **sunday_messages**: Sunday sermon videos
- **genesis_quizzes**: Genesis study quizzes
- **genesis_quiz_attempts**: Guest quiz attempts
- **genesis_guest_registrations**: Guest user registrations

#### Instructor/Admin
- **instructor_permissions**: Course permissions for instructors
- **instructor_applications**: Instructor application submissions
- **instructor_approvals**: Dean approval system
- **grade_modifications**: Grade change audit trail

#### Media
- **images**: Image metadata and file paths
- **assignments**: Course assignments
- **assignment_submissions**: Student assignment submissions

---

## How Data Flows

### Frontend → Backend Communication

1. **API Client** (`client/src/lib/queryClient.ts`):
   - Uses native `fetch()` API
   - Adds `Authorization: Bearer {token}` header from localStorage
   - Handles errors and 401 responses
   - Uses TanStack Query for caching and state management

2. **Authentication Flow**:
   ```
   User Login → POST /api/auth/login
   → Server validates credentials
   → Server generates token: `sfgm_{userId}_{timestamp}`
   → Token stored in:
      - localStorage: 'auth_token'
      - Cookie: 'authToken' (for compatibility)
   → Frontend redirects to dashboard
   ```

3. **API Request Pattern**:
   ```typescript
   // Example from student-dashboard.tsx
   const { data: courses } = useQuery({
     queryKey: ['/api/courses'],
     // Automatically adds auth token from localStorage
   });
   ```

### Backend → Database Communication

1. **Database Connection** (`server/db.ts`):
   - Uses `pg` (node-postgres) Pool
   - Connection string from `DATABASE_URL` env variable
   - Pool configuration: max 5 connections, 30s idle timeout
   - Drizzle ORM wraps the pool for type-safe queries

2. **Storage Layer** (`server/storage.ts`):
   - `DatabaseStorage` class implements `IStorage` interface
   - All database operations go through this layer
   - Methods like `getUser()`, `enrollStudent()`, `submitQuizAttempt()`
   - Uses Drizzle ORM for type-safe queries

3. **Example Flow**:
   ```
   API Request → Express Route Handler
   → Calls storage method (e.g., storage.getUser(id))
   → Drizzle ORM generates SQL
   → PostgreSQL executes query
   → Results returned to route handler
   → JSON response sent to frontend
   ```

---

## How Pages Work

### Page Types

1. **Marketing Pages** (`marketingRoutes`):
   - Landing page, Bible school info, contact, etc.
   - Public access, no authentication required

2. **Student Pages** (`studentRoutes`):
   - Dashboard, profile, course detail, quiz taking
   - Requires authentication
   - Uses `useAuth()` hook to check login status

3. **Course Content Pages** (`audioAndCourseContentRoutes`):
   - Individual chapter pages (e.g., `/acts-audio-player-ch1`)
   - Audio players, video viewers, reading content
   - Progress tracking integrated

4. **E-book Pages** (`ebookRoutes`):
   - Complete course e-books
   - Chapter navigation, reading progress

### Page Creation Process

1. **Create Page Component** (`client/src/pages/new-page.tsx`)
2. **Add Route** (`client/src/routes/route-config.tsx`):
   ```typescript
   createRoute("/new-page", () => import("@/pages/new-page"))
   ```
3. **Frontend automatically loads** via React.lazy()

---

## How Data Gets Saved

### Quiz Submissions
```
User takes quiz → Frontend collects answers
→ POST /api/quizzes/:id/attempt
→ Route handler validates data (Zod schema)
→ Calls storage.submitQuizAttempt()
→ Database inserts into quiz_attempts table
→ Returns quiz attempt with score
→ Frontend updates UI with results
```

### Course Enrollment
```
User clicks "Enroll" → Frontend calls POST /api/courses/:id/enroll
→ Route handler checks authentication
→ Calls storage.enrollStudent()
→ Database inserts into enrollments table
→ Returns enrollment confirmation
→ Frontend updates dashboard
```

### Progress Tracking
```
User watches video/completes reading
→ Frontend calls POST /api/courses/:id/progress
→ Route handler updates content_progress table
→ Progress percentage calculated
→ Frontend updates progress indicators
```

### Essay Submissions
```
User submits final exam essay
→ Frontend calls POST /api/essays/submit
→ Route handler saves to essays table
→ Email sent to instructor (if EMAIL_ENABLED=true)
→ Essay stored with status "submitted"
→ Instructor can grade via admin panel
```

---

## Database Connection (Current vs Neon)

### Current Setup (Local)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/sfgm_boston
```

### Neon Setup (Production Target)
```env
DATABASE_URL=postgresql://user:password@neon-host.neon.tech/dbname?sslmode=require
```

### Migration Process
1. **Export local database**:
   ```bash
   pg_dump $LOCAL_DATABASE_URL > backup.sql
   ```

2. **Create Neon database**:
   - Sign up at neon.tech
   - Create new project
   - Copy connection string

3. **Update .env**:
   ```env
   DATABASE_URL=<neon-connection-string>
   ```

4. **Run migrations**:
   ```bash
   npm run db:push
   # OR
   psql $DATABASE_URL < migrations/0000_neat_raza.sql
   psql $DATABASE_URL < migrations/0001_add_quiz_indexes.sql
   ```

5. **Import data** (if needed):
   ```bash
   psql $DATABASE_URL < backup.sql
   ```

---

## Server Configuration

### Development Mode
```bash
npm run dev
# Runs: NODE_ENV=development node --env-file=.env node_modules/.bin/tsx server/index.ts
# Serves on: http://localhost:55555
# Vite dev server integrated for hot reload
```

### Production Build
```bash
npm run build
# Builds frontend: vite build → dist/public/
# Builds backend: esbuild server/index.ts → dist/index.js
```

### Production Start
```bash
npm start
# Runs: NODE_ENV=production node dist/index.js
# Serves static files from dist/public/
# API routes from Express server
```

---

## Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default: 55555)
- `NODE_ENV`: development or production

### Optional
- `OPENAI_API_KEY`: For TTS features
- `EMAIL_ENABLED`: Enable email forwarding (true/false)
- `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, etc.: Email service config
- `SIMPLETEXTING_API_TOKEN`: SMS notifications
- `SENTRY_DSN`: Error tracking

---

## Key Features

### 1. Course Management
- Multiple courses with modules/weeks
- Videos, readings, quizzes per module
- Prerequisite system
- Progress tracking

### 2. Quiz System
- Multiple question types (MCQ, true/false, essay)
- Time limits, passing scores
- Retake permissions
- Final exams with essay requirements

### 3. Certificate Generation
- Automatic certificate creation on course completion
- PDF download functionality
- Certificate tracking in database

### 4. Instructor Portal
- Course content management
- Student management
- Grade modifications
- Quiz publishing

### 5. Textbook System
- PDF extraction and storage
- Chapter-based reading
- Reading progress tracking
- AI-generated textbooks

### 6. Mini Courses
- Optional courses (Genesis to Revelation, etc.)
- Guest access for some content
- Progress tracking for authenticated users

---

## Authentication System

### Token Storage
- **Primary**: `localStorage.getItem('auth_token')`
- **Backup**: Cookie `authToken` (for compatibility)
- **Format**: `sfgm_{userId}_{timestamp}`

### Token Validation
- Middleware checks token on every API request
- Token stored in `auth_tokens` table with expiration
- Expired tokens cleaned up automatically

### User Roles
- `student`: Default role
- `instructor`: Can manage courses
- `admin`: Full access
- `dean`: Can approve instructors and modify grades

---

## File Storage

### Media Files
- Uploaded files stored in `uploads/` directory
- File metadata in `images` table
- Video URLs can be YouTube links or local files

### Course Content
- PDFs extracted and stored in database (textbook_chapters)
- Audio files referenced by path
- Videos can be YouTube embeds or local files

---

## Deployment Considerations

### For Neon Migration
1. **Connection String Format**:
   - Neon uses pooled connections: `postgresql://user:pass@host/db?sslmode=require`
   - May need to use `@neondatabase/serverless` package (already installed)

2. **Environment Variables**:
   - Update `.env` with Neon connection string
   - Keep all other variables the same

3. **Database Schema**:
   - Run `npm run db:push` to sync schema
   - Or apply migrations manually

4. **Data Migration**:
   - Export local database
   - Import to Neon
   - Verify data integrity

5. **Connection Pooling**:
   - Neon recommends connection pooling for serverless
   - Current code uses `pg.Pool` which should work
   - May need to adjust pool settings for Neon

---

## Important Files Reference

### Configuration
- `package.json`: Dependencies and scripts
- `vite.config.ts`: Frontend build config
- `drizzle.config.ts`: Database ORM config
- `tsconfig.json`: TypeScript config
- `.env`: Environment variables (not in git)

### Core Application Files
- `server/index.ts`: Express server entry point
- `server/db.ts`: Database connection
- `server/storage.ts`: All database operations (3000+ lines)
- `shared/schema.ts`: Database schema definitions
- `client/src/App.tsx`: React app entry point
- `client/src/routes/route-config.tsx`: Route definitions

### Key Components
- `client/src/components/course-content-viewer.tsx`: Main course viewer
- `client/src/components/certificate.tsx`: Certificate generation
- `client/src/pages/student-dashboard.tsx`: Student dashboard
- `client/src/pages/quiz-take.tsx`: Quiz interface

---

## Development Workflow

### Adding a New Feature
1. Update database schema in `shared/schema.ts` if needed
2. Run `npm run db:push` to update database
3. Add API route in `server/routes/`
4. Add frontend page/component in `client/src/`
5. Add route in `client/src/routes/route-config.tsx`
6. Test locally with `npm run dev`

### Creating a New Course
- Use `auto-create-course.py` script (automated)
- Or manually create pages, routes, and database entries
- See `AUTO-COURSE-CREATOR.md` for details

---

## Summary

This is a comprehensive learning management system with:
- ✅ Full authentication and authorization
- ✅ Course management with videos, readings, quizzes
- ✅ Progress tracking and certificates
- ✅ Instructor portal for content management
- ✅ Textbook system with PDF extraction
- ✅ Mini courses and guest access
- ✅ Essay submission and grading
- ✅ Student dashboards and analytics

**Current State**: Running on local PostgreSQL
**Target**: Deploy to Neon PostgreSQL (same schema, different connection string)

The system is production-ready and just needs the database connection string updated for Neon deployment.

