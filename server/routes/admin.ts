import type { Express, Request, Response, NextFunction } from "express";
import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { storage } from "../storage";
import { db } from "../db";
import { users, courses, enrollments, quizAttempts, contentProgress, authTokens, essaySubmissions, quizzes, churchInstructorInfo } from "../../shared/schema";
import { eq, sql, inArray } from "drizzle-orm";
import { requireAuth } from "../middleware/requireAuth";
import { validateBody } from "../middleware/validate";
import { rateLimit } from "../middleware/rateLimit";

// Admin password from environment variable (fallback to "123" only for development)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.ADMIN_PANEL_PASSWORD || (process.env.NODE_ENV === 'development' ? "123" : null);

if (!ADMIN_PASSWORD) {
  console.error("⚠️  WARNING: ADMIN_PASSWORD environment variable is not set. Admin routes will be disabled.");
}

// Strict rate limit for admin endpoints (brute-force + abuse protection)
const adminRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 60, // 60 requests per 5 minutes per IP/user
  message: 'Too many admin requests. Please slow down.',
  keyGenerator: (req) => String((req as any).user?.id || req.ip || 'anonymous'),
});

// Lockout tracker for repeated wrong admin-password attempts (in-memory)
const adminPasswordFailures: Record<string, { count: number; firstAt: number; lockedUntil?: number }> = {};
const ADMIN_FAIL_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const ADMIN_LOCK_MS = 15 * 60 * 1000; // 15 minutes
const ADMIN_MAX_FAILS = 10;

// Admin password check middleware
const requireAdminPassword = (req: Request, res: Response, next: NextFunction) => {
  if (!ADMIN_PASSWORD) {
    return res.status(503).json({ message: "Admin panel is not configured" });
  }
  const key = String(req.ip || 'anonymous');
  const now = Date.now();

  // If locked, block immediately
  const entry = adminPasswordFailures[key];
  if (entry?.lockedUntil && entry.lockedUntil > now) {
    return res.status(429).json({
      message: 'Too many invalid admin password attempts. Please try again later.',
      code: 'ADMIN_LOCKED',
      retryAfter: Math.ceil((entry.lockedUntil - now) / 1000),
    });
  }

  const providedPassword = req.headers['x-admin-password'];
  if (providedPassword !== ADMIN_PASSWORD) {
    // Track failures in a rolling window
    const current = adminPasswordFailures[key];
    if (!current || now - current.firstAt > ADMIN_FAIL_WINDOW_MS) {
      adminPasswordFailures[key] = { count: 1, firstAt: now };
    } else {
      current.count += 1;
      if (current.count >= ADMIN_MAX_FAILS) {
        current.lockedUntil = now + ADMIN_LOCK_MS;
      }
    }

    return res.status(401).json({ message: 'Invalid admin password' });
  }

  // Reset failure counter on success
  if (adminPasswordFailures[key]) {
    delete adminPasswordFailures[key];
  }
  next();
};

