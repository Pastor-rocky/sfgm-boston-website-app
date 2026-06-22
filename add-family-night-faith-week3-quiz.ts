import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { eq, sql } from "drizzle-orm";

const QUIZ_ID = 243;
const SLUG = "family-night-faith-week-3";

async function addFamilyNightFaithWeek3Quiz() {
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
          title: "Family Night — Faith Week 3 Quiz",
          timeLimit: 10,
          passingScore: 70,
          isFinalExam: false,
          isPublished: true,
          publishedAt: new Date(),
        })
        .returning();
      console.log("Quiz created:", quiz.id, quiz.title);
    }

    const questions = [
      {
        quizId: QUIZ_ID,
        question: "What word goes parallel with faith?",
        type: "multiple_choice" as const,
        options: ["A) Trust", "B) Lack", "C) Pain", "D) Doubt"],
        correctAnswer: "A) Trust",
        points: 1,
        orderIndex: 1,
      },
      {
        quizId: QUIZ_ID,
        question: "What's the key word in the teaching?",
        type: "multiple_choice" as const,
        options: ["A) Bible", "B) Church", "C) Testimony", "D) Believe"],
        correctAnswer: "D) Believe",
        points: 1,
        orderIndex: 2,
      },
      {
        quizId: QUIZ_ID,
        question: "Faith meaning:",
        type: "multiple_choice" as const,
        options: ["A) Loyalty", "B) Allegiance", "C) Believe", "D) All of the above"],
        correctAnswer: "D) All of the above",
        points: 1,
        orderIndex: 3,
      },
      {
        quizId: QUIZ_ID,
        question: "Why is our faith lacking?",
        type: "multiple_choice" as const,
        options: [
          "A) Unbelievable",
          "B) Forgot our testimony",
          "C) Hurt",
          "D) Don't go to church",
        ],
        correctAnswer: "B) Forgot our testimony",
        points: 1,
        orderIndex: 4,
      },
      {
        quizId: QUIZ_ID,
        question: "Remember what?",
        type: "multiple_choice" as const,
        options: ["A) Testimony", "B) Story", "C) Blessings", "D) Position"],
        correctAnswer: "A) Testimony",
        points: 1,
        orderIndex: 5,
      },
      {
        quizId: QUIZ_ID,
        question: "What story did we talk about?",
        type: "multiple_choice" as const,
        options: [
          "A) 3 men in the fiery furnace",
          "B) David and Goliath",
          "C) Daniel in the lions' den",
          "D) Saul changed to Paul",
        ],
        correctAnswer: "A) 3 men in the fiery furnace",
        points: 1,
        orderIndex: 6,
      },
      {
        quizId: QUIZ_ID,
        question: "Who did the 3 men want to please?",
        type: "multiple_choice" as const,
        options: ["A) Men", "B) Kings", "C) City", "D) God"],
        correctAnswer: "D) God",
        points: 1,
        orderIndex: 7,
      },
      {
        quizId: QUIZ_ID,
        question: "What happened to Peter when he began to doubt?",
        type: "multiple_choice" as const,
        options: [
          "A) He fell",
          "B) He began to sink",
          "C) He stayed in the boat",
          "D) None of the above",
        ],
        correctAnswer: "B) He began to sink",
        points: 1,
        orderIndex: 8,
      },
      {
        quizId: QUIZ_ID,
        question: "What happens when we have faith?",
        type: "multiple_choice" as const,
        options: [
          "A) We can do things this world can't imagine",
          "B) Nothing",
          "C) We get stronger",
          "D) We get smarter",
        ],
        correctAnswer: "A) We can do things this world can't imagine",
        points: 1,
        orderIndex: 9,
      },
      {
        quizId: QUIZ_ID,
        question: "A testimony's best part:",
        type: "multiple_choice" as const,
        options: [
          "A) It never fails",
          "B) It never stops",
          "C) It keeps you going",
          "D) It's forever",
        ],
        correctAnswer: "C) It keeps you going",
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

addFamilyNightFaithWeek3Quiz();
