import { db } from "./server/db";
import { quizzes, quizQuestions } from "./shared/schema";
import { eq, sql } from "drizzle-orm";

const QUIZ_ID = 223;

async function addManOfGodWeek3Quiz() {
  try {
    const existing = await db.select().from(quizzes).where(eq(quizzes.id, QUIZ_ID));
    if (existing.length > 0) {
      console.log(`Quiz ${QUIZ_ID} already exists — refreshing questions...`);
      await db.delete(quizQuestions).where(eq(quizQuestions.quizId, QUIZ_ID));
      await db
        .update(quizzes)
        .set({
          title: "SFGM Man of God - Week 3 Quiz",
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
        title: "SFGM Man of God - Week 3 Quiz",
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
        question: "According to the chapter, what does business or money have to do with a man of God?",
        type: "multiple_choice" as const,
        options: [
          "A. Spiritual life is separate from work",
          "B. Nothing — money distracts from faith",
          "C. A lot — God cares about how men work and handle responsibility",
          "D. The church doesn't need to think about business",
        ],
        correctAnswer: "C. A lot — God cares about how men work and handle responsibility",
        points: 1,
        orderIndex: 1,
      },
      {
        quizId: QUIZ_ID,
        question: "From chapter 2, What example from creation shows that work was part of God's design for man?",
        type: "multiple_choice" as const,
        options: [
          "A. Adam naming the animals",
          "B. Adam being placed in Eden to work and keep it",
          "C. Noah gathering animals into the ark",
          "D. Abraham traveling to Canaan",
        ],
        correctAnswer: "B. Adam being placed in Eden to work and keep it",
        points: 1,
        orderIndex: 2,
      },
      {
        quizId: QUIZ_ID,
        question: "True or false: According to the chapter, work became part of man's life only after the fall?",
        type: "multiple_choice" as const,
        options: ["TRUE", "FALSE"],
        correctAnswer: "FALSE",
        points: 1,
        orderIndex: 3,
      },
      {
        quizId: QUIZ_ID,
        question: "What is the main reason men of God should work hard according to this teaching?",
        type: "multiple_choice" as const,
        options: [
          "(A) To never need help from anyone",
          "(B) To show godly character and not hurt the church's witness",
          "(C) To earn the right to lead spiritually",
          "(D) To become financially successful as proof of blessing",
        ],
        correctAnswer: "(B) To show godly character and not hurt the church's witness",
        points: 1,
        orderIndex: 4,
      },
      {
        quizId: QUIZ_ID,
        question:
          "According to the chapter, The extra manna before the Sabbath showed that God cares about both our work and our rest.",
        type: "multiple_choice" as const,
        options: ["TRUE", "FALSE"],
        correctAnswer: "TRUE",
        points: 1,
        orderIndex: 5,
      },
      {
        quizId: QUIZ_ID,
        question:
          "In your own words, please write how you can learn to trust God more when it comes to resting from work.\nWrite your answer(s):",
        type: "essay" as const,
        options: null,
        correctAnswer: "essay",
        points: 1,
        orderIndex: 6,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Peter and Paul, both apostles with significant ministries, had different approaches. While Paul occasionally continued working to support himself, Peter appears to have been a full-time minister.\nConsidering these differences, which ministry style would you prefer: Peter's or Paul's, and why?\nWrite your answer(s):",
        type: "essay" as const,
        options: null,
        correctAnswer: "essay",
        points: 1,
        orderIndex: 7,
      },
      {
        quizId: QUIZ_ID,
        question: "What does it mean to adorn the gospel?",
        type: "multiple_choice" as const,
        options: [
          "A) To live in a way that makes the gospel look good to others",
          "B) To only talk about the gospel often",
          "C) To memorize many Bible verses",
          "D) To go to church every week",
        ],
        correctAnswer: "A) To live in a way that makes the gospel look good to others",
        points: 1,
        orderIndex: 8,
      },
      {
        quizId: QUIZ_ID,
        question:
          "From the video lesson, which book did Pastor Kevin use to show spiritual truth and practical truth so men can live well-lived lives?",
        type: "multiple_choice" as const,
        options: ["A) Galatians", "B) Romans", "C) Hebrews", "D) James"],
        correctAnswer: "B) Romans",
        points: 1,
        orderIndex: 9,
      },
      {
        quizId: QUIZ_ID,
        question:
          "True or false: From the video lesson, Pastor Kevin made the point that even if the church cannot give financial help, it should always give food to anyone who asks.",
        type: "multiple_choice" as const,
        options: ["TRUE", "FALSE"],
        correctAnswer: "FALSE",
        points: 1,
        orderIndex: 10,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Men of God Work!\nCharacter Essay\nPlease provide a biblical character who worked hard in business or ministry in at least 100 words.",
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

    console.log(`✅ Week 3 quiz ready with ${questions.length} questions (id: ${QUIZ_ID})`);
  } catch (error: unknown) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    throw error;
  } finally {
    process.exit(0);
  }
}

addManOfGodWeek3Quiz();
