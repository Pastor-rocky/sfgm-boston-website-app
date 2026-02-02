import type { Express, Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { quizService } from "../services/quizService";
import { quizMonitoring } from "../services/quizMonitoring";
import { requireAuth } from "../middleware/requireAuth";
import { validateBody } from "../middleware/validate";
import { sendErrorResponse } from "../utils/errorHandler";
import { apiRateLimit } from "../middleware/rateLimit";

const QUIZ_SLUG_MAP: Record<string, number> = {
  "acts-week-1": 13,
  "acts-week-2": 14,
  "acts-week-3": 15,
  "acts-week-4": 16,
  "acts-week-5": 17,
  "acts-week-6": 18,
  "acts-week-7": 19,
  "acts-week-8": 20,
  "acts-week-9": 21,
  "acts-week-10": 22,
  "acts-final-exam": 23,
  "dbaj-week-1": 26,
  "dbaj-week-2": 46,
  "dbaj-week-3": 37,
  "dbaj-week-4": 38,
  "dbaj-week-5": 39,
  "dbaj-week-6": 40,
  "dbaj-week-7": 41,
  "dbaj-week-8": 42,
  "dbaj-week-9": 43,
  "dbaj-week-10": 44,
  "dbaj-week-11": 45,
  "dbaj-final-exam": 47,
  "firestarter-week-1": 48,
  "firestarter-week-2": 49,
  "firestarter-week-3": 50,
  "firestarter-week-4": 51,
  "firestarter-week-5": 52,
  "firestarter-week-6": 53,
  "firestarter-week-7": 54,
  "firestarter-week-8": 55,
  "firestarter-week-9": 56,
  "firestarter-week-10": 57,
  "firestarter-final-exam": 58,
  "studying-for-service-week-1": 59,
  "studying-for-service-week-2": 60,
  "studying-for-service-week-3": 61,
  "studying-for-service-week-4": 62,
  "studying-for-service-week-5": 63,
  "studying-for-service-week-6": 64,
  "studying-for-service-week-7": 65,
  "studying-for-service-week-8": 66,
  "studying-for-service-week-9": 67,
  "studying-for-service-week-10": 68,
  "studying-for-service-week-11": 69,
  "studying-for-service-final-exam": 70,
  "grow-week-1": 71,
  "grow-week-2": 72,
  "grow-week-3": 73,
  "grow-week-4": 74,
  "grow-final-exam": 75,
  "deacon-course-week-1": 76,
  "deacon-course-week-2": 77,
  "deacon-course-week-3": 78,
  "deacon-course-week-4": 79,
  "deacon-course-week-5": 80,
  "deacon-course-final-exam": 82,
  "level-up-leadership-week-1": 200,
  "level-up-leadership-week-2": 201,
  "level-up-leadership-week-3": 202,
  "level-up-leadership-week-4": 203,
  "level-up-leadership-week-5": 204,
  "level-up-leadership-final-exam": 206,
  "youth-ministry-week-1": 207,
  "youth-ministry-week-2": 208,
  "youth-ministry-week-3": 209,
  "youth-ministry-week-4": 210,
  "youth-ministry-week-5": 211,
  "youth-ministry-final-exam": 212,
};

function resolveQuizId(param: string): number | null {
  const parsed = Number(param);
  if (!Number.isNaN(parsed)) {
    return parsed;
  }
  return QUIZ_SLUG_MAP[param] || null;
}

// Zod schemas for validation
const quizAttemptSchema = z.preprocess((data: any) => {
  // Convert null values to undefined or default values
  if (data && typeof data === 'object') {
    return {
      ...data,
      quizId: data.quizId === null ? undefined : data.quizId,
      timeSpent: data.timeSpent === null ? 0 : data.timeSpent,
    };
  }
  return data;
}, z.object({
  quizId: z.coerce.number().int().positive().optional(),
  answers: z.record(z.any()).default({}),
  timeSpent: z.coerce.number().int().min(0).default(0),
  completedAt: z.string().datetime().optional(),
  studentId: z.string().optional(), // Allow but ignore - extracted from auth token
}));
// Admin-only guard for debug/backup endpoints
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.ADMIN_PANEL_PASSWORD || (process.env.NODE_ENV === 'development' ? '123' : null);

function requireAdminPasswordForDebug(req: any, res: any, next: any) {
  if (process.env.NODE_ENV === 'production') {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    if (!ADMIN_PASSWORD) return res.status(503).json({ message: 'Admin panel is not configured' });
    const provided = req.headers['x-admin-password'];
    if (provided !== ADMIN_PASSWORD) return res.status(401).json({ message: 'Invalid admin password' });
  }
  next();
}


export function registerQuizRoutes(app: Express) {
  const router = Router();

  router.get("/api/quizzes/:quizId", apiRateLimit, async (req: Request, res: Response) => {
    try {
      const quizId = resolveQuizId(req.params.quizId);
      if (!quizId) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      sendErrorResponse(res, error, "Fetch Quiz");
    }
  });

  router.post(
    "/api/quizzes/:quizId/attempt",
    requireAuth,
    validateBody(quizAttemptSchema),
    async (req: Request, res: Response) => {
      try {
        const quizId = resolveQuizId(req.params.quizId);
        if (!quizId) {
          return res.status(404).json({ message: "Quiz not found" });
        }

        const { answers, timeSpent, completedAt } = req.validatedBody;
        const result = await quizService.submitAttempt({
          quizId,
          studentId: (req as any).user!.id,
          answers,
          timeSpent,
          completedAt,
        });

        res.json(result);
      } catch (error) {
        sendErrorResponse(res, error, "Submit Quiz Attempt");
      }
    }
  );

  router.post("/api/quiz-attempts", requireAuth, validateBody(quizAttemptSchema), async (req: Request, res: Response) => {
    try {
      const { quizId: requestedQuizId, answers, completedAt, timeSpent } = req.validatedBody;
      const quizId = requestedQuizId || 13;
      const result = await quizService.submitAttempt({
        studentId: (req as any).user!.id,
        quizId,
        answers: answers || {},
        completedAt: completedAt || new Date().toISOString(),
        timeSpent: timeSpent ?? 0, // Handle null by defaulting to 0
      });

      res.json(result);
    } catch (error) {
      sendErrorResponse(res, error, "Submit Quiz Attempt");
    }
  });

  router.get("/api/quiz-attempts/course/:courseId", requireAuth, async (req: Request, res: Response) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const studentId = (req as any).user!.id;

      const attempts = await storage.getQuizAttemptsByCourse(studentId, courseId);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
      res.status(500).json({ message: "Failed to fetch quiz attempts" });
    }
  });

  router.get("/api/quiz-attempts/student", requireAuth, async (req: Request, res: Response) => {
    try {
      const studentId = (req as any).user!.id;
      const attempts = await storage.getAllQuizAttempts(studentId);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
      res.status(500).json({ message: "Failed to fetch quiz attempts" });
    }
  });

  router.get("/api/quiz-attempts/:quizId/review", requireAuth, async (req: Request, res: Response) => {
    try {
      const quizId = resolveQuizId(req.params.quizId);
      if (!quizId) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      const studentId = (req as any).user!.id;

      const attempts = await storage.getQuizAttempts(studentId, quizId);
      const attempt = attempts.length > 0 ? attempts[0] : null;

      if (!attempt) {
        return res.status(404).json({ message: "No quiz attempt found" });
      }

      // Get the quiz with questions
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      // Map user answers to questions
      const userAnswers = attempt.answers || {};
      const questionsWithUserAnswers = quiz.questions.map((question: any) => ({
        ...question,
        userAnswer: userAnswers[question.id] || userAnswers[String(question.id)] || ''
      }));

      // Return the attempt with quiz and questions that include user answers
      res.json({
        attempt: {
          id: attempt.id,
          quizId: attempt.quizId,
          studentId: attempt.studentId,
          score: attempt.score,
          answers: attempt.answers,
          completedAt: attempt.completedAt,
          submittedAt: attempt.submittedAt,
          timeSpent: attempt.timeSpent,
        },
        quiz: {
          ...quiz,
          questions: questionsWithUserAnswers
        },
        questions: questionsWithUserAnswers
      });
    } catch (error) {
      console.error("Error fetching quiz attempt for review:", error);
      res.status(500).json({ message: "Failed to fetch quiz attempt" });
    }
  });

  router.get("/api/student/quizzes/all", requireAuth, async (req: Request, res: Response) => {
    try {
      const studentId = (req as any).user!.id;

      const quizzes = await storage.getAllQuizzes();
      const attempts = await storage.getAllQuizAttempts(studentId);

      const quizzesWithStatus = quizzes.map((quiz) => {
        const quizAttempts = attempts.filter((attempt) => attempt.quizId === quiz.id);
        let bestScore = 0;
        let hasCompleted = false;

        if (quizAttempts.length > 0) {
          bestScore = Math.max(...quizAttempts.map((a) => parseFloat(a.score || "0")));
          hasCompleted = quizAttempts.some((a) => a.completedAt !== null);
        }

        return {
          ...quiz,
          completed: hasCompleted,
          bestScore,
          attempts: quizAttempts.length,
        };
      });

      res.json(quizzesWithStatus);
    } catch (error) {
      console.error("Error fetching all quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  // Quiz monitoring endpoint (for debugging/admin)
  router.get("/api/quizzes/monitoring/stats", requireAuth, requireAdminPasswordForDebug, async (req: Request, res: Response) => {
    try {
      const recentFailures = quizMonitoring.getRecentFailures(20);
      const failureCountLastHour = quizMonitoring.getFailureCountInLastMinutes(60);
      const failureCountLastDay = quizMonitoring.getFailureCountInLastMinutes(24 * 60);

      res.json({
        recentFailures: recentFailures.length,
        failureCountLastHour,
        failureCountLastDay,
        failures: recentFailures.map((f) => ({
          timestamp: f.timestamp.toISOString(),
          quizId: f.quizId,
          studentId: f.studentId,
          errorMessage: f.error instanceof Error ? f.error.message : String(f.error),
        })),
      });
    } catch (error) {
      console.error("Error fetching monitoring stats:", error);
      res.status(500).json({ message: "Failed to fetch monitoring stats" });
    }
  });

  // Quiz data export endpoint for backups
  router.get("/api/quizzes/export", requireAuth, requireAdminPasswordForDebug, async (req: Request, res: Response) => {
    try {
      const { format = "json", startDate, endDate } = req.query;

      // Get all quiz attempts with related data
      const attempts = await storage.getAllQuizAttemptsForAdmin();

      // Filter by date range if provided
      let filteredAttempts = attempts;
      if (startDate || endDate) {
        const start = startDate ? new Date(startDate as string) : new Date(0);
        const end = endDate ? new Date(endDate as string) : new Date();
        filteredAttempts = attempts.filter((attempt: any) => {
          const submittedAt = attempt.submittedAt ? new Date(attempt.submittedAt) : null;
          return submittedAt && submittedAt >= start && submittedAt <= end;
        });
      }

      if (format === "csv") {
        // Generate CSV
        const headers = [
          "Attempt ID",
          "Student ID",
          "Student Name",
          "Student Email",
          "Quiz ID",
          "Quiz Title",
          "Score",
          "Submitted At",
          "Completed At",
          "Time Spent (minutes)",
          "Is Final Exam",
          "Course Name",
        ];

        const csvRows = [
          headers.join(","),
          ...filteredAttempts.map((attempt: any) => {
            return [
              attempt.attemptId || attempt.id || "",
              attempt.studentId || "",
              `"${(attempt.studentName || "").replace(/"/g, '""')}"`,
              attempt.studentEmail || "",
              attempt.quizId || "",
              `"${(attempt.quizTitle || "").replace(/"/g, '""')}"`,
              attempt.score || "0",
              attempt.submittedAt || "",
              attempt.completedAt || "",
              attempt.timeSpent || "0",
              attempt.isFinalExam ? "Yes" : "No",
              `"${(attempt.courseName || "").replace(/"/g, '""')}"`,
            ].join(",");
          }),
        ];

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="quiz-attempts-${new Date().toISOString().split("T")[0]}.csv"`
        );
        res.send(csvRows.join("\n"));
      } else {
        // Default to JSON
        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="quiz-attempts-${new Date().toISOString().split("T")[0]}.json"`
        );
        res.json({
          exportedAt: new Date().toISOString(),
          totalAttempts: filteredAttempts.length,
          dateRange: {
            start: startDate || null,
            end: endDate || null,
          },
          attempts: filteredAttempts,
        });
      }
    } catch (error) {
      console.error("Error exporting quiz attempts:", error);
      res.status(500).json({ message: "Failed to export quiz attempts" });
    }
  });

  app.use(router);
}

