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
        question: "In this teaching, how is faith described?",
        type: "multiple_choice" as const,
        options: [
          "A) Taking action and obeying God",
          "B) Only a feeling with no follow-through",
          "C) Waiting until you see proof",
          "D) Something only pastors need",
        ],
        correctAnswer: "A) Taking action and obeying God",
        points: 1,
        orderIndex: 1,
      },
      {
        quizId: QUIZ_ID,
        question:
          "In the teaching, a man set up chairs before anyone came. What did that show?",
        type: "multiple_choice" as const,
        options: [
          "A) He believed people would come",
          "B) He was only trying to stay busy",
          "C) He wanted to test the chairs",
          "D) He did not expect anyone to show up",
        ],
        correctAnswer: "A) He believed people would come",
        points: 1,
        orderIndex: 2,
      },
      {
        quizId: QUIZ_ID,
        question:
          "The saying \"I will believe it when I see it\" matches how the Bible describes faith.",
        type: "true_false" as const,
        options: ["True", "False"],
        correctAnswer: "False",
        points: 1,
        orderIndex: 3,
      },
      {
        quizId: QUIZ_ID,
        question: "Who did God promise would become the father of many nations?",
        type: "multiple_choice" as const,
        options: ["A) Abraham", "B) Moses", "C) Noah", "D) David"],
        correctAnswer: "A) Abraham",
        points: 1,
        orderIndex: 4,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Faith sometimes means acting on God's word even when it does not make sense to us.",
        type: "true_false" as const,
        options: ["True", "False"],
        correctAnswer: "True",
        points: 1,
        orderIndex: 5,
      },
      {
        quizId: QUIZ_ID,
        question: "When life gets difficult, faith helps you keep __________.",
        type: "multiple_choice" as const,
        options: [
          "A) Believing in God",
          "B) Quitting",
          "C) Doubting",
          "D) Complaining",
        ],
        correctAnswer: "A) Believing in God",
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
        question: "Which of these does faith help you grow in?",
        type: "multiple_choice" as const,
        options: [
          "A) Patience",
          "B) Trust in God",
          "C) Confidence in God's promises",
          "D) All of the above",
        ],
        correctAnswer: "D) All of the above",
        points: 1,
        orderIndex: 8,
      },
      {
        quizId: QUIZ_ID,
        question: "In the teaching, humility is described as the container for what?",
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
        question: "According to James, faith without works is __________.",
        type: "multiple_choice" as const,
        options: ["A) Dead", "B) Perfect", "C) Alive in you", "D) Optional"],
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
