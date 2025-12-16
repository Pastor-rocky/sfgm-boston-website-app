import { db } from "../db";
import * as schema from "../../shared/schema";
import { quizAttempts, quizQuestions } from "../../shared/schema";
import { eq, and, desc } from "drizzle-orm";
import type { InsertQuizAttempt, QuizAttempt, QuizQuestion } from "../../shared/schema";
import { quizMonitoring } from "./quizMonitoring";

/**
 * Quiz Service - Handles quiz submission business logic
 * Extracted from storage.ts to separate concerns and enable better monitoring
 */
export class QuizService {
  /**
   * Calculate quiz score based on provided answers
   */
  private calculateScore(questions: QuizQuestion[], providedAnswers: Record<string, any>): number {
    let correctAnswers = 0;
    let totalQuestions = 0;

    for (const question of questions) {
      if (question.type === "multiple_choice" && question.correctAnswer) {
        totalQuestions++;
        const userAnswer = providedAnswers[question.id];
        if (userAnswer === question.correctAnswer) {
          correctAnswers++;
        }
      }
    }

    return totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
  }

  /**
   * Submit a quiz attempt with transaction safety and retry logic
   * Returns the created attempt or throws on error
   */
  async submitAttempt(attempt: InsertQuizAttempt, retries: number = 2): Promise<QuizAttempt> {
    const actualQuizId = attempt.quizId || 13;
    const providedAnswers = attempt.answers || {};
    let lastError: Error | unknown = null;

    for (let attemptNumber = 0; attemptNumber <= retries; attemptNumber++) {
      try {
        if (attemptNumber > 0) {
          console.log(`QuizService: Retry attempt ${attemptNumber}/${retries}`, {
            quizId: actualQuizId,
            studentId: attempt.studentId,
          });
          // Exponential backoff: wait 100ms * 2^attemptNumber
          await new Promise((resolve) => setTimeout(resolve, 100 * Math.pow(2, attemptNumber)));
        }

        console.log("QuizService: Submitting quiz attempt", {
          quizId: actualQuizId,
          studentId: attempt.studentId,
          hasAnswers: !!attempt.answers,
          attemptNumber: attemptNumber + 1,
        });

        // Fetch questions for scoring
        const questions = await db
          .select()
          .from(quizQuestions)
          .where(eq(quizQuestions.quizId, actualQuizId))
          .orderBy(quizQuestions.orderIndex);

        if (questions.length === 0) {
          throw new Error(`No questions found for quiz ID ${actualQuizId}`);
        }

        // Calculate score
        const score = this.calculateScore(questions, providedAnswers);

        // Submit within transaction for atomicity
        const result = await db.transaction(async (tx) => {
          const [newAttempt] = await tx
            .insert(quizAttempts)
            .values({
              studentId: attempt.studentId || "test-user",
              quizId: actualQuizId,
              answers: providedAnswers,
              score,
              startedAt: new Date(),
              completedAt: attempt.completedAt ? new Date(attempt.completedAt) : new Date(),
              submittedAt: new Date(),
              timeSpent: attempt.timeSpent || 0,
              essay: null,
              essayGraded: false,
              instructorFeedback: null,
              finalGrade: null,
              certificateApproved: false,
              updatedAt: new Date(),
            })
            .returning();

          console.log("QuizService: Quiz attempt submitted successfully", {
            attemptId: newAttempt.id,
            quizId: actualQuizId,
            score,
            retriesUsed: attemptNumber,
          });

          return newAttempt as QuizAttempt;
        });

        return result;
      } catch (error) {
        lastError = error;
        console.error(`QuizService: Error on attempt ${attemptNumber + 1}/${retries + 1}`, error);

        // If this was the last retry, record the failure
        if (attemptNumber === retries) {
          quizMonitoring.recordFailure({
            timestamp: new Date(),
            quizId: actualQuizId,
            studentId: attempt.studentId || "unknown",
            error,
            attemptData: {
              answers: providedAnswers,
              timeSpent: attempt.timeSpent,
            },
          });
        }

        // Don't retry on validation errors (e.g., missing quiz)
        if (error instanceof Error && error.message.includes("No questions found")) {
          throw error;
        }
      }
    }

    // If we get here, all retries failed
    throw lastError || new Error("Failed to submit quiz attempt after retries");
  }
}

export const quizService = new QuizService();

