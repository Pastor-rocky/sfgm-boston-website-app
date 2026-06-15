import { db } from "./server/db";
import { quizzes, quizQuestions } from "./shared/schema";
import { eq, sql } from "drizzle-orm";

const QUIZ_ID = 225;

async function addManOfGodWeek5Quiz() {
  try {
    const existing = await db.select().from(quizzes).where(eq(quizzes.id, QUIZ_ID));
    if (existing.length > 0) {
      console.log(`Quiz ${QUIZ_ID} already exists — refreshing questions...`);
      await db.delete(quizQuestions).where(eq(quizQuestions.quizId, QUIZ_ID));
      await db
        .update(quizzes)
        .set({
          title: "SFGM Man of God - Week 5 Quiz",
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
        title: "SFGM Man of God - Week 5 Quiz",
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
          "What does the chapter teach about worldly success and spiritual life through Nicodemus?",
        type: "multiple_choice" as const,
        options: [
          "(A) Success proves spiritual maturity",
          "(B) Influence replaces the need for faith",
          "(C) A man can have everything outwardly and still lack new birth",
          "(D) Religious effort guarantees salvation",
        ],
        correctAnswer: "(C) A man can have everything outwardly and still lack new birth",
        points: 1,
        orderIndex: 1,
      },
      {
        quizId: QUIZ_ID,
        question:
          "According to the gospel of John chapter 1, how is someone born of God?\nWrite your answer(s):",
        type: "essay" as const,
        options: null,
        correctAnswer: "essay",
        points: 1,
        orderIndex: 2,
      },
      {
        quizId: QUIZ_ID,
        question:
          "From John 2:24-25 leading into John 3, what important truth sets up Jesus' conversation with Nicodemus?",
        type: "multiple_choice" as const,
        options: [
          "(A) Jesus was impressed with religious leaders",
          "(B) Jesus entrusted Himself to those who believed because of miracles",
          "(C) Jesus knew what was in man and therefore addressed Nicodemus' true need",
          "(D) Nicodemus already understood the kingdom of God",
        ],
        correctAnswer: "(C) Jesus knew what was in man and therefore addressed Nicodemus' true need",
        points: 1,
        orderIndex: 3,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Fill in the blank:\nAccording to the chapter, becoming a man of God has everything to do with coming to the end of",
        type: "multiple_choice" as const,
        options: ["(A) yourself", "(B) others", "(C) sin", "(D) the world"],
        correctAnswer: "(A) yourself",
        points: 1,
        orderIndex: 4,
      },
      {
        quizId: QUIZ_ID,
        question:
          "True or False:\nAccording to the chapter, a man can fulfill worldly duties well yet still be spiritually lost without the new birth.",
        type: "multiple_choice" as const,
        options: ["TRUE", "FALSE"],
        correctAnswer: "TRUE",
        points: 1,
        orderIndex: 5,
      },
      {
        quizId: QUIZ_ID,
        question:
          "From the video lesson, Pastor Kevin taught that Week Four is the hinge of the course because everything else in the course can be learned by discipline, but without the new birth it all becomes:",
        type: "multiple_choice" as const,
        options: ["(A) successful", "(B) impressive", "(C) meaningless", "(D) difficult"],
        correctAnswer: "(C) meaningless",
        points: 1,
        orderIndex: 6,
      },
      {
        quizId: QUIZ_ID,
        question:
          "True or False: Being born again is instantaneous and gives us a new nature, though there are instant changes, walking in the newness of life which flows from our new nature is progressive.",
        type: "multiple_choice" as const,
        options: ["TRUE", "FALSE"],
        correctAnswer: "TRUE",
        points: 1,
        orderIndex: 7,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Fill in the blank: From the video lesson, Pastor Kevin said many people are on a __________________ in life.\nWrite your answer(s):",
        type: "essay" as const,
        options: null,
        correctAnswer: "essay",
        points: 1,
        orderIndex: 8,
      },
      {
        quizId: QUIZ_ID,
        question:
          "True or False: In the Week 4 video lesson, Pastor Kevin referenced a story explaining why Nicodemus visited Jesus at night.",
        type: "multiple_choice" as const,
        options: ["TRUE", "FALSE"],
        correctAnswer: "TRUE",
        points: 1,
        orderIndex: 9,
      },
      {
        quizId: QUIZ_ID,
        question:
          "When we are born again, we have a new nature, but we still struggle with the habits of our old nature. In light of this, what does Hebrews chapter 2:17-18 show us about Jesus?\nWrite your answer(s):",
        type: "essay" as const,
        options: null,
        correctAnswer: "essay",
        points: 1,
        orderIndex: 10,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Bonus Questions\n(1.) According to the encounter between Jesus and Nicodemus in John 3, what truth exposes the limitation of being only a \"natural man\"?",
        type: "multiple_choice" as const,
        options: [
          "(A) Religious knowledge guarantees entrance into the kingdom",
          "(B) Good works and discipline are enough to please God",
          "(C) Without the new birth, a man cannot see or enter the kingdom of God",
          "(D) Spiritual growth comes primarily through moral improvement",
        ],
        correctAnswer: "(C) Without the new birth, a man cannot see or enter the kingdom of God",
        points: 1,
        orderIndex: 11,
        isBonus: true,
      },
      {
        quizId: QUIZ_ID,
        question: "In John 1:14 What does the word \"dwelt\" mean?\nWrite your answer(s):",
        type: "essay" as const,
        options: null,
        correctAnswer: "essay",
        points: 1,
        orderIndex: 12,
        isBonus: true,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Character Essay\nPlease provide a biblical character who demonstrated the new birth in at least 100 words.",
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

    console.log(`✅ Week 5 quiz ready with ${questions.length} questions (id: ${QUIZ_ID})`);
  } catch (error: unknown) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    throw error;
  } finally {
    process.exit(0);
  }
}

addManOfGodWeek5Quiz();
