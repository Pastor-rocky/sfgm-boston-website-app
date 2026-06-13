import { db } from "./server/db";
import { quizzes, quizQuestions } from "./shared/schema";
import { eq, sql } from "drizzle-orm";

const QUIZ_ID = 220;
const SLUG = "family-night-faith-week-1";

async function addFamilyNightFaithWeek1Quiz() {
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
          title: "Family Night — Faith Week 1 Quiz",
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
        question: "What is the root word for faithfulness?",
        type: "multiple_choice" as const,
        options: ["A) Emet", "B) Tev", "C) Amen"],
        correctAnswer: "A) Emet",
        points: 1,
        orderIndex: 1,
      },
      {
        quizId: QUIZ_ID,
        question: "Who had little faith walking on water?",
        type: "multiple_choice" as const,
        options: ["1) Peter", "2) James", "3) John"],
        correctAnswer: "1) Peter",
        points: 1,
        orderIndex: 2,
      },
      {
        quizId: QUIZ_ID,
        question: "Who had great faith?",
        type: "multiple_choice" as const,
        options: [
          "1) The woman who touched the hem of Jesus' robe",
          "2) The sound man",
          "3) The leaders of the synagogue",
        ],
        correctAnswer: "1) The woman who touched the hem of Jesus' robe",
        points: 1,
        orderIndex: 3,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Mark 10: When the parents brought the children to Jesus, why did the disciples get mad?",
        type: "multiple_choice" as const,
        options: [
          "1) Because they were tired",
          "2) Because they were late for church",
          "3) Because they thought the parents were bothering Jesus",
        ],
        correctAnswer: "3) Because they thought the parents were bothering Jesus",
        points: 1,
        orderIndex: 4,
      },
      {
        quizId: QUIZ_ID,
        question:
          "When Jesus got mad at the disciples, what did He say about the children?",
        type: "multiple_choice" as const,
        options: [
          "1) Let the children come to me. Don't stop them!",
          "2) I took Ozempic today. I don't have time.",
          "3) Take the children away — we must be on our way!",
        ],
        correctAnswer: "1) Let the children come to me. Don't stop them!",
        points: 1,
        orderIndex: 5,
      },
      {
        quizId: QUIZ_ID,
        question: "Who does the kingdom of God belong to?",
        type: "multiple_choice" as const,
        options: [
          "1) The church workers",
          "2) The best person who tithes",
          "3) Anyone who receives the kingdom of God like a child",
        ],
        correctAnswer: "3) Anyone who receives the kingdom of God like a child",
        points: 1,
        orderIndex: 6,
      },
      {
        quizId: QUIZ_ID,
        question: "Who is the faithful witness in Revelation 22?",
        type: "multiple_choice" as const,
        options: [
          "1) Us — the believers of Jesus",
          "2) The disciples",
          "3) Only the person who wrote Revelation",
        ],
        correctAnswer: "1) Us — the believers of Jesus",
        points: 1,
        orderIndex: 7,
      },
      {
        quizId: QUIZ_ID,
        question: "Who is God talking about in 2 Samuel 7?",
        type: "multiple_choice" as const,
        options: ["1) King David", "2) King David's close friend Nathan", "3) Jesus"],
        correctAnswer: "3) Jesus",
        points: 1,
        orderIndex: 8,
      },
      {
        quizId: QUIZ_ID,
        question: "Who was talking to Moses in Exodus 18?",
        type: "multiple_choice" as const,
        options: ["1) His father-in-law", "2) Himself", "3) The judges of Israel"],
        correctAnswer: "1) His father-in-law",
        points: 1,
        orderIndex: 9,
      },
      {
        quizId: QUIZ_ID,
        question: "Why are we taught in the Bible to have faith (emet)?",
        type: "multiple_choice" as const,
        options: [
          "1) Because having true faith in God is a firm, unshakable foundation",
          "2) Because faithful is better than unfaithful",
          "3) Because people told me to just have faith",
        ],
        correctAnswer:
          "1) Because having true faith in God is a firm, unshakable foundation",
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

addFamilyNightFaithWeek1Quiz();
