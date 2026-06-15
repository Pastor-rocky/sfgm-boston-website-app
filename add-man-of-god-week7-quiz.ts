import { db } from "./server/db";
import { quizzes, quizQuestions } from "./shared/schema";
import { eq, sql } from "drizzle-orm";

const QUIZ_ID = 227;

async function addManOfGodWeek7Quiz() {
  try {
    const existing = await db.select().from(quizzes).where(eq(quizzes.id, QUIZ_ID));
    if (existing.length > 0) {
      console.log(`Quiz ${QUIZ_ID} already exists — refreshing questions...`);
      await db.delete(quizQuestions).where(eq(quizQuestions.quizId, QUIZ_ID));
      await db
        .update(quizzes)
        .set({
          title: "SFGM Man of God - Week 7 Quiz",
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
        title: "SFGM Man of God - Week 7 Quiz",
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
          "From the week six video lesson, Hosea 4:6 says, \"My people are destroyed for lack of knowledge. What point did Pastor Anthony make using the scripture in the video?\nWrite your answer(s):",
        type: "essay" as const,
        options: null,
        correctAnswer: "essay",
        points: 1,
        orderIndex: 1,
      },
      {
        quizId: QUIZ_ID,
        question:
          "According to the chapter, Lust is focused on __________, while love is focused on others.",
        type: "multiple_choice" as const,
        options: ["(A) self", "(B) pleasure", "(C) pride", "(D) others"],
        correctAnswer: "(A) self",
        points: 1,
        orderIndex: 2,
      },
      {
        quizId: QUIZ_ID,
        question:
          "True or False:\nSexual immorality harms the person committing the sin and does not affect others.",
        type: "multiple_choice" as const,
        options: ["YES", "NO"],
        correctAnswer: "YES",
        points: 1,
        orderIndex: 3,
      },
      {
        quizId: QUIZ_ID,
        question:
          "What Scripture was it when David prayed \"Create in me a Clean/Pure heart of God\"?",
        type: "multiple_choice" as const,
        options: ["(A) Psalm 51", "(B) 1 Kings 9", "(C) 1 Samuel 16", "(D) Psalms 119"],
        correctAnswer: "(A) Psalm 51",
        points: 1,
        orderIndex: 4,
      },
      {
        quizId: QUIZ_ID,
        question:
          "According to the chapter, after Nathan told David the story of the rich man and the lamb, what direct statement exposed David's sin?",
        type: "multiple_choice" as const,
        options: [
          "(A) Repent before the Lord",
          "(B) You will lose the kingdom",
          "(C) You are the man",
          "(D) God will show mercy",
        ],
        correctAnswer: "(C) You are the man",
        points: 1,
        orderIndex: 5,
      },
      {
        quizId: QUIZ_ID,
        question:
          "According to the video lesson, Dark corners would appear in the temple if the priests did not properly",
        type: "multiple_choice" as const,
        options: [
          "(A) Open the curtain",
          "(B) clean the candle wick",
          "(C) Burn the sacrifices",
          "(D) all the above",
        ],
        correctAnswer: "(B) clean the candle wick",
        points: 1,
        orderIndex: 6,
      },
      {
        quizId: QUIZ_ID,
        question:
          "From the Week 7 video lesson, Pastor Anthony described a minister may receive many compliments from a female admirer while his wife may not compliment him as much. Why did he say the wife often doesn't compliment as much, and what point was he making?",
        type: "multiple_choice" as const,
        options: [
          "(A) the wife doesn't notice his effort, and female admirer is harmless",
          "(B) the wife is the most honest, and the example warns men of God to recognize temptation disguised as admiration",
          "(C) She doesn't like his preaching style, and ministers should look elsewhere for encouragement",
          "(D) She is too familiar with him, and admiration from others is more meaningful",
        ],
        correctAnswer:
          "(B) the wife is the most honest, and the example warns men of God to recognize temptation disguised as admiration",
        points: 1,
        orderIndex: 7,
      },
      {
        quizId: QUIZ_ID,
        question:
          "According to the video,The adulterous woman is like a double-edged sword… what is sharper than a double-edged sword?\nWrite your answer(s):",
        type: "essay" as const,
        options: null,
        correctAnswer: "essay",
        points: 1,
        orderIndex: 8,
      },
      {
        quizId: QUIZ_ID,
        question:
          "From the Week 6 video lesson, when King David fell into adultery, what statement did Pastor Anthony highlight as the one that hurt David the most?",
        type: "multiple_choice" as const,
        options: [
          "(A) After David fasted, the child still died",
          "(B) Uriah never opened the letter that was his own death sentence",
          "(C) If everything God did for David wasn't enough, all he had to do was ask for more",
          "(D) David was the apple of God's eye, and he still did this",
        ],
        correctAnswer: "(C) If everything God did for David wasn't enough, all he had to do was ask for more",
        points: 1,
        orderIndex: 9,
      },
      {
        quizId: QUIZ_ID,
        question: "From Chapter 6 and 2 Timothy 2:22, what is the biblical response to youthful lust?",
        type: "multiple_choice" as const,
        options: [
          "(A) Manage it carefully",
          "(B) Ignore it",
          "(C) Flee from it",
          "(D) Pray but stay near it",
        ],
        correctAnswer: "(C) Flee from it",
        points: 1,
        orderIndex: 10,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Bonus question\nTrue or False? According to 1 Corinthians 6:15-17, a man of God's body is joined in the body of Christ, and committing adultery or another form of that sort of sin is a sin against Christ's body and the temple of the Holy Spirit?",
        type: "multiple_choice" as const,
        options: ["TRUE", "FALSE"],
        correctAnswer: "TRUE",
        points: 1,
        orderIndex: 11,
        isBonus: true,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Men of God stay away from God's girls!\nCharacter Essay\nPlease provide any biblical character who demonstrated self control in at least 100 words, you may also write a digital essay.",
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

    console.log(`✅ Week 7 quiz ready with ${questions.length} questions (id: ${QUIZ_ID})`);
  } catch (error: unknown) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    throw error;
  } finally {
    process.exit(0);
  }
}

addManOfGodWeek7Quiz();
