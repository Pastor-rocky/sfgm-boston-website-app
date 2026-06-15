import { db } from "./server/db";
import { quizzes, quizQuestions } from "./shared/schema";
import { eq, sql } from "drizzle-orm";

const QUIZ_ID = 226;

async function addManOfGodWeek6Quiz() {
  try {
    const existing = await db.select().from(quizzes).where(eq(quizzes.id, QUIZ_ID));
    if (existing.length > 0) {
      console.log(`Quiz ${QUIZ_ID} already exists — refreshing questions...`);
      await db.delete(quizQuestions).where(eq(quizQuestions.quizId, QUIZ_ID));
      await db
        .update(quizzes)
        .set({
          title: "SFGM Man of God - Week 6 Quiz",
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
        title: "SFGM Man of God - Week 6 Quiz",
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
          "Fill in the blank:\nFrom the chapter, if a man grows up in position without growing _______ into humility it is only a matter of time before he falls.",
        type: "multiple_choice" as const,
        options: ["(A) up", "(B) down", "(C) old", "(D) fast"],
        correctAnswer: "(B) down",
        points: 1,
        orderIndex: 1,
      },
      {
        quizId: QUIZ_ID,
        question: "According to the chapter What warning does the life of King Uzziah give about success?",
        type: "multiple_choice" as const,
        options: [
          "(A) Success removes temptation",
          "(B) Success can lead to pride and downfall",
          "(C) Success guarantees spiritual maturity",
          "(D) Success prevents failure",
        ],
        correctAnswer: "(B) Success can lead to pride and downfall",
        points: 1,
        orderIndex: 2,
      },
      {
        quizId: QUIZ_ID,
        question:
          "according to the chapter What contrast is made by using the Greek word morphē for both God and servant?",
        type: "multiple_choice" as const,
        options: [
          "(A) Jesus lost His divinity",
          "(B) Jesus changed identities",
          "(C) Jesus, though fully God, truly humbled Himself to serve",
          "(D) Jesus became less important than others",
        ],
        correctAnswer: "(C) Jesus, though fully God, truly humbled Himself to serve",
        points: 1,
        orderIndex: 3,
      },
      {
        quizId: QUIZ_ID,
        question:
          "True or False:\nAccording to the chapter, the historian Josephus recorded an account of Herod Agrippa's death that closely matches the biblical account in Acts.",
        type: "multiple_choice" as const,
        options: ["TRUE", "FALSE"],
        correctAnswer: "TRUE",
        points: 1,
        orderIndex: 4,
      },
      {
        quizId: QUIZ_ID,
        question: "According to the chapter, What does Proverbs 27:21 illustrate?",
        type: "multiple_choice" as const,
        options: [
          "(A) Wealth tests character",
          "(B) Praise tests a person's heart",
          "(C) Trials reveal faith",
          "(D) Leadership requires endurance",
        ],
        correctAnswer: "(B) Praise tests a person's heart",
        points: 1,
        orderIndex: 5,
      },
      {
        quizId: QUIZ_ID,
        question:
          "From the video lesson, Pastor Anthony taught that pride was the sin in the garden. How did Satan know how to tempt Adam and Eve out of the blessing?",
        type: "multiple_choice" as const,
        options: [
          "(A) Because he understood human weakness better than God",
          "(B) Because he knew what led to his own fall from heaven",
          "(C) Because Adam and Eve were already rebellious",
          "(D) Because the garden lacked spiritual protection",
        ],
        correctAnswer: "(B) Because he knew what led to his own fall from heaven",
        points: 1,
        orderIndex: 6,
      },
      {
        quizId: QUIZ_ID,
        question: "According to Philippians 1:15–18, can God use someone who has prideful motives?",
        type: "multiple_choice" as const,
        options: ["YES", "NO"],
        correctAnswer: "YES",
        points: 1,
        orderIndex: 7,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Fill in the blank: From the video lesson, Pastor Anthony said, \"Forgive us for trying to use Your name to exalt our name. We should use __________________ to exalt Your name.\"\nWrite your answer(s):",
        type: "essay" as const,
        options: null,
        correctAnswer: "essay",
        points: 1,
        orderIndex: 8,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Romans chapter 12:16 says \"associate with the humble.\" What does this mean?\nWrite your answer(s):",
        type: "essay" as const,
        options: null,
        correctAnswer: "essay",
        points: 1,
        orderIndex: 9,
      },
      {
        quizId: QUIZ_ID,
        question:
          "According to the video, if the man of God would put pride to death in his life, what then would be seen in his life?\nWrite your answer(s):",
        type: "essay" as const,
        options: null,
        correctAnswer: "essay",
        points: 1,
        orderIndex: 10,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Bonus question\n(1.) What common mistake did Herod, Saul, and Uzziah make according to the chapter?",
        type: "multiple_choice" as const,
        options: [
          "(A) They feared their enemies",
          "(B) They rejected wise counsel",
          "(C) They grasped at glory that belongs to God",
          "(D) They avoided responsibility",
        ],
        correctAnswer: "(C) They grasped at glory that belongs to God",
        points: 1,
        orderIndex: 11,
        isBonus: true,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Men of God stay away from God's glory!\nCharacter Essay\nPlease provide any biblical character who demonstrated humility in at least 100 words, you may also write a digital essay.",
        type: "essay" as const,
        options: null,
        correctAnswer: "essay",
        points: 1,
        orderIndex: 12,
        isBonus: true,
      },
    ];

    await db.execute(
      sql`SELECT setval(pg_get_serial_sequence('quiz_questions', 'id'), COALESCE((SELECT MAX(id) FROM quiz_questions), 1))`,
    );

    await db.insert(quizQuestions).values(questions);

    console.log(`✅ Week 6 quiz ready with ${questions.length} questions (id: ${QUIZ_ID})`);
  } catch (error: unknown) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    throw error;
  } finally {
    process.exit(0);
  }
}

addManOfGodWeek6Quiz();
