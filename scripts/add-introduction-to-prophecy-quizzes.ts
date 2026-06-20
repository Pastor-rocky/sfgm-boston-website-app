import { db } from "./server/db";
import { quizzes, quizQuestions } from "./shared/schema";
import { eq, sql } from "drizzle-orm";
import {
  INTRODUCTION_TO_PROPHECY_QUIZ_IDS,
  INTRODUCTION_TO_PROPHECY_QUIZ_TITLES,
} from "./shared/introduction-to-prophecy-quizzes";
import { INTRODUCTION_TO_PROPHECY_QUIZ_QUESTIONS } from "./shared/introduction-to-prophecy-quiz-questions";

async function upsertWeekQuiz(week: number) {
  const quizId = INTRODUCTION_TO_PROPHECY_QUIZ_IDS[week - 2];
  const title = INTRODUCTION_TO_PROPHECY_QUIZ_TITLES[week];
  const questions = INTRODUCTION_TO_PROPHECY_QUIZ_QUESTIONS[week];

  const existing = await db.select().from(quizzes).where(eq(quizzes.id, quizId));
  if (existing.length > 0) {
    console.log(`Quiz ${quizId} exists — refreshing questions...`);
    await db.delete(quizQuestions).where(eq(quizQuestions.quizId, quizId));
    await db
      .update(quizzes)
      .set({
        title,
        timeLimit: 15,
        passingScore: 70,
        isFinalExam: false,
        isPublished: true,
        publishedAt: new Date(),
      })
      .where(eq(quizzes.id, quizId));
  } else {
    await db.insert(quizzes).values({
      id: quizId,
      moduleId: null,
      title,
      timeLimit: 15,
      passingScore: 70,
      isFinalExam: false,
      isPublished: true,
      publishedAt: new Date(),
    });
    console.log(`Quiz created: ${quizId} — ${title}`);
  }

  await db.insert(quizQuestions).values(
    questions.map((q, index) => ({
      quizId,
      question: q.question,
      type: "multiple_choice" as const,
      options: q.options,
      correctAnswer: q.correctAnswer,
      points: 1,
      orderIndex: index + 1,
    })),
  );

  console.log(`  ✅ ${questions.length} questions loaded for week ${week}`);
}

async function addIntroductionToProphecyQuizzes() {
  try {
    await db.execute(
      sql`SELECT setval(pg_get_serial_sequence('quiz_questions', 'id'), COALESCE((SELECT MAX(id) FROM quiz_questions), 1))`,
    );

    for (let week = 2; week <= 10; week++) {
      await upsertWeekQuiz(week);
    }

    console.log("\n✅ All 9 Introduction to Prophecy lesson quizzes are ready (IDs 234–242).");
  } catch (error: unknown) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    throw error;
  } finally {
    process.exit(0);
  }
}

addIntroductionToProphecyQuizzes();
