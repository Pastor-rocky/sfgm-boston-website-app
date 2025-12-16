# Quick Start Guide for Contributors

This guide helps new contributors get the SFGM Boston Bible School website running locally.

## Prerequisites

- **Node.js** 20.x or higher
- **npm** 9.x or higher
- **PostgreSQL** database (Neon, Supabase, or local)
- **Git** for version control

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd "SFGM Boston Website  copy"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp env.example .env

# Edit .env with your local database connection
nano .env  # or use your preferred editor
```

**Minimum required in `.env`:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/sfgm_boston
NODE_ENV=development
PORT=55555
```

### 4. Set Up Database

```bash
# Push database schema to your database
npm run db:push
```

This will create all necessary tables in your PostgreSQL database.

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at:
- **Frontend + API:** http://localhost:55555
- **API Health Check:** http://localhost:55555/api/health

---

## Project Structure

```
SFGM Boston Website  copy/
├── client/              # React frontend (Vite)
│   └── src/
│       ├── pages/       # Page components
│       ├── routes/      # Route configuration
│       └── ...
├── server/              # Express backend
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic services
│   ├── middleware/      # Express middleware
│   └── ...
├── shared/              # Shared code (schemas, types)
│   └── schema.ts        # Drizzle ORM schema
└── migrations/          # Database migrations
```

---

## Common Development Tasks

### Adding a New Route

1. **Create route handler** in `server/routes/your-domain.ts`:
   ```typescript
   import { Router } from "express";
   import { requireAuth } from "../middleware/requireAuth";
   import { validateBody } from "../middleware/validate";
   import { z } from "zod";

   export function registerYourRoutes(app: Express) {
     const router = Router();
     
     router.get("/api/your-endpoint", requireAuth, async (req, res) => {
       // Your code here
     });
     
     app.use(router);
   }
   ```

2. **Register in** `server/routes.ts`:
   ```typescript
   import { registerYourRoutes } from "./routes/your-domain";
   
   // In setupRoutes function:
   registerYourRoutes(app);
   ```

### Adding a New Frontend Page

1. **Create page component** in `client/src/pages/your-page.tsx`
2. **Add route** in `client/src/routes/route-config.tsx`:
   ```typescript
   export const studentRoutes = [
     // ... existing routes
     { path: "/your-page", component: React.lazy(() => import("@/pages/your-page")) },
   ];
   ```

### Testing Quiz Functionality

1. **Register a test user:**
   ```bash
   curl -X POST http://localhost:55555/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"test123"}'
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:55555/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

3. **Submit a quiz:**
   ```bash
   curl -X POST http://localhost:55555/api/quizzes/13/attempt \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"answers":{"1":"A","2":"B"},"timeSpent":5}'
   ```

### Testing Authentication Flow

The authentication system uses:
- **Registration:** `POST /api/auth/register`
- **Login:** `POST /api/auth/login`
- **Current User:** `GET /api/auth/me`
- **Logout:** `POST /api/auth/logout`

All protected routes use the `requireAuth` middleware which:
- Extracts token from `Authorization` header or cookies
- Sets `req.user` if authenticated
- Returns 401 if not authenticated

### Database Schema Changes

1. **Modify schema** in `shared/schema.ts`
2. **Generate migration:**
   ```bash
   npm run db:push
   ```
   Or create manual migration in `migrations/`

3. **Apply migration** to your database

---

## Key Concepts

### Authentication

- Uses token-based auth stored in `auth_tokens` table
- Tokens can be sent via:
  - `Authorization: Bearer <token>` header
  - `auth_token` cookie
- Middleware: `requireAuth` in `server/middleware/requireAuth.ts`

### Quiz System

- **Service Layer:** `server/services/quizService.ts`
  - Handles quiz submission logic
  - Includes retry logic and transaction safety
- **Monitoring:** `server/services/quizMonitoring.ts`
  - Tracks failed submissions
  - Provides monitoring hooks
- **Routes:** `server/routes/quizzes.ts`
  - All quiz-related endpoints
  - Uses `requireAuth` and `validateBody` middleware

### Course System

- **Routes:** `server/routes/courses.ts`
- Handles enrollments, progress tracking, GPA calculation
- All endpoints require authentication

### Route Organization

Routes are organized by domain:
- `auth.ts` - Authentication
- `quizzes.ts` - Quiz functionality
- `courses.ts` - Course management
- `media.ts` - File uploads, images, TTS
- `bible.ts` - Bible study AI features
- `profile.ts` - User profile management
- `essays.ts` - Essay submissions

Each router is registered in `server/routes.ts`.

---

## Development Workflow

### Making Changes

1. **Create feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** following the patterns above

3. **Test locally:**
   ```bash
   npm run dev
   # Test your changes at http://localhost:55555
   ```

4. **Check for TypeScript errors:**
   ```bash
   npm run check
   ```

5. **Commit and push:**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/your-feature-name
   ```

### Code Style

- Use TypeScript for all new code
- Follow existing patterns (see route examples above)
- Use Zod for validation schemas
- Use `requireAuth` middleware for protected routes
- Use `validateBody` middleware for POST/PUT requests

---

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
node -e "import('./server/db.js').then(({db}) => db.execute('SELECT 1').then(() => console.log('OK')).catch(e => console.error('FAIL', e)))"
```

### Port Already in Use

```bash
# Find process using port 55555
lsof -i :55555

# Kill process
kill -9 <PID>
```

### Build Errors

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Quiz Submission Not Working

1. Check quiz monitoring: `GET /api/quizzes/monitoring/stats`
2. Check database connection
3. Verify quiz exists: `GET /api/quizzes/:quizId`
4. Check application logs

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run check            # TypeScript type checking

# Database
npm run db:push          # Push schema changes

# Backups
npm run backup-quizzes   # Export quiz data
```

---

## API Endpoints Reference

### Health & Monitoring
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system status
- `GET /api/uptime` - Server uptime

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Quizzes
- `GET /api/quizzes/:quizId` - Get quiz
- `POST /api/quizzes/:quizId/attempt` - Submit quiz
- `GET /api/quizzes/export` - Export quiz data
- `GET /api/quizzes/monitoring/stats` - Monitoring stats

### Courses
- `GET /api/courses` - List courses
- `POST /api/enroll` - Enroll in course
- `GET /api/content-progress/:courseId` - Get progress

---

## Getting Help

- Check existing code for examples
- Review `DEPLOYMENT.md` for production setup
- Check `PROJECT-OVERHAUL-PLAN.md` for project structure
- Review route handlers in `server/routes/` for patterns

---

**Last Updated:** Phase 5 - Deployment & Operations
**Version:** 1.0


