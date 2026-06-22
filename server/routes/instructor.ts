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
  instructorMessages,
  certificates,
  courseCompletions,
  instructorSessions,
  instructorApplications,
} from "../../shared/schema";
import { DEFAULT_PASSING_SCORE } from "../../shared/course-constants";
import { eq, desc, inArray, and, or, sql, count, asc } from "drizzle-orm";
import { requireAuth } from "../middleware/requireAuth";
import { validateBody } from "../middleware/validate";
import { sendInstructorMessageEmail } from "../services/emailService";
import { sendStudentSms, getSmsConfigStatus } from "../services/twilioService";
import { createZoomMeeting, getZoomConfigStatus } from "../services/zoomService";
import {
  fetchPublicCalendarEvents,
  getGoogleCalendarConfigStatus,
  getGoogleCalendarEmbedUrl,
} from "../services/googleCalendarService";
import { storage } from "../storage";

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

const messageSendSchema = z.object({
  studentId: z.string().min(1),
  channel: z.enum(["portal", "email", "sms"]),
  subject: z.string().optional(),
  body: z.string().min(1),
});

const reviewApplicationSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  adminNotes: z.string().optional(),
});

const zoomSessionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  courseId: z.coerce.number().int().positive().optional(),
  scheduledAt: z.string().optional(),
  durationMinutes: z.coerce.number().int().min(15).max(480).optional(),
});

const issueCertificateSchema = z.object({
  studentId: z.string().min(1),
  courseId: z.coerce.number().int().positive(),
  finalGrade: z.coerce.number().min(0).max(100).optional(),
  completionDate: z.string().optional(),
});

function hasDeanAccess(user: any): boolean {
  const role = (user?.role || "").toLowerCase();
  return (
    ["dean", "admin"].includes(role) ||
    (user?.email || "").toLowerCase() === "pastor_rocky@sfgmboston.com"
  );
}

function normalizeGpa(score: number): number {
  if (score <= 1) return Math.round(score * 1000) / 10;
  if (score <= 100) return Math.round(score * 10) / 10;
  return Math.round(score * 10) / 10;
}

async function getDeanStudentIds(): Promise<string[]> {
  const [byRole, byEnrollment] = await Promise.all([
    db.select({ id: users.id }).from(users).where(eq(users.role, "student")),
    db.selectDistinct({ studentId: enrollments.studentId }).from(enrollments),
  ]);
  const ids = new Set<string>();
  byRole.forEach((s) => ids.add(s.id));
  byEnrollment.forEach((e) => {
    if (e.studentId) ids.add(e.studentId);
  });
  return [...ids];
}

async function getInstructorCourseIds(
  instructorId: string | undefined,
  user: any,
): Promise<number[]> {
  if (hasDeanAccess(user)) {
    const all = await db.select({ id: courses.id }).from(courses);
    return all.map((c) => c.id);
  }
  if (!instructorId) return [];
  const rows = await db
    .select({ id: courses.id })
    .from(courses)
    .where(eq(courses.instructorId, instructorId));
  return rows.map((c) => c.id);
}

function buildCertificateNumber(studentId: string): string {
  return `SFGM-${Date.now().toString(36).toUpperCase()}-${studentId.slice(-4).toUpperCase()}`;
}

async function getAccessibleStudentIds(
  instructorId: string | undefined,
  user: any,
): Promise<string[]> {
  if (hasDeanAccess(user)) {
    return getDeanStudentIds();
  }

  if (!instructorId) return [];

  const instructorCourses = await db
    .select({ id: courses.id })
    .from(courses)
    .where(eq(courses.instructorId, instructorId));
  const courseIds = instructorCourses.map((c) => c.id);

  if (courseIds.length === 0) return [];

  const enrollmentRows = await db
    .select({ studentId: enrollments.studentId })
    .from(enrollments)
    .where(inArray(enrollments.courseId, courseIds));

  return [...new Set(enrollmentRows.map((e) => e.studentId).filter(Boolean))] as string[];
}

async function assertStudentAccess(
  instructorId: string | undefined,
  user: any,
  studentId: string,
): Promise<boolean> {
  const accessibleIds = await getAccessibleStudentIds(instructorId, user);
  return accessibleIds.includes(studentId);
}

