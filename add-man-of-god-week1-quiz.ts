import { db } from "./server/db";
import { quizzes, quizQuestions } from "./shared/schema";
import { eq, sql } from "drizzle-orm";

const QUIZ_ID = 221;
const SLUG = "man-of-god-week-1";

const ESSAY_QUESTION =
  "After completing the Week 1 video and reading the Course Introduction (Problems & Progress), write an essay sharing what stood out to you and how this material applies to your walk as a man of God.";

async function addManOfGodWeek1Quiz() {
  try {
    const existing = await db.select().from(quizzes).where(eq(quizzes.id, QUIZ_ID));
    if (existing.length > 0) {
      console.log(`Quiz ${QUIZ_ID} already exists — refreshing questions...`);
      await db.delete(quizQuestions).where(eq(quizQuestions.quizId, QUIZ_ID));
      await db
        .update(quizzes)
        .set({
          title: "SFGM Man of God - Week 1 Quiz",
          timeLimit: 30,
          passingScore: 100,
          isFinalExam: false,
          isPublished: true,
          publishedAt: new Date(),
        })
        .where(eq(quizzes.id, QUIZ_ID));
    } else {
      await db.insert(quizzes).values({
        id: QUIZ_ID,
        moduleId: null,
        title: "SFGM Man of God - Week 1 Quiz",
        timeLimit: 30,
        passingScore: 100,
        isFinalExam: false,
        isPublished: true,
        publishedAt: new Date(),
      });
      console.log("Quiz created:", QUIZ_ID);
    }

    await db.execute(
      sql`SELECT setval(pg_get_serial_sequence('quiz_questions', 'id'), COALESCE((SELECT MAX(id) FROM quiz_questions), 1))`,
    );

    await db.insert(quizQuestions).values({
      quizId: QUIZ_ID,
      question: ESSAY_QUESTION,
      type: "essay",
      options: null,
      correctAnswer: "essay",
      points: 1,
      orderIndex: 1,
    });

    console.log(`✅ Week 1 essay quiz ready (slug: ${SLUG}, id: ${QUIZ_ID})`);
  } catch (error: unknown) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    throw error;
  } finally {
    process.exit(0);
  }
}

addManOfGodWeek1Quiz();
