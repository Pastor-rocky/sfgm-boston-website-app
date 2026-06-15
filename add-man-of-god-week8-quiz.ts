import { db } from "./server/db";
import { quizzes, quizQuestions } from "./shared/schema";
import { eq, sql } from "drizzle-orm";

const QUIZ_ID = 228;

async function addManOfGodWeek8Quiz() {
  try {
    const existing = await db.select().from(quizzes).where(eq(quizzes.id, QUIZ_ID));
    if (existing.length > 0) {
      console.log(`Quiz ${QUIZ_ID} already exists — refreshing questions...`);
      await db.delete(quizQuestions).where(eq(quizQuestions.quizId, QUIZ_ID));
      await db
        .update(quizzes)
        .set({
          title: "SFGM Man of God - Week 8 Quiz",
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
        title: "SFGM Man of God - Week 8 Quiz",
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
          "According to the video, To avoid being labeled as a false teacher, we sometimes hold back from teaching the truths that false teachers often misuse. This is necessary to maintain a good witness and serve as a beacon of light to the world.",
        type: "multiple_choice" as const,
        options: ["TRUE", "FALSE"],
        correctAnswer: "FALSE",
        points: 1,
        orderIndex: 1,
      },
      {
        quizId: QUIZ_ID,
        question: "According to the Chapter, godliness with __________ is described as great gain.",
        type: "multiple_choice" as const,
        options: ["(A) contentment", "(B) money", "(C) faith", "(D) wisdom"],
        correctAnswer: "(A) contentment",
        points: 1,
        orderIndex: 2,
      },
      {
        quizId: QUIZ_ID,
        question:
          "According to the Chapter , what is described as the counterweight to the love of money and materialism?",
        type: "multiple_choice" as const,
        options: ["(A) Hard work", "(B) Simplicity", "(C) Generosity", "(D) Poverty"],
        correctAnswer: "(C) Generosity",
        points: 1,
        orderIndex: 3,
      },
      {
        quizId: QUIZ_ID,
        question: "In Philippians 4:11-13, what is it that Paul learned to become in all circumstances?",
        type: "multiple_choice" as const,
        options: ["(A) Confident", "(B) Faithful", "(C) Content", "(D) Thankful"],
        correctAnswer: "(C) Content",
        points: 1,
        orderIndex: 4,
      },
      {
        quizId: QUIZ_ID,
        question:
          "From Chapter 7 and Philippians 4:13, Paul learned that he could be content through ______ who gives him strength.",
        type: "multiple_choice" as const,
        options: ["(A) Christ", "(B) Moses", "(C) himself", "(D) faith"],
        correctAnswer: "(A) Christ",
        points: 1,
        orderIndex: 5,
      },
      {
        quizId: QUIZ_ID,
        question: "From Chapter 7, what should Achan have done when he saw the spoil at Jericho?",
        type: "multiple_choice" as const,
        options: [
          "(A) Take a small portion for himself",
          "(B) Hide it and hope no one noticed",
          "(C) He should have waited",
          "(D) Trade it with another soldier",
        ],
        correctAnswer: "(C) He should have waited",
        points: 1,
        orderIndex: 6,
      },
      {
        quizId: QUIZ_ID,
        question:
          "What is the Greek meaning of the word \"content\" and what does it mean in English? (two-part question)\nWrite your answer(s):",
        type: "essay" as const,
        options: null,
        correctAnswer: "essay",
        points: 1,
        orderIndex: 7,
      },
      {
        quizId: QUIZ_ID,
        question:
          "From the Week 7 video lesson, how long did Pastor Anthony say it would take for someone to eventually reveal what their treasure is, whatever it may be?",
        type: "multiple_choice" as const,
        options: ["(A) A few minutes", "(B) One conversation", "(C) A day", "(D) A week"],
        correctAnswer: "(B) One conversation",
        points: 1,
        orderIndex: 8,
      },
      {
        quizId: QUIZ_ID,
        question:
          "True or False: Jesus approved of the Pharisees' tithing but rebuked them for neglecting the more important matters of the law?",
        type: "multiple_choice" as const,
        options: ["TRUE", "FALSE"],
        correctAnswer: "TRUE",
        points: 1,
        orderIndex: 9,
      },
      {
        quizId: QUIZ_ID,
        question: "From Chapter 7 and Acts 20:35, Jesus said it is more blessed to ______ than to _______.",
        type: "multiple_choice" as const,
        options: [
          "(A) give ... receive",
          "(B) receive ... give",
          "(C) pray ... work",
          "(D) save ... spend",
        ],
        correctAnswer: "(A) give ... receive",
        points: 1,
        orderIndex: 10,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Bonus questions\nFrom Chapter 7, what is one practical way to fight the love of money in your life?",
        type: "multiple_choice" as const,
        options: [
          "(A) Saving everything you earn",
          "(B) Giving generously",
          "(C) Comparing yourself to others",
          "(D) Avoiding church giving",
        ],
        correctAnswer: "(B) Giving generously",
        points: 1,
        orderIndex: 11,
        isBonus: true,
      },
      {
        quizId: QUIZ_ID,
        question: "According to Chapter 7, why is giving good not only for others but also for us?",
        type: "multiple_choice" as const,
        options: [
          "(A) It makes us more popular",
          "(B) It increases our reputation",
          "(C) It makes us less selfish and greedy",
          "(D) It guarantees financial success",
        ],
        correctAnswer: "(C) It makes us less selfish and greedy",
        points: 1,
        orderIndex: 12,
        isBonus: true,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Men of God stay away from God's gold!\nCharacter Essay\nPlease provide any biblical character who demonstrated graciousness in at least 100 words, you may also write a digital essay.",
        type: "essay" as const,
        options: null,
        correctAnswer: "essay",
        points: 1,
        orderIndex: 13,
        isBonus: true,
      },
    ];

    await db.execute(
      sql`SELECT setval(pg_get_serial_sequence('quiz_questions', 'id'), COALESCE((SELECT MAX(id) FROM quiz_questions), 1))`,
    );

    await db.insert(quizQuestions).values(questions);

    console.log(`✅ Week 8 quiz ready with ${questions.length} questions (id: ${QUIZ_ID})`);
  } catch (error: unknown) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    throw error;
  } finally {
    process.exit(0);
  }
}

addManOfGodWeek8Quiz();
