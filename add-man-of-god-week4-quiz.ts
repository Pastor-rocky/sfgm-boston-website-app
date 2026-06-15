import { db } from "./server/db";
import { quizzes, quizQuestions } from "./shared/schema";
import { eq, sql } from "drizzle-orm";

const QUIZ_ID = 224;

async function addManOfGodWeek4Quiz() {
  try {
    const existing = await db.select().from(quizzes).where(eq(quizzes.id, QUIZ_ID));
    if (existing.length > 0) {
      console.log(`Quiz ${QUIZ_ID} already exists — refreshing questions...`);
      await db.delete(quizQuestions).where(eq(quizQuestions.quizId, QUIZ_ID));
      await db
        .update(quizzes)
        .set({
          title: "SFGM Man of God - Week 4 Quiz",
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
        title: "SFGM Man of God - Week 4 Quiz",
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
          "According to the chapter, what two truths about leadership are shown in Genesis 2:18 and 2:24?",
        type: "multiple_choice" as const,
        options: [
          "A) The wife leads the home and parents guide the marriage",
          "B) The woman helps the man and the man leaves his parents to lead his own family",
          "C) Marriage removes family responsibility",
          "D) Leadership in the home is shared equally with parents",
        ],
        correctAnswer: "B) The woman helps the man and the man leaves his parents to lead his own family",
        points: 1,
        orderIndex: 1,
      },
      {
        quizId: QUIZ_ID,
        question:
          "According to the chapter, what principle is taught in Acts 5:29 when the apostles said, \"We must obey God rather than men\"?",
        type: "multiple_choice" as const,
        options: [
          "A) Leaders should avoid conflict",
          "B) Family authority is always final",
          "C) Obedience to God comes before obedience to people",
          "D) Government rules should be obeyed",
        ],
        correctAnswer: "C) Obedience to God comes before obedience to people",
        points: 1,
        orderIndex: 2,
      },
      {
        quizId: QUIZ_ID,
        question:
          "According to the chapter, what quality did Joshua show when he stepped into leadership after Moses?",
        type: "multiple_choice" as const,
        options: [
          "(A) Wealth and influence",
          "(B) Strength and courage in trusting God",
          "(C) Political skill",
          "(D) Military experience alone",
        ],
        correctAnswer: "(B) Strength and courage in trusting God",
        points: 1,
        orderIndex: 3,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Fill in the blank: According to the chapter, a man of God should be Spirit-__________, not controlled by others.",
        type: "multiple_choice" as const,
        options: ["(A) filled", "(B) led", "(C) controlled", "(D) taught"],
        correctAnswer: "(B) led",
        points: 1,
        orderIndex: 4,
      },
      {
        quizId: QUIZ_ID,
        question:
          "In the video lesson, Pastor Kevin taught that leaders need encouragement. Who were the three sources of encouragement Joshua received?",
        type: "multiple_choice" as const,
        options: [
          "(A) The elders, priests, and judges",
          "(B) His family, friends, and military leaders",
          "(C) The prophets, kings, and priests",
          "(D) God, Moses, and the people of Israel",
        ],
        correctAnswer: "(D) God, Moses, and the people of Israel",
        points: 1,
        orderIndex: 5,
      },
      {
        quizId: QUIZ_ID,
        question: "In Joshua chapter 1, how many times was Joshua told to be strong and courageous ?",
        type: "multiple_choice" as const,
        options: ["(A) 5", "(B) 3", "(C) 4", "(D) 7"],
        correctAnswer: "(B) 3",
        points: 1,
        orderIndex: 6,
      },
      {
        quizId: QUIZ_ID,
        question:
          "According to the chapter, being ready to step into new territory and keep learning is part of what it means to \"man up\" for God. What does this require from a man of God?",
        type: "multiple_choice" as const,
        options: [
          "(A) Staying where he is comfortable and experienced",
          "(B) A willingness to grow, trust God, and embrace new responsibilities",
          "(C) Waiting until others push him forward",
          "(D) Avoiding unfamiliar challenges",
        ],
        correctAnswer: "(B) A willingness to grow, trust God, and embrace new responsibilities",
        points: 1,
        orderIndex: 7,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Fill in the blank: From the video lesson, Pastor Kevin said knowledge is to know and wisdom is to apply. This shows that the Man of God course is not just for information but for ___________",
        type: "multiple_choice" as const,
        options: ["(A) application", "(B) entertainment", "(C) debate", "(D) memorization"],
        correctAnswer: "(A) application",
        points: 1,
        orderIndex: 8,
      },
      {
        quizId: QUIZ_ID,
        question:
          "From the video lesson, Pastor Kevin taught that a man of God would sell himself short if he never took advice from his __________________.",
        type: "multiple_choice" as const,
        options: [
          "(A) respected spiritual leaders",
          "(B) godly parents and a godly wife",
          "(C) trusted friends and coworkers",
          "(D) his own thoughts and experiences",
        ],
        correctAnswer: "(B) godly parents and a godly wife",
        points: 1,
        orderIndex: 9,
      },
      {
        quizId: QUIZ_ID,
        question:
          "According to the chapter, following God and leading biblically can sometimes create tension within the family. What should a man of God should do in this situation?\nWrite your answer(s):",
        type: "essay" as const,
        options: null,
        correctAnswer: "essay",
        points: 1,
        orderIndex: 10,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Men of God Lead!\nCharacter Essay\nPlease provide a biblical character who demonstrated good leadership in family or ministry in at least 100 words.",
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

    console.log(`✅ Week 4 quiz ready with ${questions.length} questions (id: ${QUIZ_ID})`);
  } catch (error: unknown) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    throw error;
  } finally {
    process.exit(0);
  }
}

addManOfGodWeek4Quiz();
