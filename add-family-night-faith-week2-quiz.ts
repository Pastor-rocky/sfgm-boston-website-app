import { db } from "./server/db";
import { quizzes, quizQuestions } from "./shared/schema";
import { eq, sql } from "drizzle-orm";

const QUIZ_ID = 232;
const SLUG = "family-night-faith-week-2";

async function addFamilyNightFaithWeek2Quiz() {
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
          title: "Family Night — Faith Week 2 Quiz",
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
        question: "According to the teaching, faith is best described as what?",
        type: "multiple_choice" as const,
        options: [
          "A) Action",
          "B) A feeling with no follow-through",
          "C) Waiting until you see proof",
          "D) Something only pastors need",
        ],
        correctAnswer: "A) Action",
        points: 1,
        orderIndex: 1,
      },
      {
        quizId: QUIZ_ID,
        question: "Why did the man set up chairs before anyone arrived?",
        type: "multiple_choice" as const,
        options: [
          "A) He had faith they would come",
          "B) He was told to stay busy",
          "C) He wanted to test the chairs",
          "D) He did not believe anyone would show up",
        ],
        correctAnswer: "A) He had faith they would come",
        points: 1,
        orderIndex: 2,
      },
      {
        quizId: QUIZ_ID,
        question: '"I will believe it when I see it" is a statement of biblical faith.',
        type: "true_false" as const,
        options: ["True", "False"],
        correctAnswer: "False",
        points: 1,
        orderIndex: 3,
      },
      {
        quizId: QUIZ_ID,
        question:
          "God promised that __________ would become the father of many nations.",
        type: "multiple_choice" as const,
        options: ["A) Abraham", "B) Moses", "C) Noah", "D) David"],
        correctAnswer: "A) Abraham",
        points: 1,
        orderIndex: 4,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Faith is taking action even when what God says does not seem to make sense.",
        type: "true_false" as const,
        options: ["True", "False"],
        correctAnswer: "True",
        points: 1,
        orderIndex: 5,
      },
      {
        quizId: QUIZ_ID,
        question: "Faith keeps you __________, even when circumstances are hard.",
        type: "multiple_choice" as const,
        options: [
          "A) Believing",
          "B) Doubting",
          "C) Quitting",
          "D) Complaining",
        ],
        correctAnswer: "A) Believing",
        points: 1,
        orderIndex: 6,
      },
      {
        quizId: QUIZ_ID,
        question: "God never forgets His promises.",
        type: "true_false" as const,
        options: ["True", "False"],
        correctAnswer: "True",
        points: 1,
        orderIndex: 7,
      },
      {
        quizId: QUIZ_ID,
        question: "Faith gives you…",
        type: "multiple_choice" as const,
        options: [
          "A) Patience",
          "B) Trust",
          "C) Confidence in God's promises",
          "D) All of the above",
        ],
        correctAnswer: "D) All of the above",
        points: 1,
        orderIndex: 8,
      },
      {
        quizId: QUIZ_ID,
        question: "Humility is the container for what?",
        type: "multiple_choice" as const,
        options: [
          "A) The anointing",
          "B) Pride",
          "C) Doubt",
          "D) Fear",
        ],
        correctAnswer: "A) The anointing",
        points: 1,
        orderIndex: 9,
      },
      {
        quizId: QUIZ_ID,
        question: "According to Scripture, faith without works is…",
        type: "multiple_choice" as const,
        options: ["A) Dead", "B) Perfect", "C) Alive in you", "D) None of the above"],
        correctAnswer: "A) Dead",
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

addFamilyNightFaithWeek2Quiz();
