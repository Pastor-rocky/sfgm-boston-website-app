import { db } from "./server/db";
import { quizzes, quizQuestions } from "./shared/schema";
import { eq, sql } from "drizzle-orm";

const QUIZ_ID = 229;

async function addManOfGodWeek9Quiz() {
  try {
    const existing = await db.select().from(quizzes).where(eq(quizzes.id, QUIZ_ID));
    if (existing.length > 0) {
      console.log(`Quiz ${QUIZ_ID} already exists — refreshing questions...`);
      await db.delete(quizQuestions).where(eq(quizQuestions.quizId, QUIZ_ID));
      await db
        .update(quizzes)
        .set({
          title: "SFGM Man of God - Week 9 Quiz",
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
        title: "SFGM Man of God - Week 9 Quiz",
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
          "1 Corinthians 12:7 (ESV) \"To each is given the manifestation of the Spirit for the common good.\" What does this mean?\nWrite your answer(s):",
        type: "essay" as const,
        options: null,
        correctAnswer: "essay",
        points: 1,
        orderIndex: 1,
      },
      {
        quizId: QUIZ_ID,
        question: "What is the difference between the fruit of the Spirit and the gifts of the Spirit?\nWrite your answer(s):",
        type: "essay" as const,
        options: null,
        correctAnswer: "essay",
        points: 1,
        orderIndex: 2,
      },
      {
        quizId: QUIZ_ID,
        question: "FILL IN THE BLANKS:\n\"If you are ______ in little, you will be ______ in much.\"",
        type: "multiple_choice" as const,
        options: [
          "(A) faithful ... faithful",
          "(B) dishonest ... dishonest",
          "(C) lazy ... lazy",
          "(D) wealthy ... wealthy",
        ],
        correctAnswer: "(A) faithful ... faithful",
        points: 1,
        orderIndex: 3,
      },
      {
        quizId: QUIZ_ID,
        question: "From Chapter 8 and 2 Timothy 1:6, believers are told to ______ up the gift of God within them.",
        type: "multiple_choice" as const,
        options: ["(A) stir", "(B) hide", "(C) bury", "(D) sell"],
        correctAnswer: "(A) stir",
        points: 1,
        orderIndex: 4,
      },
      {
        quizId: QUIZ_ID,
        question:
          "FILL IN THE BLANKS: From the video lesson, A certain minister once said… \"instead of ______ the sheep, they ______ on the sheep.\"\nWrite your answer(s):",
        type: "essay" as const,
        options: null,
        correctAnswer: "essay",
        points: 1,
        orderIndex: 5,
      },
      {
        quizId: QUIZ_ID,
        question: "From Chapter 8, what principle is emphasized about stewardship and spiritual gifts?",
        type: "multiple_choice" as const,
        options: [
          "(A) How you start matters most",
          "(B) Finishing well is the true test of stewardship",
          "(C) Gifts determine your success",
          "(D) Influence is more important than faithfulness",
        ],
        correctAnswer: "(B) Finishing well is the true test of stewardship",
        points: 1,
        orderIndex: 6,
      },
      {
        quizId: QUIZ_ID,
        question: "What important lesson does Solomon's story teach about spiritual gifts?",
        type: "multiple_choice" as const,
        options: [
          "(A) Gifts guarantee faithfulness",
          "(B) Wisdom prevents compromise",
          "(C) Gifts do not guarantee right standing with God",
          "(D) Success proves obedience",
        ],
        correctAnswer: "(C) Gifts do not guarantee right standing with God",
        points: 1,
        orderIndex: 7,
      },
      {
        quizId: QUIZ_ID,
        question: "According to the chapter, graciousness is the answer to __________.",
        type: "multiple_choice" as const,
        options: ["(A) pride", "(B) impatience", "(C) covetousness", "(D) fear"],
        correctAnswer: "(C) covetousness",
        points: 1,
        orderIndex: 8,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Does the Bible say the gifts of God are revocable? In other words that they can be removed.",
        type: "multiple_choice" as const,
        options: ["YES", "NO"],
        correctAnswer: "NO",
        points: 1,
        orderIndex: 9,
      },
      {
        quizId: QUIZ_ID,
        question:
          "From the video lesson, What type of people did Pastor Anthony mention that know when you're being genuine or not?\nWrite your answer(s):",
        type: "essay" as const,
        options: null,
        correctAnswer: "essay",
        points: 1,
        orderIndex: 10,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Bonus questions\nFill in the blanks: What are the 4 G's to stay away from/not to mess with?\nGod's _____, God's _____, God's _____, God's _____.\nWrite your answer(s):",
        type: "essay" as const,
        options: null,
        correctAnswer: "essay",
        points: 1,
        orderIndex: 11,
        isBonus: true,
      },
      {
        quizId: QUIZ_ID,
        question:
          "From Chapter 8, which situation best reflects faithful stewardship of God-given gifts?",
        type: "multiple_choice" as const,
        options: [
          "(A) A gifted teacher builds a large following but rarely serves others personally",
          "(B) A talented leader hides his gift out of fear of criticism",
          "(C) A gifted minister uses his influence mainly for personal success and recognition",
          "(D) A gifted believer humbly uses his ability to serve others, finishing faithfully even without recognition",
        ],
        correctAnswer:
          "(D) A gifted believer humbly uses his ability to serve others, finishing faithfully even without recognition",
        points: 1,
        orderIndex: 12,
        isBonus: true,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Men of God stay faithful with God's gifts!\nCharacter Essay\nPlease provide any biblical character who demonstrated faithful stewardship in at least 100 words, you may also write a digital essay.",
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

    console.log(`✅ Week 9 quiz ready with ${questions.length} questions (id: ${QUIZ_ID})`);
  } catch (error: unknown) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    throw error;
  } finally {
    process.exit(0);
  }
}

addManOfGodWeek9Quiz();
