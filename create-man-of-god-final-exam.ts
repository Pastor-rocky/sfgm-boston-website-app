import { db } from "./server/db";
import { quizzes, quizQuestions } from "./shared/schema";
import { eq, asc, inArray, sql } from "drizzle-orm";

const FINAL_EXAM_ID = 231;
const WEEKLY_QUIZ_IDS = [222, 223, 224, 225, 226, 227, 228, 229, 230]; // Weeks 2–10 (Week 1 is essay-only)
const MC_TARGET = 50;

const FINAL_ESSAY_QUESTION =
  "After completing the SFGM Man of God course, write a comprehensive essay reflecting on what it means to be a man of God. Discuss key themes from the course — maturity, leadership, humility, faithfulness, stewardship of God's glory, relationships, finances, spiritual gifts, and following Christ as the true man. Explain how these truths apply to your life and ministry. Write at least 200 words.";

async function createManOfGodFinalExam() {
  try {
    console.log("📚 Creating SFGM Man of God Final Exam (50 MC + 1 essay)\n");

    const allMcQuestions: Array<{
      quizId: number;
      question: string;
      type: string;
      options: unknown;
      correctAnswer: string;
      points: number;
      orderIndex: number;
    }> = [];

    for (const quizId of WEEKLY_QUIZ_IDS) {
      const questions = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, quizId))
        .orderBy(asc(quizQuestions.orderIndex));

      questions
        .filter((q) => q.type === "multiple_choice" && q.correctAnswer)
        .forEach((q) => {
          allMcQuestions.push({
            quizId,
            question: q.question,
            type: q.type,
            options: q.options,
            correctAnswer: q.correctAnswer!,
            points: q.points || 1,
            orderIndex: q.orderIndex,
          });
        });
    }

    console.log(`Found ${allMcQuestions.length} multiple-choice questions from weeks 2–10\n`);

    if (allMcQuestions.length < MC_TARGET) {
      throw new Error(`Need at least ${MC_TARGET} MC questions, only found ${allMcQuestions.length}`);
    }

    // Select ~5–6 per week, then fill to exactly 50
    const selected: typeof allMcQuestions = [];
    const perWeek = Math.floor(MC_TARGET / WEEKLY_QUIZ_IDS.length); // 5

    for (const quizId of WEEKLY_QUIZ_IDS) {
      const weekQs = allMcQuestions.filter((q) => q.quizId === quizId);
      selected.push(...weekQs.slice(0, perWeek));
    }

    if (selected.length < MC_TARGET) {
      const remaining = allMcQuestions.filter(
        (q) => !selected.some((s) => s.quizId === q.quizId && s.orderIndex === q.orderIndex),
      );
      selected.push(...remaining.slice(0, MC_TARGET - selected.length));
    }

    const finalMc = selected.slice(0, MC_TARGET);
    console.log(`Selected ${finalMc.length} questions for final exam\n`);

    const existing = await db.select().from(quizzes).where(eq(quizzes.id, FINAL_EXAM_ID));
    if (existing.length > 0) {
      console.log(`Quiz ${FINAL_EXAM_ID} exists — refreshing...`);
      await db.delete(quizQuestions).where(eq(quizQuestions.quizId, FINAL_EXAM_ID));
      await db
        .update(quizzes)
        .set({
          title: "SFGM Man of God - Final Exam",
          timeLimit: 60,
          passingScore: 70,
          isFinalExam: true,
          isPublished: true,
          publishedAt: new Date(),
        })
        .where(eq(quizzes.id, FINAL_EXAM_ID));
    } else {
      await db.insert(quizzes).values({
        id: FINAL_EXAM_ID,
        moduleId: null,
        title: "SFGM Man of God - Final Exam",
        timeLimit: 60,
        passingScore: 70,
        isFinalExam: true,
        isPublished: true,
        publishedAt: new Date(),
      });
      console.log("Quiz created:", FINAL_EXAM_ID);
    }

    await db.execute(
      sql`SELECT setval(pg_get_serial_sequence('quiz_questions', 'id'), COALESCE((SELECT MAX(id) FROM quiz_questions), 1))`,
    );

    const insertRows = finalMc.map((q, i) => ({
      quizId: FINAL_EXAM_ID,
      question: q.question,
      type: "multiple_choice" as const,
      options: q.options,
      correctAnswer: q.correctAnswer,
      points: q.points,
      orderIndex: i + 1,
    }));

    insertRows.push({
      quizId: FINAL_EXAM_ID,
      question: FINAL_ESSAY_QUESTION,
      type: "essay" as const,
      options: null,
      correctAnswer: "essay",
      points: 1,
      orderIndex: MC_TARGET + 1,
    });

    await db.insert(quizQuestions).values(insertRows);

    const weekCounts: Record<number, number> = {};
    finalMc.forEach((q) => {
      const week = WEEKLY_QUIZ_IDS.indexOf(q.quizId) + 2;
      weekCounts[week] = (weekCounts[week] || 0) + 1;
    });

    console.log("Questions per week:");
    Object.keys(weekCounts)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((week) => console.log(`  Week ${week}: ${weekCounts[Number(week)]}`));

    console.log(`\n✅ Final exam ready: ${MC_TARGET} MC + 1 essay (id: ${FINAL_EXAM_ID})`);
    console.log("   Slug: man-of-god-final-exam");
    console.log("   URL: http://localhost:56000/quiz/man-of-god-final-exam");
  } catch (error: unknown) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    throw error;
  } finally {
    process.exit(0);
  }
}

createManOfGodFinalExam();
