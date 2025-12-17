import type { Express, Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { storage } from "../storage";
import { db } from "../db";
import { users, courses, enrollments, quizAttempts, contentProgress, authTokens, essaySubmissions, quizzes } from "../../shared/schema";
import { eq, sql, inArray } from "drizzle-orm";
import { requireAuth } from "../middleware/requireAuth";
import { validateBody } from "../middleware/validate";

const ADMIN_PASSWORD = "123"; // Password-protected admin panel

// Admin password check middleware
const requireAdminPassword = (req: Request, res: Response, next: any) => {
  const providedPassword = req.headers['x-admin-password'] || req.body?.adminPassword;
  if (providedPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid admin password" });
  }
  next();
};

export function registerAdminRoutes(app: Express) {
  const router = Router();

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
      }).from(users).orderBy(users.createdAt);

      res.json({ users: allUsers });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
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
      const quizIds = [...new Set(attempts.map(a => a.quizId))];
      const quizDetails = quizIds.length > 0 
        ? await db.select().from(quizzes).where(inArray(quizzes.id, quizIds))
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

  // Add new user
  const addUserSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    username: z.string().min(3),
    phone: z.string().optional(),
    password: z.string().min(6),
    role: z.enum(["student", "instructor", "admin", "dean"]).default("student"),
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
        lastName: payload.lastName,
        phone: payload.phone || null,
        role: payload.role,
        emailVerified: true,
        registrationMethod: "email",
      } as any);

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

  // Delete course
  router.delete("/api/admin/courses/:id", requireAuth, requireAdminPassword, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(courses).where(eq(courses.id, parseInt(id)));
      res.json({ success: true, message: "Course deleted successfully" });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  app.use(router);
}

