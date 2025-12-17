import type { Express, Response } from "express";
import { Router } from "express";
import { z } from "zod";

import { db } from "../db";
import { essaySubmissions } from "../../shared/schema";
import { storage } from "../storage";
import { requireAuth } from "../middleware/requireAuth";
import { validateBody } from "../middleware/validate";

const essaySubmissionSchema = z.object({
  quizId: z.coerce.number().int().positive(),
  questionId: z.coerce.number().int().positive(),
  essayText: z.string().min(100, "Essay must be at least 100 words"),
  wordCount: z.coerce.number().int().min(100, "Essay must be at least 100 words"),
  email: z.string().email().optional(),
  studentId: z.string().min(1).optional(),
});

export function registerEssayRoutes(app: Express) {
  const router = Router();

  router.post("/api/essays/submit", requireAuth, validateBody(essaySubmissionSchema), async (req: any, res: Response) => {
    try {
      const { quizId, questionId, essayText, wordCount, email, studentId } = req.validatedBody;
      const finalStudentId = studentId || req.user!.id;

      const student = await storage.getStudentById(finalStudentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
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

      res.json({
        success: true,
        message: "Essay submitted successfully",
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


