import type { Express, Request, Response, NextFunction } from "express";
import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import {
  users,
  courses,
  enrollments,
  quizAttempts,
  quizzes,
  courseModules,
  essaySubmissions,
} from "../../shared/schema";
import { DEFAULT_PASSING_SCORE } from "../../shared/course-constants";
import { eq, desc, inArray, and, or, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/requireAuth";
import { validateBody } from "../middleware/validate";

function requireInstructor(req: Request, res: Response, next: NextFunction) {
  const u = (req as any).user;
  if (!u) {
    return res.status(401).json({ message: "Authentication required" });
  }
  const role = (u.role || "").toLowerCase();
  if (!["instructor", "admin", "dean"].includes(role)) {
    return res.status(403).json({ message: "Instructor access required" });
  }
  next();
}

const reviewSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  feedback: z.string().optional(),
});

export function registerInstructorRoutes(app: Express) {
  const router = Router();

  // List students with enrollments and grades (for instructor dashboard / student-management)
  router.get(
    "/api/instructor/students",
    requireAuth,
    requireInstructor,
    async (req: any, res: Response) => {
      try {
        const instructorId = req.user?.id;
        const instructorRole = (req.user?.role || "").toLowerCase();
        const isDeanOrAdmin = ["dean", "admin"].includes(instructorRole);
        
        // Get instructor's info (for church filtering)
        const [instructor] = instructorId
          ? await db.select().from(users).where(eq(users.id, instructorId)).limit(1)
          : [];
        const instructorChurch = (instructor as any)?.sfgmChurch;

        // For deans/admins: show all students
        // For instructors: filter by assigned courses and optionally by church
        let studentIds: string[] = [];
        
        if (isDeanOrAdmin) {
          // Deans/admins see all students
          const allStudents = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.role, "student"));
          studentIds = allStudents.map((s) => s.id);
        } else if (instructorId) {
          // Regular instructors: get students from their assigned courses
          const instructorCourses = await db
            .select({ id: courses.id })
            .from(courses)
            .where(eq(courses.instructorId, instructorId));
          const courseIds = instructorCourses.map((c) => c.id);
          
          if (courseIds.length > 0) {
            const enrollments = await db
              .select({ studentId: enrollments.studentId })
              .from(enrollments)
              .where(inArray(enrollments.courseId, courseIds));
            studentIds = [...new Set(enrollments.map((e) => e.studentId).filter(Boolean))] as string[];
          }
        }

        if (studentIds.length === 0) {
          return res.json([]);
        }

        // Get students - filtered by course enrollment (already have studentIds)
        const students = await db
          .select({
            id: users.id,
            username: users.username,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            phone: users.phone,
            isBlocked: users.isBlocked,
            sfgmChurch: users.sfgmChurch,
          })
          .from(users)
          .where(and(eq(users.role, "student"), inArray(users.id, studentIds)))
          .orderBy(users.createdAt);

        // Get instructor's assigned courses first (or all for deans/admins)
        let instructorCourseIds: number[] = [];
        if (!isDeanOrAdmin && instructorId) {
          const instructorCourses = await db
            .select({ id: courses.id })
            .from(courses)
            .where(eq(courses.instructorId, instructorId));
          instructorCourseIds = instructorCourses.map((c) => c.id);
        } else if (isDeanOrAdmin) {
          // Deans/admins see all courses
          const allCourses = await db.select({ id: courses.id }).from(courses);
          instructorCourseIds = allCourses.map((c) => c.id);
        }
        
        // Get enrollments only for instructor's courses (or all for deans/admins)
        let enrollmentList: any[] = [];
        if (studentIds.length > 0) {
          if (instructorCourseIds.length > 0) {
            enrollmentList = await db
              .select()
              .from(enrollments)
              .where(
                and(
                  inArray(enrollments.studentId, studentIds),
                  inArray(enrollments.courseId, instructorCourseIds)
                )
              );
          } else {
            // No courses assigned - return empty
            enrollmentList = [];
          }
        }
        
        const courseIds = [...new Set(enrollmentList.map((e) => e.courseId).filter(Boolean))] as number[];
        const courseList =
          courseIds.length > 0
            ? await db.select().from(courses).where(inArray(courses.id, courseIds))
            : [];

        // Get quizzes for instructor's courses only
        let quizIds: number[] = [];
        if (courseIds.length > 0) {
          const modules = await db
            .select({ id: courseModules.id })
            .from(courseModules)
            .where(inArray(courseModules.courseId, courseIds));
          const moduleIds = modules.map((m) => m.id);
          
          if (moduleIds.length > 0) {
            const quizzesForCourses = await db
              .select({ id: quizzes.id })
              .from(quizzes)
              .where(inArray(quizzes.moduleId, moduleIds));
            quizIds = quizzesForCourses.map((q) => q.id);
          }
        }
        
        // Get quiz attempts only for instructor's quizzes (or all for deans/admins)
        const attempts = quizIds.length > 0
          ? await db
              .select()
              .from(quizAttempts)
              .where(
                and(
                  inArray(quizAttempts.studentId, studentIds),
                  inArray(quizAttempts.quizId, quizIds)
                )
              )
          : [];
        
        const quizList =
          quizIds.length > 0
            ? await db.select().from(quizzes).where(inArray(quizzes.id, quizIds))
            : [];

        const byStudent = new Map<
          string,
          {
            enrollments: { id: number; name: string; grade: string | null }[];
            gpa: number | null;
          }
        >();

        for (const s of students) {
          const myEnrollments = enrollmentList.filter((e) => e.studentId === s.id);
          const enrolledCourses = myEnrollments.map((e) => {
            const c = courseList.find((c) => c.id === e.courseId);
            const grade = e.grade != null ? String(e.grade) : null;
            return {
              id: e.courseId,
              name: (c as any)?.name || "Unknown",
              grade,
            };
          });

          const myAttempts = attempts.filter((a) => a.studentId === s.id);
          let gpa: number | null = null;
          if (myAttempts.length > 0) {
            const scores = myAttempts
              .map((a) => (a.score != null ? parseFloat(String(a.score)) : null))
              .filter((x): x is number => x != null);
            if (scores.length) gpa = scores.reduce((a, b) => a + b, 0) / scores.length;
          }

          byStudent.set(s.id, { enrollments: enrolledCourses, gpa });
        }

        const result = students.map((s) => {
          const ext = byStudent.get(s.id);
          return {
            ...s,
            enrolledCourses: ext?.enrollments ?? [],
            gpa: ext?.gpa ?? null,
            sfgmChurch: (s as any).sfgmChurch || null,
          };
        });

        res.json(result);
      } catch (e) {
        console.error("Instructor students:", e);
        res.status(500).json({ message: "Failed to fetch students" });
      }
    }
  );

  // List essay submissions for review
  router.get(
    "/api/instructor/essay-submissions",
    requireAuth,
    requireInstructor,
    async (req: any, res: Response) => {
      try {
        const instructorId = req.user?.id;
        const instructorRole = (req.user?.role || "").toLowerCase();
        const isDeanOrAdmin = ["dean", "admin"].includes(instructorRole);

        // Get all essay submissions
        let list = await db
          .select()
          .from(essaySubmissions)
          .orderBy(desc(essaySubmissions.submittedAt));

        // Filter by instructor's courses (unless dean/admin)
        if (!isDeanOrAdmin && instructorId) {
          const instructorCourses = await db
            .select({ id: courses.id })
            .from(courses)
            .where(eq(courses.instructorId, instructorId));
          const instructorCourseIds = instructorCourses.map((c) => c.id);
          
          if (instructorCourseIds.length > 0) {
            // Get quizzes for instructor's courses
            const instructorModules = await db
              .select({ id: courseModules.id, courseId: courseModules.courseId })
              .from(courseModules)
              .where(inArray(courseModules.courseId, instructorCourseIds));
            const moduleIds = instructorModules.map((m) => m.id);
            
            if (moduleIds.length > 0) {
              const instructorQuizzes = await db
                .select({ id: quizzes.id })
                .from(quizzes)
                .where(inArray(quizzes.moduleId, moduleIds));
              const quizIds = instructorQuizzes.map((q) => q.id);
              
              // Filter essays to only those from instructor's quizzes
              list = list.filter((e) => quizIds.includes(e.quizId));
            } else {
              list = [];
            }
          } else {
            list = [];
          }
        }

        // Get related data for filtered essays
        const studentIds = [...new Set(list.map((e) => e.studentId))];
        const quizIds = [...new Set(list.map((e) => e.quizId))];
        const students =
          studentIds.length > 0
            ? await db.select({
                id: users.id,
                firstName: users.firstName,
                lastName: users.lastName,
                email: users.email,
              }).from(users).where(inArray(users.id, studentIds))
            : [];
        const quizList =
          quizIds.length > 0
            ? await db.select().from(quizzes).where(inArray(quizzes.id, quizIds))
            : [];
        const modIds = [...new Set(quizList.map((q) => q.moduleId).filter(Boolean))] as number[];
        const mods =
          modIds.length > 0
            ? await db.select().from(courseModules).where(inArray(courseModules.id, modIds))
            : [];
        const courseIds = [...new Set(mods.map((m) => (m as any).courseId).filter(Boolean))] as number[];
        const courseList =
          courseIds.length > 0
            ? await db.select().from(courses).where(inArray(courses.id, courseIds))
            : [];

        const byUser = new Map<string | number, any>();
        students.forEach((s) => byUser.set(s.id, s));
        quizList.forEach((q) => byUser.set(q.id, q));
        mods.forEach((m) => byUser.set((m as any).id, m));
        courseList.forEach((c) => byUser.set((c as any).id, c));

        const out = list.map((e) => {
          const student = students.find((s) => s.id === e.studentId);
          const quiz = quizList.find((q) => q.id === e.quizId);
          const mod = quiz ? mods.find((m) => (m as any).id === quiz.moduleId) : null;
          const course = mod ? courseList.find((c) => (c as any).id === (mod as any).courseId) : null;
          return {
            id: e.id,
            quizId: e.quizId,
            questionId: e.questionId,
            studentId: e.studentId,
            studentName: student
              ? `${student.firstName || ""} ${student.lastName || ""}`.trim() || student.email
              : "Unknown",
            studentEmail: student?.email ?? null,
            courseName: (course as any)?.name ?? "Unknown",
            quizTitle: (quiz as any)?.title ?? "Essay",
            essayText: e.essayText,
            wordCount: e.wordCount,
            submittedAt: e.submittedAt,
            status: e.status,
            reviewedAt: e.reviewedAt,
            feedback: e.feedback,
            grade: e.grade != null ? String(e.grade) : null,
          };
        });
        res.json(out);
      } catch (e) {
        console.error("Instructor essay-submissions:", e);
        res.status(500).json({ message: "Failed to fetch essay submissions" });
      }
    }
  );

  // Review (approve/reject) an essay submission
  router.patch(
    "/api/instructor/essay-submissions/:id/review",
    requireAuth,
    requireInstructor,
    validateBody(reviewSchema),
    async (req: any, res: Response) => {
      try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
          return res.status(400).json({ message: "Invalid submission ID" });
        }
        const { status, feedback } = req.validatedBody;
        const reviewerId = req.user?.id;

        const [updated] = await db
          .update(essaySubmissions)
          .set({
            status,
            feedback: feedback ?? null,
            reviewedAt: new Date(),
            reviewerId: reviewerId ?? null,
            updatedAt: new Date(),
          } as any)
          .where(eq(essaySubmissions.id, id))
          .returning();

        if (!updated) {
          return res.status(404).json({ message: "Essay submission not found" });
        }
        res.json(updated);
      } catch (e) {
        console.error("Instructor essay review:", e);
        res.status(500).json({ message: "Failed to review submission" });
      }
    }
  );

  // Get grades for a specific student (instructor view)
  router.get(
    "/api/instructor/students/:id/grades",
    requireAuth,
    requireInstructor,
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const attempts = await db
          .select()
          .from(quizAttempts)
          .where(eq(quizAttempts.studentId, id))
          .orderBy(desc(quizAttempts.completedAt));

        const quizIds = attempts.map((a) => a.quizId).filter(Boolean) as number[];
        const quizDetails =
          quizIds.length > 0
            ? await db.select().from(quizzes).where(inArray(quizzes.id, quizIds))
            : [];

        const grades = attempts.map((a) => {
          const quiz = quizDetails.find((q: any) => q.id === a.quizId);
          const score = a.score != null ? parseFloat(String(a.score)) : 0;
          const passingDecimal = ((quiz as any)?.passingScore ?? DEFAULT_PASSING_SCORE) / 100;
          return {
            quizId: a.quizId,
            quizTitle: (quiz as any)?.title ?? "Unknown",
            score,
            scorePercent: (score * 100).toFixed(1),
            completedAt: a.completedAt,
            passed: score >= passingDecimal,
          };
        });
        res.json({ grades });
      } catch (e) {
        console.error("Instructor student grades:", e);
        res.status(500).json({ message: "Failed to fetch grades" });
      }
    }
  );

  app.use(router);
}
