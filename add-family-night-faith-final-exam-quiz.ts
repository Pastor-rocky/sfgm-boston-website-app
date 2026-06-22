import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { eq, sql } from "drizzle-orm";

const QUIZ_ID = 244;
const SLUG = "family-night-faith-final-exam";

async function addFamilyNightFaithFinalExamQuiz() {
  dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".env") });

  const { db } = await import("./server/db");
  const { quizzes, quizQuestions } = await import("./shared/schema");

  try {
    const existing = await db.select().from(quizzes).where(eq(quizzes.id, QUIZ_ID));
    if (existing.length > 0) {
      console.log(`Quiz ${QUIZ_ID} already exists — refreshing questions...`);
      await db.delete(quizQuestions).where(eq(quizQuestions.quizId, QUIZ_ID));
    } else {
      const [quiz] = await db
        .insert(quizzes)
        .values({
          id: QUIZ_ID,
          moduleId: null,
          title: "Family Night — Faith Final Exam",
          timeLimit: 15,
          passingScore: 70,
          isFinalExam: true,
          isPublished: true,
          publishedAt: new Date(),
        })
        .returning();
      console.log("Quiz created:", quiz.id, quiz.title);
    }

    const questions = [
      {
        quizId: QUIZ_ID,
        question:
          "Romans 10:17 says faith comes by hearing, and hearing comes through the ______.",
        type: "multiple_choice" as const,
        options: [
          "A) word of God",
          "B) our feelings",
          "C) miracles we see",
          "D) good luck",
        ],
        correctAnswer: "A) word of God",
        points: 1,
        orderIndex: 1,
      },
      {
        quizId: QUIZ_ID,
        question: "According to Romans 10:17, faith comes by hearing God's word.",
        type: "true_false" as const,
        options: ["True", "False"],
        correctAnswer: "True",
        points: 1,
        orderIndex: 2,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Hebrews 11:1 says faith is being sure of what we hope for and certain of what we do not ______.",
        type: "multiple_choice" as const,
        options: ["A) see", "B) hear", "C) own", "D) forget"],
        correctAnswer: "A) see",
        points: 1,
        orderIndex: 3,
      },
      {
        quizId: QUIZ_ID,
        question: "Hebrews 11:6 says without faith it is impossible to please God.",
        type: "true_false" as const,
        options: ["True", "False"],
        correctAnswer: "True",
        points: 1,
        orderIndex: 4,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Who built the ark because he trusted God's warning about a flood—even before rain fell?",
        type: "multiple_choice" as const,
        options: ["A) Noah", "B) Jonah", "C) Moses", "D) David"],
        correctAnswer: "A) Noah",
        points: 1,
        orderIndex: 5,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Jesus taught that faith even as small as a mustard seed can move mountains.",
        type: "true_false" as const,
        options: ["True", "False"],
        correctAnswer: "True",
        points: 1,
        orderIndex: 6,
      },
      {
        quizId: QUIZ_ID,
        question: "In 2 Corinthians 5:7, the Bible says we walk by faith, not by ______.",
        type: "multiple_choice" as const,
        options: ["A) sight", "B) prayer", "C) giving", "D) fasting"],
        correctAnswer: "A) sight",
        points: 1,
        orderIndex: 7,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Walking by faith means we only trust God after we can see how things will work out.",
        type: "true_false" as const,
        options: ["True", "False"],
        correctAnswer: "False",
        points: 1,
        orderIndex: 8,
      },
      {
        quizId: QUIZ_ID,
        question:
          'In Joshua 24:15, who said, "As for me and my household, we will serve the LORD"?',
        type: "multiple_choice" as const,
        options: ["A) Joshua", "B) Jeremiah", "C) Jonah", "D) James"],
        correctAnswer: "A) Joshua",
        points: 1,
        orderIndex: 9,
      },
      {
        quizId: QUIZ_ID,
        question: "Romans 1:17 says the righteous shall live by faith.",
        type: "true_false" as const,
        options: ["True", "False"],
        correctAnswer: "True",
        points: 1,
        orderIndex: 10,
      },
    ];

    await db.execute(
      sql`SELECT setval(pg_get_serial_sequence('quiz_questions', 'id'), COALESCE((SELECT MAX(id) FROM quiz_questions), 1))`,
    );

    await db.insert(quizQuestions).values(questions);

    console.log(`✅ Inserted ${questions.length} questions for slug: ${SLUG}`);
  } catch (error: unknown) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    throw error;
  } finally {
    process.exit(0);
  }
}

addFamilyNightFaithFinalExamQuiz();