function requireDean(req: any, res: Response, next: NextFunction) {
  if (!hasDeanAccess(req.user)) {
    return res.status(403).json({ message: "Dean access required" });
  }
  next();
}

export function registerInstructorRoutes(app: Express) {
  const router = Router();

  // Real dashboard statistics from the database
  router.get(
    "/api/instructor/dashboard/stats",
    requireAuth,
    requireInstructor,
    async (req: any, res: Response) => {
      try {
        const user = req.user;
        const instructorId = user?.id;
        const dean = hasDeanAccess(user);
        const courseIds = await getInstructorCourseIds(instructorId, user);
        const studentIds = await getAccessibleStudentIds(instructorId, user);

        const allEnrollments =
          courseIds.length > 0
            ? await db
                .select()
                .from(enrollments)
                .where(inArray(enrollments.courseId, courseIds))
            : [];

        const activeEnrollments = allEnrollments.filter((e) => e.status === "active");
        const completedEnrollments = allEnrollments.filter((e) => e.status === "completed");
        const enrolledStudentIds = new Set(
          allEnrollments.map((e) => e.studentId).filter(Boolean),
        );

        const courseList =
          courseIds.length > 0
            ? await db.select().from(courses).where(inArray(courses.id, courseIds))
            : [];

        const courseEnrollmentCounts = courseList.map((c) => ({
          courseId: c.id,
          courseName: c.name,
          enrollments: allEnrollments.filter((e) => e.courseId === c.id).length,
          active: allEnrollments.filter((e) => e.courseId === c.id && e.status === "active")
            .length,
          completed: allEnrollments.filter(
            (e) => e.courseId === c.id && e.status === "completed",
          ).length,
        }));

        let essayQuery = await db.select().from(essaySubmissions).orderBy(desc(essaySubmissions.submittedAt));
        if (!dean && courseIds.length > 0) {
          const modules = await db
            .select({ id: courseModules.id })
            .from(courseModules)
            .where(inArray(courseModules.courseId, courseIds));
          const moduleIds = modules.map((m) => m.id);
          if (moduleIds.length > 0) {
            const courseQuizzes = await db
              .select({ id: quizzes.id })
              .from(quizzes)
              .where(inArray(quizzes.moduleId, moduleIds));
            const quizIds = courseQuizzes.map((q) => q.id);
            essayQuery = essayQuery.filter((e) => quizIds.includes(e.quizId));
          } else {
            essayQuery = [];
          }
        }

        const pendingEssays = essayQuery.filter((e) => e.status === "submitted");

        const issuedCerts =
          courseIds.length > 0
            ? await db
                .select()
                .from(certificates)
                .where(inArray(certificates.courseId, courseIds))
            : [];

        const certPairs = new Set(issuedCerts.map((c) => `${c.userId}:${c.courseId}`));
        const certsPending = allEnrollments.filter(
          (e) =>
            e.status === "completed" &&
            e.studentId &&
            !certPairs.has(`${e.studentId}:${e.courseId}`),
        );

        const churchRows =
          studentIds.length > 0
            ? await db
                .select({
                  church: users.sfgmChurch,
                  count: count(),
                })
                .from(users)
                .where(inArray(users.id, studentIds))
                .groupBy(users.sfgmChurch)
            : [];

        const churches = churchRows
          .filter((r) => r.church)
          .map((r) => ({ name: r.church as string, count: Number(r.count) }))
          .sort((a, b) => b.count - a.count);

        const recentEnrollments = [...allEnrollments]
          .sort(
            (a, b) =>
              new Date(b.enrolledAt || 0).getTime() - new Date(a.enrolledAt || 0).getTime(),
          )
          .slice(0, 8);

        const recentStudentIds = [
          ...new Set(recentEnrollments.map((e) => e.studentId).filter(Boolean)),
        ] as string[];
        const recentStudents =
          recentStudentIds.length > 0
            ? await db.select().from(users).where(inArray(users.id, recentStudentIds))
            : [];

        const recentActivity = recentEnrollments.map((e) => {
          const student = recentStudents.find((s) => s.id === e.studentId);
          const course = courseList.find((c) => c.id === e.courseId);
          const name =
            student &&
            (`${student.firstName || ""} ${student.lastName || ""}`.trim() ||
              student.username ||
              student.email);
          return {
            studentName: name || "Student",
            courseName: course?.name || "Course",
            status: e.status,
            enrolledAt: e.enrolledAt,
          };
        });

        res.json({
          role: dean ? (user?.role === "admin" ? "admin" : "dean") : "instructor",
          deanAccess: dean,
          totalStudents: studentIds.length,
          studentsWithEnrollments: enrolledStudentIds.size,
          totalEnrollments: allEnrollments.length,
          activeEnrollments: activeEnrollments.length,
          completedEnrollments: completedEnrollments.length,
          totalCourses: courseList.length,
          pendingEssays: pendingEssays.length,
          certificatesIssued: issuedCerts.length,
          certificatesPending: certsPending.length,
          churches,
          courseEnrollmentCounts,
          recentEnrollments: recentActivity,
          pendingEssayPreview: await Promise.all(
            pendingEssays.slice(0, 6).map(async (e) => {
              const [student] = await db
                .select()
                .from(users)
                .where(eq(users.id, e.studentId))
                .limit(1);
              const quiz = await db
                .select()
                .from(quizzes)
                .where(eq(quizzes.id, e.quizId))
                .limit(1);
              let courseName = "Course";
              if (quiz[0]?.moduleId) {
                const [mod] = await db
                  .select()
                  .from(courseModules)
                  .where(eq(courseModules.id, quiz[0].moduleId))
                  .limit(1);
                if (mod?.courseId) {
                  const [c] = await db
                    .select()
                    .from(courses)
                    .where(eq(courses.id, mod.courseId))
                    .limit(1);
                  courseName = c?.name || courseName;
                }
              }
              return {
                id: e.id,
                studentName:
                  student &&
                  (`${student.firstName || ""} ${student.lastName || ""}`.trim() ||
                    student.email),
                courseName,
                wordCount: e.wordCount,
                submittedAt: e.submittedAt,
              };
            }),
          ),
        });
      } catch (e) {
        console.error("Instructor dashboard stats:", e);
        res.status(500).json({ message: "Failed to load dashboard stats" });
      }
    },
  );

  // List students with enrollments and grades (for instructor dashboard / student-management)
  router.get(
    "/api/instructor/students",
    requireAuth,
    requireInstructor,
    async (req: any, res: Response) => {
      try {
        const user = req.user;
        const instructorId = user?.id;
        const dean = hasDeanAccess(user);

        const studentIds = await getAccessibleStudentIds(instructorId, user);

        if (studentIds.length === 0) {
          return res.json([]);
        }

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
            role: users.role,
            createdAt: users.createdAt,
          })
          .from(users)
          .where(inArray(users.id, studentIds))
          .orderBy(asc(users.lastName), asc(users.firstName));

        const instructorCourseIds = await getInstructorCourseIds(instructorId, user);
        
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
              status: e.status ?? "active",
            };
          });

          const myAttempts = attempts.filter((a) => a.studentId === s.id);
          let gpa: number | null = null;
          if (myAttempts.length > 0) {
            const scores = myAttempts
              .map((a) => (a.score != null ? parseFloat(String(a.score)) : null))
              .filter((x): x is number => x != null);
            if (scores.length) gpa = normalizeGpa(scores.reduce((a, b) => a + b, 0) / scores.length);
          }

          byStudent.set(s.id, { enrollments: enrolledCourses, gpa });
        }

        const result = students.map((s) => {
          const ext = byStudent.get(s.id);
          const enrolled = ext?.enrollments ?? [];
          return {
            ...s,
            enrolledCourses: enrolled,
            enrollmentCount: enrolled.length,
            activeEnrollments: enrolled.filter((c) => c.status === "active").length,
            completedEnrollments: enrolled.filter((c) => c.status === "completed").length,
            gpa: ext?.gpa ?? null,
            gpaPercent: ext?.gpa ?? null,
            sfgmChurch: (s as any).sfgmChurch || null,
            deanView: dean,
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
        const user = req.user;
        const dean = hasDeanAccess(user);

        // Get all essay submissions
        let list = await db
          .select()
          .from(essaySubmissions)
          .orderBy(desc(essaySubmissions.submittedAt));

        // Filter by instructor's courses (unless dean/admin)
        if (!dean && instructorId) {
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

        if (reviewerId && updated.studentId) {
          const subject =
            status === "approved"
              ? "Your essay was approved"
              : "Your essay needs revision";
          const body =
            feedback ||
            (status === "approved"
              ? "Your instructor approved your final exam essay. Great work!"
              : "Your instructor reviewed your essay and requested changes. Reach out if you have questions.");
          await db.insert(instructorMessages).values({
            instructorId: reviewerId,
            studentId: updated.studentId,
            channel: "portal",
            subject,
            body,
            emailDelivered: false,
          });
        }

        res.json(updated);
      } catch (e) {
        console.error("Instructor essay review:", e);
        res.status(500).json({ message: "Failed to review submission" });
      }
    }
  );

  // Get grades for a specific student (instructor view — scoped to accessible student + courses)
  router.get(
    "/api/instructor/students/:id/grades",
    requireAuth,
    requireInstructor,
    async (req: any, res: Response) => {
      try {
        const { id } = req.params;
        const instructorId = req.user?.id;
        const user = req.user;

        if (!(await assertStudentAccess(instructorId, user, id))) {
          return res.status(403).json({ message: "You do not have access to this student" });
        }

        const instructorCourseIds = await getInstructorCourseIds(instructorId, user);
        let quizIds: number[] = [];
        if (instructorCourseIds.length > 0) {
          const modules = await db
            .select({ id: courseModules.id })
            .from(courseModules)
            .where(inArray(courseModules.courseId, instructorCourseIds));
          const moduleIds = modules.map((m) => m.id);
          if (moduleIds.length > 0) {
            const courseQuizzes = await db
              .select({ id: quizzes.id })
              .from(quizzes)
              .where(inArray(quizzes.moduleId, moduleIds));
            quizIds = courseQuizzes.map((q) => q.id);
          }
        }

        const attempts =
          quizIds.length > 0
            ? await db
                .select()
                .from(quizAttempts)
                .where(
                  and(eq(quizAttempts.studentId, id), inArray(quizAttempts.quizId, quizIds)),
                )
                .orderBy(desc(quizAttempts.completedAt))
            : [];

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
    },
  );

  // Week-by-week content progress for a student (instructor's courses only)
  router.get(
    "/api/instructor/students/:id/progress",
    requireAuth,
    requireInstructor,
    async (req: any, res: Response) => {
      try {
        const { id } = req.params;
        const instructorId = req.user?.id;
        const user = req.user;

        if (!(await assertStudentAccess(instructorId, user, id))) {
          return res.status(403).json({ message: "You do not have access to this student" });
        }

        const instructorCourseIds = await getInstructorCourseIds(instructorId, user);
        const enrollmentList =
          instructorCourseIds.length > 0
            ? await db
                .select()
                .from(enrollments)
                .where(
                  and(
                    eq(enrollments.studentId, id),
                    inArray(enrollments.courseId, instructorCourseIds),
                  ),
                )
            : [];

        const courseIds = [...new Set(enrollmentList.map((e) => e.courseId).filter(Boolean))] as number[];
        const courseList =
          courseIds.length > 0
            ? await db.select().from(courses).where(inArray(courses.id, courseIds))
            : [];

        const progressByCourse = await Promise.all(
          courseIds.map(async (courseId) => {
            const progress = await storage.getContentProgress(id, courseId);
            const course = courseList.find((c) => c.id === courseId);
            const enrollment = enrollmentList.find((e) => e.courseId === courseId);
            const completed = progress.filter((p) => p.completed).length;
            return {
              courseId,
              courseName: course?.name || "Course",
              enrollmentStatus: enrollment?.status || "active",
              totalItems: progress.length,
              completedItems: completed,
              percentComplete:
                progress.length > 0 ? Math.round((completed / progress.length) * 100) : 0,
              items: progress.map((p) => ({
                contentType: p.contentType,
                contentId: p.contentId,
                completed: p.completed,
                completedAt: p.completedAt,
              })),
            };
          }),
        );

        const recentAttempts =
          courseIds.length > 0
            ? await db
                .select()
                .from(quizAttempts)
                .where(eq(quizAttempts.studentId, id))
                .orderBy(desc(quizAttempts.completedAt))
                .limit(10)
            : [];

        res.json({
          courses: progressByCourse,
          recentActivity: recentAttempts.map((a) => ({
            type: "quiz",
            quizId: a.quizId,
            score: a.score,
            completedAt: a.completedAt,
          })),
        });
      } catch (e) {
        console.error("Instructor student progress:", e);
        res.status(500).json({ message: "Failed to fetch progress" });
      }
    },
  );

  // List messages sent by this instructor
  router.get(
    "/api/instructor/messages",
    requireAuth,
    requireInstructor,
    async (req: any, res: Response) => {
      try {
        const instructorId = req.user?.id;
        const user = req.user;
        const dean = hasDeanAccess(user);

        const rows = dean
          ? await db
              .select()
              .from(instructorMessages)
              .orderBy(desc(instructorMessages.sentAt))
              .limit(100)
          : instructorId
            ? await db
                .select()
                .from(instructorMessages)
                .where(eq(instructorMessages.instructorId, instructorId))
                .orderBy(desc(instructorMessages.sentAt))
                .limit(100)
            : [];

        const studentIds = [...new Set(rows.map((m) => m.studentId))];
        const studentList =
          studentIds.length > 0
            ? await db
                .select({
                  id: users.id,
                  firstName: users.firstName,
                  lastName: users.lastName,
                  email: users.email,
                })
                .from(users)
                .where(inArray(users.id, studentIds))
            : [];

        const out = rows.map((m) => {
          const student = studentList.find((s) => s.id === m.studentId);
          return {
            id: m.id,
            studentId: m.studentId,
            studentName: student
              ? `${student.firstName || ""} ${student.lastName || ""}`.trim() || student.email
              : "Unknown",
            channel: m.channel,
            subject: m.subject,
            body: m.body,
            sentAt: m.sentAt,
            emailDelivered: m.emailDelivered,
            smsDelivered: m.smsDelivered,
          };
        });

        res.json(out);
      } catch (e) {
        console.error("Instructor messages:", e);
        res.status(500).json({ message: "Failed to fetch messages" });
      }
    },
  );

  // Send a message to a student (portal record + optional email)
  router.post(
    "/api/instructor/messages/send",
    requireAuth,
    requireInstructor,
    validateBody(messageSendSchema),
    async (req: any, res: Response) => {
      try {
        const instructorId = req.user?.id;
        const user = req.user;
        const { studentId, channel, subject, body } = req.validatedBody;

        const accessibleIds = await getAccessibleStudentIds(instructorId, user);
        if (!accessibleIds.includes(studentId)) {
          return res.status(403).json({ message: "You do not have access to this student" });
        }

        const [student] = await db
          .select({
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
          })
          .from(users)
          .where(eq(users.id, studentId))
          .limit(1);

        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }

        let emailDelivered = false;
        let smsDelivered = false;

        if (channel === "email" && student.email) {
          const result = await sendInstructorMessageEmail({
            toEmail: student.email,
            studentName:
              `${student.firstName || ""} ${student.lastName || ""}`.trim() || student.email,
            subject: subject || "Message from your SFGM instructor",
            body,
          });
          emailDelivered = result.delivered;
        }

        if (channel === "sms") {
          const [studentPhone] = await db
            .select({ phone: users.phone })
            .from(users)
            .where(eq(users.id, studentId))
            .limit(1);

          if (!studentPhone?.phone) {
            return res.status(400).json({ message: "Student does not have a phone number on file" });
          }

          const smsBody = subject ? `${subject}\n\n${body}` : body;
          const smsResult = await sendStudentSms({
            toPhone: studentPhone.phone,
            body: smsBody,
          });

          if (!smsResult.delivered) {
            return res.status(502).json({
              message: smsResult.reason || "SMS delivery failed",
            });
          }
          smsDelivered = true;
        }

        const [message] = await db
          .insert(instructorMessages)
          .values({
            instructorId: instructorId!,
            studentId,
            channel,
            subject: subject ?? null,
            body,
            emailDelivered,
            smsDelivered,
          })
          .returning();

        res.json(message);
      } catch (e) {
        console.error("Instructor send message:", e);
        res.status(500).json({ message: "Failed to send message" });
      }
    },
  );

  // Certificates issued for instructor's courses
  router.get(
    "/api/instructor/certificates",
    requireAuth,
    requireInstructor,
    async (req: any, res: Response) => {
      try {
        const instructorId = req.user?.id;
        const user = req.user;
        const courseIds = await getInstructorCourseIds(instructorId, user);
        if (courseIds.length === 0) return res.json([]);

        const rows = await db
          .select()
          .from(certificates)
          .where(inArray(certificates.courseId, courseIds))
          .orderBy(desc(certificates.issueDate))
          .limit(100);

        res.json(rows);
      } catch (e) {
        console.error("Instructor certificates:", e);
        res.status(500).json({ message: "Failed to fetch certificates" });
      }
    },
  );

  // Students eligible for certificate issuance
  router.get(
    "/api/instructor/certificates/eligible",
    requireAuth,
    requireInstructor,
    async (req: any, res: Response) => {
      try {
        const instructorId = req.user?.id;
        const user = req.user;
        const courseIds = await getInstructorCourseIds(instructorId, user);
        if (courseIds.length === 0) return res.json([]);

        const enrollmentRows = await db
          .select()
          .from(enrollments)
          .where(inArray(enrollments.courseId, courseIds));

        const studentIds = [...new Set(enrollmentRows.map((e) => e.studentId).filter(Boolean))] as string[];
        const studentList =
          studentIds.length > 0
            ? await db.select().from(users).where(inArray(users.id, studentIds))
            : [];
        const courseList = await db.select().from(courses).where(inArray(courses.id, courseIds));
        const existingCerts = await db
          .select()
          .from(certificates)
          .where(inArray(certificates.courseId, courseIds));

        const out = enrollmentRows.map((enrollment) => {
          const student = studentList.find((s) => s.id === enrollment.studentId);
          const course = courseList.find((c) => c.id === enrollment.courseId);
          const cert = existingCerts.find(
            (c) => c.userId === enrollment.studentId && c.courseId === enrollment.courseId,
          );
          const studentName = student
            ? `${student.firstName || ""} ${student.lastName || ""}`.trim() || student.username || student.email
            : "Unknown";
          const readyForCert =
            enrollment.status === "completed" && !cert;
          return {
            studentId: enrollment.studentId,
            studentName,
            courseId: enrollment.courseId,
            courseName: (course as any)?.name || "Unknown",
            enrollmentStatus: enrollment.status,
            hasCertificate: !!cert,
            certificateNumber: cert?.certificateNumber ?? null,
            sfgmChurch: (student as any)?.sfgmChurch ?? null,
            readyForCert,
          };
        });

        res.json(out);
      } catch (e) {
        console.error("Instructor eligible certificates:", e);
        res.status(500).json({ message: "Failed to fetch eligible students" });
      }
    },
  );

  // Issue a certificate of completion
  router.post(
    "/api/instructor/certificates/issue",
    requireAuth,
    requireInstructor,
    validateBody(issueCertificateSchema),
    async (req: any, res: Response) => {
      try {
        const instructorId = req.user?.id;
        const user = req.user;
        const { studentId, courseId, finalGrade, completionDate } = req.validatedBody;

        const accessibleIds = await getAccessibleStudentIds(instructorId, user);
        if (!accessibleIds.includes(studentId)) {
          return res.status(403).json({ message: "You do not have access to this student" });
        }

        const courseIds = await getInstructorCourseIds(instructorId, user);
        if (!courseIds.includes(courseId)) {
          return res.status(403).json({ message: "You cannot issue certificates for this course" });
        }

        const [existing] = await db
          .select()
          .from(certificates)
          .where(and(eq(certificates.userId, studentId), eq(certificates.courseId, courseId)))
          .limit(1);
        if (existing) {
          return res.status(409).json({
            message: "Certificate already issued for this student and course",
            certificate: existing,
          });
        }

        const [student] = await db.select().from(users).where(eq(users.id, studentId)).limit(1);
        const [course] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
        if (!student || !course) {
          return res.status(404).json({ message: "Student or course not found" });
        }

        const [instructor] = instructorId
          ? await db.select().from(users).where(eq(users.id, instructorId)).limit(1)
          : [];
        const instructorName =
          instructor
            ? `${instructor.firstName || ""} ${instructor.lastName || ""}`.trim() ||
              instructor.username ||
              "SFGM Instructor"
            : "SFGM Instructor";

        const studentName =
          `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
          student.username ||
          "Student";
        const completed = completionDate ? new Date(completionDate) : new Date();
        const certNumber = buildCertificateNumber(studentId);

        const [issued] = await db
          .insert(certificates)
          .values({
            userId: studentId,
            courseId,
            certificateNumber: certNumber,
            studentName,
            courseTitle: course.name,
            completionDate: completed,
            finalGrade: finalGrade != null ? String(finalGrade) : null,
            instructorName,
            certificateType: "Course Completion",
          } as any)
          .returning();

        await db
          .update(enrollments)
          .set({ status: "completed", completedAt: completed } as any)
          .where(and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId)));

        const [existingCompletion] = await db
          .select()
          .from(courseCompletions)
          .where(
            and(eq(courseCompletions.userId, studentId), eq(courseCompletions.courseId, courseId)),
          )
          .limit(1);

        if (existingCompletion) {
          await db
            .update(courseCompletions)
            .set({
              certificateIssued: true,
              certificateNumber: certNumber,
              completedAt: completed,
              finalGrade: finalGrade != null ? String(finalGrade) : null,
            } as any)
            .where(
              and(eq(courseCompletions.userId, studentId), eq(courseCompletions.courseId, courseId)),
            );
        } else {
          await db.insert(courseCompletions).values({
            userId: studentId,
            courseId,
            completedAt: completed,
            finalGrade: finalGrade != null ? String(finalGrade) : null,
            certificateIssued: true,
            certificateNumber: certNumber,
          } as any);
        }

        if (instructorId) {
          await db.insert(instructorMessages).values({
            instructorId,
            studentId,
            channel: "portal",
            subject: `Certificate of completion — ${course.name}`,
            body: `Congratulations! Your instructor has issued your Certificate of Completion for ${course.name}. Certificate #${certNumber}. View it in My Certificates on your dashboard.`,
            emailDelivered: false,
          });
        }

        res.status(201).json(issued);
      } catch (e) {
        console.error("Issue certificate:", e);
        res.status(500).json({ message: "Failed to issue certificate" });
      }
    },
  );

  router.get(
    "/api/instructor/integrations/status",
    requireAuth,
    requireInstructor,
    async (_req: any, res: Response) => {
      res.json({
        sms: getSmsConfigStatus(),
        zoom: getZoomConfigStatus(),
        googleCalendar: getGoogleCalendarConfigStatus(),
      });
    },
  );

  router.get(
    "/api/instructor/calendar",
    requireAuth,
    requireInstructor,
    async (_req: any, res: Response) => {
      try {
        const embedUrl = getGoogleCalendarEmbedUrl();
        const events = await fetchPublicCalendarEvents(15);
        res.json({ embedUrl, events });
      } catch (e) {
        console.error("Instructor calendar:", e);
        res.status(500).json({ message: "Failed to load calendar" });
      }
    },
  );

  router.get(
    "/api/instructor/sessions",
    requireAuth,
    requireInstructor,
    async (req: any, res: Response) => {
      try {
        const instructorId = req.user?.id;
        const dean = hasDeanAccess(req.user);
        const rows = dean
          ? await db.select().from(instructorSessions).orderBy(desc(instructorSessions.scheduledAt))
          : instructorId
            ? await db
                .select()
                .from(instructorSessions)
                .where(eq(instructorSessions.instructorId, instructorId))
                .orderBy(desc(instructorSessions.scheduledAt))
            : [];
        res.json(rows);
      } catch (e) {
        console.error("Instructor sessions:", e);
        res.status(500).json({ message: "Failed to load sessions" });
      }
    },
  );

  router.post(
    "/api/instructor/sessions/zoom",
    requireAuth,
    requireInstructor,
    validateBody(zoomSessionSchema),
    async (req: any, res: Response) => {
      try {
        const instructorId = req.user?.id;
        const { title, description, courseId, scheduledAt, durationMinutes } = req.validatedBody;

        const meeting = await createZoomMeeting({
          topic: title,
          agenda: description,
          startTime: scheduledAt ? new Date(scheduledAt) : undefined,
          durationMinutes: durationMinutes ?? 60,
        });

        const [session] = await db
          .insert(instructorSessions)
          .values({
            instructorId: instructorId!,
            courseId: courseId ?? null,
            title,
            description: description ?? null,
            sessionType: "zoom",
            joinUrl: meeting.joinUrl,
            startUrl: meeting.startUrl,
            meetingId: meeting.id,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            durationMinutes: durationMinutes ?? 60,
          })
          .returning();

        res.status(201).json({ session, meeting });
      } catch (e) {
        console.error("Create Zoom session:", e);
        res.status(502).json({ message: (e as Error).message || "Failed to create Zoom meeting" });
      }
    },
  );

  router.get(
    "/api/instructor/applications",
    requireAuth,
    requireInstructor,
    requireDean,
    async (req: any, res: Response) => {
      try {
        const status = typeof req.query.status === "string" ? req.query.status : undefined;
        const applications = await storage.getInstructorApplications(status);
        res.json(applications);
      } catch (e) {
        console.error("Instructor applications:", e);
        res.status(500).json({ message: "Failed to load applications" });
      }
    },
  );

  router.patch(
    "/api/instructor/applications/:id/review",
    requireAuth,
    requireInstructor,
    requireDean,
    validateBody(reviewApplicationSchema),
    async (req: any, res: Response) => {
      try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
          return res.status(400).json({ message: "Invalid application id" });
        }

        const { status, adminNotes } = req.validatedBody;
        const updated = await storage.reviewInstructorApplication(
          id,
          status,
          adminNotes,
          req.user?.id,
        );

        if (status === "approved") {
          const application = await storage.getInstructorApplication(id);
          if (application?.applicantId) {
            await storage.promoteToInstructor(application.applicantId);
          }
        }

        res.json(updated);
      } catch (e) {
        console.error("Review instructor application:", e);
        res.status(500).json({ message: "Failed to review application" });
      }
    },
  );

  router.get(
    "/api/instructor/dean/export/students",
    requireAuth,
    requireInstructor,
    requireDean,
    async (req: any, res: Response) => {
      try {
        const instructorId = req.user?.id;
        const studentIds = await getAccessibleStudentIds(instructorId, req.user);
        if (studentIds.length === 0) {
          res.setHeader("Content-Type", "text/csv");
          return res.send("name,email,username,church,enrollments,gpa\n");
        }

        const students = await db
          .select()
          .from(users)
          .where(inArray(users.id, studentIds));

        const courseIds = await getInstructorCourseIds(instructorId, req.user);
        const enrollmentList =
          courseIds.length > 0
            ? await db
                .select()
                .from(enrollments)
                .where(inArray(enrollments.courseId, courseIds))
            : [];

        const lines = ["name,email,username,church,enrollments,gpa"];
        for (const student of students) {
          const name =
            `${student.firstName || ""} ${student.lastName || ""}`.trim() || student.username || "";
          const enrollCount = enrollmentList.filter((e) => e.studentId === student.id).length;
          const escaped = (value: string) => `"${value.replace(/"/g, '""')}"`;
          lines.push(
            [
              escaped(name),
              escaped(student.email || ""),
              escaped(student.username || ""),
              escaped(student.sfgmChurch || ""),
              String(enrollCount),
              "",
            ].join(","),
          );
        }

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", 'attachment; filename="sfgm-students.csv"');
        res.send(lines.join("\n"));
      } catch (e) {
        console.error("Dean export students:", e);
        res.status(500).json({ message: "Failed to export students" });
      }
    },
  );

  app.use(router);
}
