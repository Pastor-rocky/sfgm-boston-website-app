import type { Express, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

import { db } from "../db";
import { essaySubmissions, courses, enrollments, users } from "../../shared/schema";
import { storage } from "../storage";
import { requireAuth } from "../middleware/requireAuth";
import { validateBody } from "../middleware/validate";
import { sendEssayPortalNotification } from "../services/emailService";

const essaySubmissionSchema = z.object({
  quizId: z.coerce.number().int().positive(),
  questionId: z.coerce.number().int().positive(),
  essayText: z.string().min(100, "Essay must be at least 100 words"),
  wordCount: z.coerce.number().int().min(100, "Essay must be at least 100 words"),
  email: z.string().email().optional(),
  studentId: z.string().min(1).optional(),
});

function portalBaseUrl(): string {
  return (process.env.APP_URL || process.env.PUBLIC_APP_URL || "https://sfgmboston.com").replace(
    /\/$/,
    "",
  );
}

async function resolveInstructorForEssay(
  studentId: string,
  courseId: number | null | undefined,
): Promise<{ email: string | null; name: string | null }> {
  if (!courseId) return { email: null, name: null };

  const [enrollment] = await db
    .select({ chosenInstructorId: enrollments.chosenInstructorId })
    .from(enrollments)
    .where(and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId)))
    .limit(1);

  const [course] = await db
    .select({ instructorId: courses.instructorId })
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);

  const instructorUserId = enrollment?.chosenInstructorId || course?.instructorId;
  if (!instructorUserId) return { email: null, name: null };

  const [instructor] = await db
    .select({
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(users)
    .where(eq(users.id, instructorUserId))
    .limit(1);

  if (!instructor?.email) return { email: null, name: null };

  const name =
    `${instructor.firstName || ""} ${instructor.lastName || ""}`.trim() || null;
  return { email: instructor.email, name };
}

export function registerEssayRoutes(app: Express) {
  const router = Router();

  router.post("/api/essays/submit", requireAuth, validateBody(essaySubmissionSchema), async (req: any, res: Response) => {
    try {
      const { quizId, questionId, essayText, wordCount, studentId } = req.validatedBody;
      const finalStudentId = studentId || req.user!.id;

      const student = await storage.getStudentById(finalStudentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      const courseId = (quiz as { courseId?: number }).courseId;
      let courseTitle = (quiz as { title?: string }).title || "Unknown Course";
      if (courseId) {
        const course = await storage.getCourse(courseId);
        if (course?.name) courseTitle = course.name;
      }

      const [essaySubmission] = await db
        .insert(essaySubmissions)
        .values({
          quizId,
          questionId,
          studentId: finalStudentId,
          essayText,
          wordCount,
          submittedAt: new Date(),
          status: "submitted",
        })
        .returning();

      const studentName =
        `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
        student.username ||
        "Unknown Student";

      const instructor = await resolveInstructorForEssay(finalStudentId, courseId);
      const notifyEmail = instructor.email || process.env.ESSAY_REVIEW_EMAIL || null;

      if (notifyEmail) {
        void sendEssayPortalNotification({
          toEmail: notifyEmail,
          instructorName: instructor.name || undefined,
          studentName,
          courseTitle,
          wordCount,
          essayId: essaySubmission.id,
          portalUrl: `${portalBaseUrl()}/instructor-portal/essays`,
        }).catch((err) => console.error("[email] Essay portal notification failed:", err));
      }

      res.json({
        success: true,
        message:
          "Essay submitted successfully. Your instructor will review it in the Instructor Portal.",
        essayId: essaySubmission.id,
        courseCompleted: true,
        certificateNumber: `CERT-${Date.now()}-${finalStudentId.slice(-4)}`,
      });
    } catch (error) {
      console.error("Error submitting essay:", error);
      res.status(500).json({ message: "Failed to submit essay" });
    }
  });

  app.use(router);
}
