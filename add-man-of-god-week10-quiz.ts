import { db } from "./server/db";
import { quizzes, quizQuestions } from "./shared/schema";
import { eq, sql } from "drizzle-orm";

const QUIZ_ID = 230;

async function addManOfGodWeek10Quiz() {
  try {
    const existing = await db.select().from(quizzes).where(eq(quizzes.id, QUIZ_ID));
    if (existing.length > 0) {
      console.log(`Quiz ${QUIZ_ID} already exists — refreshing questions...`);
      await db.delete(quizQuestions).where(eq(quizQuestions.quizId, QUIZ_ID));
      await db
        .update(quizzes)
        .set({
          title: "SFGM Man of God - Week 10 Quiz",
          timeLimit: 30,
          passingScore: 70,
          isFinalExam: false,
          isPublished: true,
          publishedAt: new Date(),
        })
        .where(eq(quizzes.id, QUIZ_ID));
    } else {
      await db.insert(quizzes).values({
        id: QUIZ_ID,
        moduleId: null,
        title: "SFGM Man of God - Week 10 Quiz",
        timeLimit: 30,
        passingScore: 70,
        isFinalExam: false,
        isPublished: true,
        publishedAt: new Date(),
      });
      console.log("Quiz created:", QUIZ_ID);
    }

    const questions = [
      {
        quizId: QUIZ_ID,
        question:
          "According to the chapter, Jesus has two natures, but how can Jesus be God and still grow in wisdom, stature, and favor?",
        type: "multiple_choice" as const,
        options: [
          "(A) He grew in His human nature",
          "(B) He grew in the Spirit",
          "(C) He seemed to grow in these things",
          "(D) Both natures grew together",
        ],
        correctAnswer: "(A) He grew in His human nature",
        points: 1,
        orderIndex: 1,
      },
      {
        quizId: QUIZ_ID,
        question:
          "FILL IN THE BLANK: According to Chapter 9, since Adam is the father of mankind, all men naturally bear his ______ nature.",
        type: "multiple_choice" as const,
        options: ["(A) fallen", "(B) sinful", "(C) earthly", "(D) mortal"],
        correctAnswer: "(A) fallen",
        points: 1,
        orderIndex: 2,
      },
      {
        quizId: QUIZ_ID,
        question: "In the chapter Genesis 3:15 is described as:",
        type: "multiple_choice" as const,
        options: [
          "(A) The law given to Israel",
          "(B) The first announcement of the Gospel",
          "(C) The fall of mankind",
          "(D) The promise of the covenant with Abraham",
        ],
        correctAnswer: "(B) The first announcement of the Gospel",
        points: 1,
        orderIndex: 3,
      },
      {
        quizId: QUIZ_ID,
        question: "According to the Chapter, Why is Jesus called the \"realest man\"?",
        type: "multiple_choice" as const,
        options: [
          "(A) Because He lived longer than others",
          "(B) Because He was a great teacher",
          "(C) Because He lived a sinless life in perfect harmony with God",
          "(D) Because He led many followers",
        ],
        correctAnswer: "(C) Because He lived a sinless life in perfect harmony with God",
        points: 1,
        orderIndex: 4,
      },
      {
        quizId: QUIZ_ID,
        question:
          "TRUE OR FALSE: Elijah's calling down fire from heaven confirmed his identity as a man of God.",
        type: "multiple_choice" as const,
        options: ["TRUE", "FALSE"],
        correctAnswer: "TRUE",
        points: 1,
        orderIndex: 5,
      },
      {
        quizId: QUIZ_ID,
        question:
          "The chapter ends with the question: \"What kind of man are you?\" Write one practical way a man of God can demonstrate the \"fire of God\" in his life.\nWrite your answer(s):",
        type: "essay" as const,
        options: null,
        correctAnswer: "essay",
        points: 1,
        orderIndex: 6,
      },
      {
        quizId: QUIZ_ID,
        question:
          "According to Chapter 9, when King Ahaziah's messengers described the prophet, the king immediately knew it was Elijah based on what detail?",
        type: "multiple_choice" as const,
        options: [
          "(A) His bold message about the king's death",
          "(B) His miracles and reputation",
          "(C) His appearance — a hairy man with a leather belt",
          "(D) His claim to be a prophet of God",
        ],
        correctAnswer: "(C) His appearance — a hairy man with a leather belt",
        points: 1,
        orderIndex: 7,
      },
      {
        quizId: QUIZ_ID,
        question: "True or false: Jesus is God and man mixed together?",
        type: "multiple_choice" as const,
        options: ["TRUE", "FALSE"],
        correctAnswer: "FALSE",
        points: 1,
        orderIndex: 8,
      },
      {
        quizId: QUIZ_ID,
        question:
          "From the Week 9 video lesson, Pastor Kevin stated that when Jesus became a man, He lost nothing but gained something. What did He gain?\nWrite your answer(s):",
        type: "essay" as const,
        options: null,
        correctAnswer: "essay",
        points: 1,
        orderIndex: 9,
      },
      {
        quizId: QUIZ_ID,
        question:
          "From the Week 9 video lesson, Pastor Kevin stated that the natural man is not ______.",
        type: "multiple_choice" as const,
        options: ["(A) spiritual", "(B) righteous", "(C) enough", "(D) complete"],
        correctAnswer: "(A) spiritual",
        points: 1,
        orderIndex: 10,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Important bonus question\nAfter studying the Man of God course, what is the most important truth you learned about what it means to be a man of God?\nWrite your answer(s):",
        type: "essay" as const,
        options: null,
        correctAnswer: "essay",
        points: 1,
        orderIndex: 11,
        isBonus: true,
      },
    ];

    await db.execute(
      sql`SELECT setval(pg_get_serial_sequence('quiz_questions', 'id'), COALESCE((SELECT MAX(id) FROM quiz_questions), 1))`,
    );

    await db.insert(quizQuestions).values(questions);

    console.log(`✅ Week 10 quiz ready with ${questions.length} questions (id: ${QUIZ_ID})`);
  } catch (error: unknown) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    throw error;
  } finally {
    process.exit(0);
  }
}

addManOfGodWeek10Quiz();
