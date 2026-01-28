# Complete Agent Onboarding Guide 🚀

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [How Data Gets Saved](#how-data-gets-saved)
4. [Database System](#database-system)
5. [Server System](#server-system)
6. [Frontend System](#frontend-system)
7. [Testing Workflow](#testing-workflow)
8. [Deployment Process](#deployment-process)
9. [Configuration](#configuration)
10. [Common Tasks](#common-tasks)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 System Overview

### What This Application Is
**SFGM Boston Bible School** - A complete online learning management system (LMS) for Bible school courses.

### Key Features
- User authentication (login/register)
- Course enrollment and management
- Video lessons, readings, and quizzes
- Progress tracking
- Quiz submissions with scoring
- Essay submissions for final exams
- Student dashboards
- Instructor/admin panels
- Personal library for textbooks
- Discussion forums
- Bible study tools

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, TanStack Query, Wouter (routing)
- **Backend**: Express.js, TypeScript, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Render.com
- **Storage**: Cloudflare R2 (for media files)

---

## 🏗️ Architecture

### High-Level Flow
```
User Browser
    ↓
React Frontend (Vite)
    ↓
Express API Server
    ↓
PostgreSQL Database
```

### Directory Structure
```
SFGM Boston Website:App/
├── client/              # React frontend
│   └── src/
│       ├── pages/       # Page components
│       ├── components/  # Reusable components
│       ├── lib/         # Utilities (queryClient, auth)
│       └── routes/      # Route configuration
├── server/              # Express backend
│   ├── routes/          # API route handlers
│   ├── storage.ts       # Database operations layer
│   ├── db.ts            # Database connection
│   ├── middleware/      # Express middleware
│   └── utils/           # Utility functions
├── shared/              # Shared code
│   └── schema.ts        # Drizzle ORM schema
└── migrations/          # Database migrations
```

---

## 💾 How Data Gets Saved

### Complete Data Flow

#### 1. User Action → Frontend
User interacts with UI (clicks button, submits form, etc.)

#### 2. Frontend → API Request
Frontend uses `apiRequest()` function from `client/src/lib/queryClient.ts`:
```typescript
const response = await apiRequest('POST', '/api/endpoint', data);
```

**What `apiRequest` does:**
- Gets auth token from `localStorage.getItem('auth_token')`
- Adds `Authorization: Bearer {token}` header
- Sends request to server
- Handles errors and 401 responses

#### 3. API Route Handler
Request hits Express route in `server/routes/*.ts`:
- Validates authentication (via `requireAuth` middleware)
- Validates request body (via Zod schemas)
- Calls storage method

#### 4. Storage Layer
`server/storage.ts` contains `DatabaseStorage` class:
- Uses Drizzle ORM to build SQL queries
- Executes queries against PostgreSQL
- Returns data to route handler

#### 5. Database
PostgreSQL stores data in tables defined in `shared/schema.ts`

#### 6. Response → Frontend
- Route handler returns JSON response
- Frontend updates UI (via TanStack Query)
- User sees updated data

### Example: Quiz Submission

```
1. User completes quiz → Frontend collects answers
2. Frontend: apiRequest('POST', '/api/quizzes/:id/attempt', answers)
3. Route: server/routes/quizzes.ts → POST /api/quizzes/:id/attempt
4. Route validates data with Zod schema
5. Route calls: storage.submitQuizAttempt(studentId, quizId, answers)
6. Storage: Inserts into quiz_attempts table via Drizzle
7. Database: Saves quiz attempt with score
8. Response: Returns { attempt, score, passed }
9. Frontend: Updates UI with results
```

### Example: Course Enrollment

```
1. User clicks "Enroll" button
2. Frontend: apiRequest('POST', '/api/courses/:id/enroll')
3. Route: server/routes/courses.ts → POST /api/courses/:id/enroll
4. Route checks authentication
5. Route calls: storage.enrollStudent(studentId, courseId)
6. Storage: Inserts into enrollments table
7. Database: Creates enrollment record
8. Response: Returns enrollment confirmation
9. Frontend: Updates dashboard to show enrolled course
```

### Example: Progress Tracking

```
1. User watches video or completes reading
2. Frontend: apiRequest('POST', '/api/content-progress', { completed: true })
3. Route: server/routes/courses.ts → POST /api/content-progress
4. Route calls: storage.updateContentProgress(...)
5. Storage: Updates/inserts into content_progress table
6. Database: Saves progress (with transaction for atomicity)
7. Response: Returns { success: true }
8. Frontend: Updates progress indicators
```

---

## 🗄️ Database System

### Database Type
**PostgreSQL** - Relational database

### Connection
- **File**: `server/db.ts`
- **Connection Pool**: 30 connections (default, configurable via `DB_POOL_SIZE`)
- **ORM**: Drizzle ORM (type-safe SQL queries)
- **Connection String**: From `DATABASE_URL` environment variable

### Connection Pool Configuration
```typescript
// server/db.ts
const poolSize = parseInt(process.env.DB_POOL_SIZE || '30', 10);
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: poolSize, // 30 default
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
```

**Why Connection Pooling:**
- Reuses database connections (faster)
- Limits concurrent connections (prevents overload)
- Handles connection errors gracefully

### Schema Definition
- **File**: `shared/schema.ts`
- **Tables**: 44 tables defined with Drizzle ORM
- **Key Tables**:
  - `users` - User accounts
  - `courses` - Course definitions
  - `enrollments` - Student enrollments
  - `quizzes` - Quiz definitions
  - `quiz_attempts` - Quiz submissions
  - `content_progress` - Video/reading progress
  - `essays` - Final exam essays

### Database Operations
All database operations go through `server/storage.ts`:

```typescript
// Example: Get user
const user = await storage.getUser(userId);

// Example: Enroll student
await storage.enrollStudent(studentId, courseId);

// Example: Submit quiz
const attempt = await storage.submitQuizAttempt(studentId, quizId, answers);
```

**Why Storage Layer:**
- Centralized database access
- Type-safe queries (Drizzle)
- Consistent error handling
- Easy to test and maintain

### Database Migrations
- **Directory**: `migrations/`
- **Tool**: Drizzle Kit
- **Command**: `npm run db:push`
- **Purpose**: Update database schema

### Indexes (Performance)
Database has 20+ indexes for fast queries:
- Foreign key indexes
- Composite indexes for common queries
- Created in `migrations/0001_add_quiz_indexes.sql`

---

## 🖥️ Server System

### Server Framework
**Express.js** - Node.js web framework

### Server Entry Point
- **File**: `server/index.ts`
- **Port**: Configurable via `PORT` env variable (default: 55555, local: 56000)
- **Mode**: Development (Vite) or Production (static files)

### Server Startup Process
1. Load environment variables (`.env`)
2. Test database connection (with retry logic)
3. Setup Express app
4. Setup routes (API endpoints)
5. Setup Vite (dev) or static files (prod)
6. Start listening on port

### Route Organization
Routes are organized by domain in `server/routes/`:
- `auth.ts` - Login, register, logout
- `courses.ts` - Course listing, enrollment, progress
- `quizzes.ts` - Quiz fetching, submission
- `essays.ts` - Essay submission, grading
- `profile.ts` - User profile management
- `admin.ts` - Admin functions
- etc.

### Middleware
- **Authentication**: `requireAuth` - Checks for valid auth token
- **Rate Limiting**: `apiRateLimit` - Prevents API abuse (no login/register rate limit)
- **Error Handling**: `sendErrorResponse` - Consistent error responses
- **Body Parsing**: `express.json()` - Parses JSON requests

### API Endpoints Structure
```
/api/auth/login          - POST - User login
/api/auth/register       - POST - User registration
/api/courses             - GET - List courses
/api/courses/:id/enroll  - POST - Enroll in course
/api/quizzes/:id         - GET - Get quiz
/api/quizzes/:id/attempt - POST - Submit quiz
/api/content-progress    - POST - Update progress
/api/health              - GET - Health check
/api/health/detailed     - GET - Detailed health (with pool stats)
```

### Authentication System
- **Token-Based**: Custom token system
- **Token Format**: `sfgm_{userId}_{timestamp}`
- **Storage**: 
  - `localStorage` (frontend): `auth_token`
  - `auth_tokens` table (database): For validation
- **Middleware**: `extractAuthToken()` gets token from header/cookie

### Error Handling
- **Centralized**: `server/utils/errorHandler.ts`
- **Retry Logic**: `server/utils/retry.ts` - Retries failed operations
- **User-Friendly**: Errors return helpful messages (not technical details)

---

## 🎨 Frontend System

### Framework
**React 18** with **TypeScript**

### Build Tool
**Vite** - Fast development and build tool

### State Management
**TanStack Query** (React Query):
- Handles API calls
- Caching
- Automatic refetching
- Optimistic updates

### Routing
**Wouter** - Lightweight React router

### API Client
**File**: `client/src/lib/queryClient.ts`

**Function**: `apiRequest(method, url, data)`
- Automatically adds auth token
- Handles errors
- Returns fetch Response

### Component Structure
- **Pages**: `client/src/pages/` - Full page components
- **Components**: `client/src/components/` - Reusable components
- **Routes**: `client/src/routes/route-config.tsx` - Route definitions

### Data Fetching Pattern
```typescript
// Using TanStack Query
const { data, isLoading } = useQuery({
  queryKey: ['/api/courses'],
  queryFn: () => apiRequest('GET', '/api/courses').then(r => r.json())
});
```

### Mutations Pattern
```typescript
// Using TanStack Query
const mutation = useMutation({
  mutationFn: (data) => apiRequest('POST', '/api/endpoint', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/data'] });
  }
});
```

---

## 🧪 Testing Workflow

### ⚠️ CRITICAL: Always Test Locally First

**The Standard Workflow:**
```
1. Make Changes → Edit code locally
2. Test Locally → localhost:56000
3. Verify Everything Works
4. Deploy to Production
```

### Why Test Locally First
- **See changes before students do**
- **Catch issues early**
- **Safe testing** (local database, can't break production)
- **Professional workflow**

### Starting Local Server

**Command:**
```bash
cd "/Users/rocky/Desktop/SFGM Boston Website:App  "
npm run test:local
```

**Or:**
```bash
PORT=56000 npm run dev
```

**What Happens:**
1. Server starts on port 56000
2. Vite dev server starts (hot reload)
3. Database connection tested
4. Server ready at `http://localhost:56000`

### Local vs Production

**Local (Your Mac):**
- **URL**: `http://localhost:56000`
- **Database**: Local PostgreSQL (separate from production)
- **Environment**: Development mode
- **Purpose**: Testing changes safely

**Production (Render.com):**
- **URL**: Your actual domain
- **Database**: Production PostgreSQL (separate from local)
- **Environment**: Production mode
- **Purpose**: Live website for students

**⚠️ IMPORTANT**: They are **completely separate**. Local testing cannot affect production data.

### Testing Checklist

Before deploying ANY changes:

**Code Quality:**
- [ ] `npm run test:check` passes (TypeScript)
- [ ] No console errors (browser or server)
- [ ] All imports resolve

**Server:**
- [ ] Server starts without errors
- [ ] Database connects successfully
- [ ] Server responds to requests

**Authentication:**
- [ ] Can login with existing account
- [ ] Can register new account
- [ ] Logout works
- [ ] Session persists

**Student Features:**
- [ ] Can view courses
- [ ] Can enroll in courses
- [ ] Can watch videos
- [ ] Can mark content complete
- [ ] Can take quizzes
- [ ] Progress saves correctly

**Data Integrity:**
- [ ] No duplicate records
- [ ] Progress saves correctly
- [ ] Quiz attempts save correctly
- [ ] No data corruption

**Error Handling:**
- [ ] Error messages are helpful
- [ ] No crashes
- [ ] Handles errors gracefully

### Local Database Setup

**If database connection fails:**
1. Check PostgreSQL is running: `brew services list`
2. Start PostgreSQL: `brew services start postgresql@15`
3. Check `.env` file has correct `DATABASE_URL`
4. Test connection: Server will retry automatically

---

## 🚀 Deployment Process

### Deployment Platform
**Render.com** - Platform-as-a-Service (PaaS)

### Deployment Flow
```
1. Code Changes → Git Commit
2. Push to GitHub
3. Render detects push
4. Render runs: npm install
5. Render runs: npm run build
6. Render runs: npm start
7. Service live at Render URL
```

### Build Process

**Command**: `npm run build`

**What It Does:**
1. Installs dependencies
2. Builds frontend: `vite build` → `dist/public/`
3. Builds backend: `esbuild server/index.ts` → `dist/index.js`

**Output:**
- `dist/public/` - Static frontend files
- `dist/index.js` - Bundled server

### Production Start

**Command**: `npm start`

**What It Does:**
- Runs: `NODE_ENV=production node dist/index.js`
- Serves static files from `dist/public/`
- Serves API routes from Express server

### Environment Variables (Production)

**Required in Render Dashboard:**
```env
DATABASE_URL=postgresql://... (production database)
NODE_ENV=production
PORT=55555 (or Render's assigned port)
DB_POOL_SIZE=30 (recommended, or omit to use default)
```

### Render Configuration

**Build Command**: `npm run build`
**Start Command**: `npm start`
**Plan**: Professional ($25/month) recommended for 500+ students

### Deployment Checklist

**Before Deploying:**
- [ ] All changes tested locally
- [ ] No errors in local testing
- [ ] Code committed to Git
- [ ] Environment variables set in Render

**After Deploying:**
- [ ] Health check works: `/api/health`
- [ ] Homepage loads
- [ ] Login works
- [ ] Database connection works

---

## ⚙️ Configuration

### Environment Variables

**File**: `.env` (local) or Render Dashboard (production)

**Required:**
```env
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=development (or production)
PORT=56000 (local) or 55555 (production)
```

**Optional (Recommended for Production):**
```env
DB_POOL_SIZE=30
```

**See**: `env.example` for all available variables

### Database Connection Pool

**Default**: 30 connections
**Configurable**: Via `DB_POOL_SIZE` environment variable
**File**: `server/db.ts`

**Recommended Values:**
- Development: 5-10
- Launch (200-500 students): 20-25
- Growth (500-1,000 students): 25-30
- Scale (1,000+ students): 30-40

### Rate Limiting

**File**: `server/middleware/rateLimit.ts`

**Current Limits:**
- **Auth**: 5 requests per 15 minutes (security)
- **API**: 250 requests per 15 minutes
- **Content Updates**: 30 requests per minute

### Port Configuration

**Local Development**: Port 56000
**Production**: Port 55555 (or Render's assigned port)

**Why Different Ports:**
- Local uses 56000 to avoid conflicts
- Production uses 55555 (or Render's port)
- Configured via `PORT` environment variable

---

## 🔧 Common Tasks

### Adding a New API Endpoint

1. **Create Route Handler** in `server/routes/your-domain.ts`:
```typescript
router.post("/api/your-endpoint", requireAuth, async (req, res) => {
  try {
    const data = req.body;
    const result = await storage.yourMethod(data);
    res.json(result);
  } catch (error) {
    sendErrorResponse(res, error, "Your Endpoint");
  }
});
```

2. **Register Route** in `server/routes.ts`:
```typescript
import { registerYourRoutes } from "./routes/your-domain";
registerYourRoutes(app);
```

3. **Add Storage Method** in `server/storage.ts`:
```typescript
async yourMethod(data: YourType): Promise<ResultType> {
  return await db.insert(yourTable).values(data).returning();
}
```

4. **Test Locally**: `npm run test:local`
5. **Deploy**: Push to Git, Render auto-deploys

### Adding a New Frontend Page

1. **Create Page** in `client/src/pages/your-page.tsx`:
```typescript
export default function YourPage() {
  return <div>Your Page Content</div>;
}
```

2. **Add Route** in `client/src/routes/route-config.tsx`:
```typescript
createRoute("/your-page", () => import("@/pages/your-page"))
```

3. **Test Locally**: `npm run test:local`
4. **Deploy**: Push to Git, Render auto-deploys

### Updating Database Schema

1. **Update Schema** in `shared/schema.ts`
2. **Push Changes**: `npm run db:push`
3. **Test Locally**: Verify changes work
4. **Deploy**: Push to Git, Render auto-deploys

### Viewing Logs

**Local:**
- Server logs: Terminal where `npm run test:local` is running
- Browser logs: F12 → Console tab

**Production (Render):**
- Render Dashboard → Your Service → Logs tab

### Health Check

**Endpoint**: `/api/health/detailed`

**Returns:**
- Server status
- Database connection status
- Connection pool statistics
- Memory usage
- Response times

**Use**: Monitor system health and performance

---

## 🐛 Troubleshooting

### Server Won't Start

**Check:**
1. Port already in use? `lsof -ti:56000 | xargs kill -9`
2. Database running? `brew services start postgresql@15`
3. `.env` file exists? Check `DATABASE_URL` is set
4. Dependencies installed? `npm install`

### Database Connection Fails

**Check:**
1. PostgreSQL running? `brew services list`
2. `DATABASE_URL` correct in `.env`?
3. Database exists? Check connection string
4. Server will retry automatically (5 attempts)

### Login Not Working

**Check:**
1. Database connected? Check server logs
2. User exists? Check database
3. Password correct? Check hashing
4. Token generation working? Check `server/routes/auth.ts`

### Changes Not Appearing

**Check:**
1. Server restarted? Restart `npm run test:local`
2. Browser cache? Hard refresh (Cmd+Shift+R)
3. Build successful? Check for errors
4. Correct file edited? Verify file path

### Production Issues

**Check:**
1. Render logs: Dashboard → Logs
2. Health endpoint: `/api/health/detailed`
3. Environment variables: Dashboard → Environment
4. Database connection: Check `DATABASE_URL` in Render

---

## 📚 Key Files Reference

### Configuration
- `CONFIGURATION-SUMMARY.md` - Single source of truth for config
- `env.example` - Environment variable template
- `package.json` - Scripts and dependencies

### Code
- `server/db.ts` - Database connection
- `server/storage.ts` - All database operations
- `server/routes.ts` - Route registration
- `server/index.ts` - Server entry point
- `shared/schema.ts` - Database schema

### Documentation
- `YOUR-WORKFLOW.md` - Testing workflow
- `BEST-SETUP.md` - Production setup
- `HIGH-CAPACITY-SETUP.md` - Scaling guide
- `RENDER-AND-NEON-CAPACITY-UPGRADE.md` - Render + Neon capacity upgrades
- `PENDING-CHANGES-NO-PUSH.md` - Local changes not yet pushed (review before push)
- `VERIFICATION-COMPLETE.md` - Configuration verification

---

## ✅ Quick Reference

### Start Local Testing
```bash
npm run test:local
# Opens: http://localhost:56000
```

### Check Code Quality
```bash
npm run test:check
```

### Build for Production
```bash
npm run build
```

### Push Database Schema
```bash
npm run db:push
```

### Health Check
```bash
curl http://localhost:56000/api/health/detailed
```

---

## 🎯 Important Reminders

### ⚠️ Always Test Locally First
- Never deploy without local testing
- Use `localhost:56000` for testing
- Verify everything works before deploying

### ⚠️ Local and Production Are Separate
- Local database ≠ Production database
- Local testing cannot affect production
- Safe to test anything locally

### ⚠️ Configuration Consistency
- Check `CONFIGURATION-SUMMARY.md` for current config
- Default pool size: 30
- API rate limit: 250/15min
- Auth rate limit: 5/15min (security-critical)

### ⚠️ Database Operations
- All go through `server/storage.ts`
- Use Drizzle ORM (type-safe)
- Transactions for critical operations

### ⚠️ Error Handling
- Use `sendErrorResponse()` for API errors
- Use `withRetry()` for database operations
- User-friendly error messages

---

## 🚀 Getting Started (For New Agent)

1. **Read This Document** - Understand the system
2. **Check Configuration** - Read `CONFIGURATION-SUMMARY.md`
3. **Start Local Server** - `npm run test:local`
4. **Test Basic Features** - Login, view courses, etc.
5. **Make Small Change** - Test workflow
6. **Review Code** - Understand structure
7. **Ask Questions** - If anything unclear

---

**Last Updated**: Today
**Status**: ✅ Complete and Ready
**Next Review**: When system changes significantly

---

**This document contains everything you need to understand and work with this system. Refer to it whenever you need context or guidance.** 📚