export function registerAdminRoutes(app: Express) {
  const router = Router();

  // Apply stricter rate limiting to admin routes
  router.use("/api/admin", adminRateLimit);

  // Get all users
  router.get("/api/admin/users", requireAuth, requireAdminPassword, async (req: Request, res: Response) => {
    try {
      const allUsers = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        role: users.role,
        createdAt: users.createdAt,
        isBlocked: users.isBlocked,
        hasPassword: sql<boolean>`${users.password} IS NOT NULL`,
        sfgmChurch: users.sfgmChurch,
      }).from(users).orderBy(users.createdAt);

      res.json({ 
        users: allUsers,
        count: allUsers.length 
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Delete user
  router.delete("/api/admin/users/:id", requireAuth, requireAdminPassword, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Delete all related data first
      await db.delete(contentProgress).where(eq(contentProgress.studentId, id));
      await db.delete(quizAttempts).where(eq(quizAttempts.studentId, id));
      await db.delete(enrollments).where(eq(enrollments.studentId, id));
      await db.delete(authTokens).where(eq(authTokens.userId, id));
      await db.delete(essaySubmissions).where(eq(essaySubmissions.studentId, id));

      // Delete the user
      await db.delete(users).where(eq(users.id, id));

      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Get student grades
  router.get("/api/admin/users/:id/grades", requireAuth, requireAdminPassword, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const attempts = await db.select()
        .from(quizAttempts)
        .where(eq(quizAttempts.studentId, id))
        .orderBy(quizAttempts.completedAt);

      // Get quiz details for each attempt
      const validQuizIds = attempts.map(a => a.quizId).filter((id): id is number => id !== null);
      const uniqueQuizIds = Array.from(new Set(validQuizIds));
      const quizDetails = uniqueQuizIds.length > 0 
        ? await db.select().from(quizzes).where(inArray(quizzes.id, uniqueQuizIds))
        : [];

      const grades = attempts.map(attempt => {
        const quiz = quizDetails.find((q: any) => q.id === attempt.quizId);
        const score = attempt.score ? parseFloat(String(attempt.score)) : 0;
        return {
          quizId: attempt.quizId,
          quizTitle: quiz?.title || "Unknown Quiz",
          score: score,
          scorePercent: (score * 100).toFixed(1),
          completedAt: attempt.completedAt,
          passed: score >= 0.7,
        };
      });

      res.json({ grades });
    } catch (error) {
      console.error("Error fetching grades:", error);
      res.status(500).json({ message: "Failed to fetch grades" });
    }
  });

  // Check if user has password
  router.get("/api/admin/users/:id/password", requireAuth, requireAdminPassword, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [user] = await db.select({ password: users.password })
        .from(users)
        .where(eq(users.id, id));

      res.json({ 
        hasPassword: !!user?.password,
        note: "Passwords are hashed and cannot be retrieved. You can reset it below."
      });
    } catch (error) {
      console.error("Error checking password:", error);
      res.status(500).json({ message: "Failed to check password" });
    }
  });

  // Update user role
  const updateRoleSchema = z.object({
    role: z.enum(["student", "instructor", "admin", "dean"]),
  });

  router.patch("/api/admin/users/:id/role", requireAuth, requireAdminPassword, validateBody(updateRoleSchema), async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { role } = req.validatedBody;

      // Prevent changing to admin role (only one admin exists)
      if (role === "admin") {
        return res.status(403).json({ message: "Cannot change user role to admin. Admin role is restricted." });
      }

      // Get current user to check if they're trying to change admin's role
      const [currentUser] = await db.select().from(users).where(eq(users.id, id));
      if (currentUser && currentUser.role === "admin") {
        return res.status(403).json({ message: "Cannot change admin user's role." });
      }

      const [updatedUser] = await db
        .update(users)
        .set({ role, updatedAt: new Date() } as any)
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Change user password
  const changePasswordSchema = z.object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
  });

  router.put("/api/admin/users/:id/password", requireAuth, requireAdminPassword, validateBody(changePasswordSchema), async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.validatedBody;

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await db.update(users)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(users.id, id));

      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  // Update user's church
  const updateChurchSchema = z.object({
    sfgmChurch: z.union([z.string(), z.null()]).optional(),
  });

  router.patch("/api/admin/users/:id/church", requireAuth, requireAdminPassword, validateBody(updateChurchSchema), async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { sfgmChurch } = req.validatedBody;

      // Handle null, undefined, or empty string as null
      const churchValue = sfgmChurch === null || sfgmChurch === undefined || sfgmChurch === "" ? null : sfgmChurch;

      console.log(`[UPDATE CHURCH] User ID: ${id}, New Church: ${churchValue || 'null'}`);

      const [updatedUser] = await db
        .update(users)
        .set({ sfgmChurch: churchValue, updatedAt: new Date() } as any)
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        console.error(`[UPDATE CHURCH] User not found: ${id}`);
        return res.status(404).json({ message: "User not found" });
      }

      console.log(`[UPDATE CHURCH] Success! User ${id} church updated to: ${updatedUser.sfgmChurch || 'null'}`);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating user church:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update user church";
      res.status(500).json({ message: errorMessage, error: String(error) });
    }
  });

  // Add new user
  const addUserSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().optional().default(""),
    email: z.string().email(),
    username: z.string().min(3),
    phone: z.string().optional(),
    password: z.string().min(6),
    role: z.enum(["student", "instructor", "admin", "dean"]).default("student"),
    sfgmChurch: z.string().optional().nullable(),
  });

  router.post("/api/admin/users", requireAuth, requireAdminPassword, validateBody(addUserSchema), async (req: any, res: Response) => {
    try {
      const payload = req.validatedBody;

      // Check if email or username already exists
      const existingEmail = await storage.getUserByEmail(payload.email);
      if (existingEmail) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const existingUsername = await storage.getUserByUsername(payload.username.toLowerCase());
      if (existingUsername) {
        return res.status(409).json({ message: "Username already taken" });
      }

      const hashedPassword = await bcrypt.hash(payload.password, 10);
      const id = `user_${randomUUID()}`;

      const newUser = await storage.createUser({
        id,
        email: payload.email.toLowerCase(),
        username: payload.username.toLowerCase(),
        password: hashedPassword,
        firstName: payload.firstName,
        lastName: payload.lastName ?? "",
        phone: payload.phone || null,
        role: payload.role,
        sfgmChurch: payload.sfgmChurch || null,
        emailVerified: true,
        registrationMethod: "email",
      } as any);

      // If this is an instructor with a church, only update church instructor info if it doesn't exist
      // This allows multiple instructors per church without overwriting the default
      if (payload.role === "instructor" && payload.sfgmChurch) {
        try {
          const existing = await db
            .select()
            .from(churchInstructorInfo)
            .where(eq(churchInstructorInfo.church, payload.sfgmChurch))
            .limit(1);
          
          // Only set default if no default exists yet
          if (existing.length === 0) {
            const fullName = `${payload.firstName} ${payload.lastName || ""}`.trim();
            await db
              .insert(churchInstructorInfo)
              .values({
                church: payload.sfgmChurch,
                instructorName: fullName,
                email: payload.email.toLowerCase(),
                phone: payload.phone || null,
                updatedAt: new Date(),
              } as any);
          }
        } catch (error) {
          // Log but don't fail the user creation if church instructor update fails
          console.error("Error updating church instructor info:", error);
        }
      }

      res.status(201).json({ 
        success: true, 
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        }
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Get all courses
  router.get("/api/admin/courses", requireAuth, requireAdminPassword, async (req: Request, res: Response) => {
    try {
      const allCourses = await db.select().from(courses).orderBy(courses.id);
      res.json({ courses: allCourses });
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Add new course
  const addCourseSchema = z.object({
    name: z.string().min(1, "Course name is required"),
    description: z.string().optional(),
    duration: z.number().int().positive("Duration must be a positive number"),
    category: z.string().optional(),
    difficulty: z.string().optional(),
    points: z.number().int().optional(),
  });

  router.post("/api/admin/courses", requireAuth, requireAdminPassword, validateBody(addCourseSchema), async (req: any, res: Response) => {
    try {
      const payload = req.validatedBody;
      const newCourse = await storage.createCourse({
        name: payload.name,
        description: payload.description || null,
        duration: payload.duration,
        category: payload.category || null,
        difficulty: payload.difficulty || null,
        points: payload.points || null,
        isActive: true,
      } as any);

      res.status(201).json({ 
        success: true, 
        course: {
          id: newCourse.id,
          title: newCourse.name,
          name: newCourse.name,
          description: newCourse.description,
          duration: newCourse.duration,
        }
      });
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Assign instructor to course
  const assignInstructorSchema = z.object({
    instructorId: z.string().optional().nullable(),
  });

  router.patch("/api/admin/courses/:id/instructor", requireAuth, requireAdminPassword, validateBody(assignInstructorSchema), async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const courseId = parseInt(id);
      const { instructorId } = req.validatedBody;
      
      if (isNaN(courseId) || courseId <= 0) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      
      await db
        .update(courses)
        .set({ instructorId: instructorId || null, updatedAt: new Date() } as any)
        .where(eq(courses.id, courseId));
      
      res.json({ success: true, message: "Instructor assigned successfully" });
    } catch (error) {
      console.error("Error assigning instructor:", error);
      res.status(500).json({ message: "Failed to assign instructor" });
    }
  });

  // Delete course
  router.delete("/api/admin/courses/:id", requireAuth, requireAdminPassword, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const courseId = parseInt(id);
      
      if (isNaN(courseId) || courseId <= 0) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      
      await db.delete(courses).where(eq(courses.id, courseId));
      res.json({ success: true, message: "Course deleted successfully" });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // Church instructor info (name, email, phone) — admin editable
  const churchInstructorSchema = z.object({
    instructorName: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
  });

  router.get("/api/admin/church-instructors", requireAuth, requireAdminPassword, async (_req: Request, res: Response) => {
    try {
      const rows = await db.select().from(churchInstructorInfo);
      const map: Record<string, { instructorName: string | null; email: string | null; phone: string | null }> = {};
      for (const r of rows) {
        map[r.church] = {
          instructorName: r.instructorName ?? null,
          email: r.email ?? null,
          phone: r.phone ?? null,
        };
      }
      res.json(map);
    } catch (error) {
      console.error("Error fetching church instructors:", error);
      res.status(500).json({ message: "Failed to fetch church instructor info" });
    }
  });

  router.put("/api/admin/church-instructors/:church", requireAuth, requireAdminPassword, validateBody(churchInstructorSchema), async (req: any, res: Response) => {
    try {
      const church = decodeURIComponent(req.params.church);
      const body = req.validatedBody;
      const payload = {
        church,
        instructorName: body.instructorName?.trim() || null,
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        updatedAt: new Date(),
      };
      await db
        .insert(churchInstructorInfo)
        .values(payload as any)
        .onConflictDoUpdate({
          target: churchInstructorInfo.church,
          set: {
            instructorName: payload.instructorName,
            email: payload.email,
            phone: payload.phone,
            updatedAt: payload.updatedAt,
          } as any,
        });
      res.json({ success: true, church, ...payload });
    } catch (error) {
      console.error("Error updating church instructor:", error);
      res.status(500).json({ message: "Failed to update church instructor info" });
    }
  });


  // Get student enrollments
  router.get("/api/admin/users/:id/enrollments", requireAuth, requireAdminPassword, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const studentEnrollments = await storage.getStudentEnrollments(id);
      res.json({ enrollments: studentEnrollments });
    } catch (error) {
      console.error("Error fetching student enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  // Get student course progress
  router.get("/api/admin/users/:id/progress/:courseId", requireAuth, requireAdminPassword, async (req: Request, res: Response) => {
    try {
      const { id, courseId } = req.params;
      const courseIdNum = parseInt(courseId);
      if (isNaN(courseIdNum)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      const progress = await storage.getContentProgress(id, courseIdNum);
      res.json({ progress });
    } catch (error) {
      console.error("Error fetching student progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Block/unblock user
  const blockUserSchema = z.object({
    isBlocked: z.boolean(),
  });

  router.patch("/api/admin/users/:id/block", requireAuth, requireAdminPassword, validateBody(blockUserSchema), async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { isBlocked } = req.validatedBody;

      // Prevent blocking admin
      const [currentUser] = await db.select().from(users).where(eq(users.id, id));
      if (currentUser && currentUser.role === "admin") {
        return res.status(403).json({ message: "Cannot block admin user" });
      }

      const [updatedUser] = await db
        .update(users)
        .set({ isBlocked, updatedAt: new Date() } as any)
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating user block status:", error);
      res.status(500).json({ message: "Failed to update block status" });
    }
  });

  // Enroll student in course
  const enrollStudentSchema = z.object({
    courseId: z.number().int().positive(),
    chosenInstructorId: z.string().optional().nullable(),
  });

  router.post("/api/admin/users/:id/enroll", requireAuth, requireAdminPassword, validateBody(enrollStudentSchema), async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { courseId, chosenInstructorId } = req.validatedBody;

      // Check if already enrolled
      const existing = await db.select()
        .from(enrollments)
        .where(eq(enrollments.studentId, id))
        .where(eq(enrollments.courseId, courseId))
        .limit(1);

      if (existing.length > 0) {
        return res.status(409).json({ message: "Student is already enrolled in this course" });
      }

      await storage.enrollStudent({
        studentId: id,
        courseId,
        chosenInstructorId: chosenInstructorId || null,
        status: "active",
      } as any);
      res.json({ success: true, message: "Student enrolled successfully" });
    } catch (error) {
      console.error("Error enrolling student:", error);
      res.status(500).json({ message: "Failed to enroll student" });
    }
  });

  // Unenroll student from course
  router.delete("/api/admin/users/:id/enrollments/:courseId", requireAuth, requireAdminPassword, async (req: Request, res: Response) => {
    try {
      const { id, courseId } = req.params;
      const courseIdNum = parseInt(courseId);
      if (isNaN(courseIdNum)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      await storage.unenrollStudent(id, courseIdNum);
      res.json({ success: true, message: "Student unenrolled successfully" });
    } catch (error) {
      console.error("Error unenrolling student:", error);
      res.status(500).json({ message: "Failed to unenroll student" });
    }
  });

  app.use(router);
}

