import { db } from "./server/db";
import { quizzes, quizQuestions } from "./shared/schema";
import { eq, sql } from "drizzle-orm";

const QUIZ_ID = 222;

async function addManOfGodWeek2Quiz() {
  try {
    const existing = await db.select().from(quizzes).where(eq(quizzes.id, QUIZ_ID));
    if (existing.length > 0) {
      console.log(`Quiz ${QUIZ_ID} already exists — refreshing questions...`);
      await db.delete(quizQuestions).where(eq(quizQuestions.quizId, QUIZ_ID));
      await db
        .update(quizzes)
        .set({
          title: "SFGM Man of God - Week 2 Quiz",
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
        title: "SFGM Man of God - Week 2 Quiz",
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
          "In exodus 3 and 4, How many times did Moses try to get out of being the Man God called him to be?",
        type: "multiple_choice" as const,
        options: ["(A) 2", "(B) 5", "(C) 4", "(D) 3"],
        correctAnswer: "(B) 5",
        points: 1,
        orderIndex: 1,
      },
      {
        quizId: QUIZ_ID,
        question:
          "In the Week 1 video, what example showed that getting older doesn't always mean being mature?",
        type: "multiple_choice" as const,
        options: [
          "A) Older people avoid confrontation",
          "B) Someone can be older but still live for partying and fun",
          "C) Church attendance makes a person mature",
          "D) Maturity comes automatically with age",
        ],
        correctAnswer: "B) Someone can be older but still live for partying and fun",
        points: 1,
        orderIndex: 2,
      },
      {
        quizId: QUIZ_ID,
        question:
          "According to the chapter, what are the four core responsibilities of a man emphasized early in his development?",
        type: "multiple_choice" as const,
        options: [
          "(A) Lead, Protect, Provide, Disciple",
          "(B) Pray, Fast, Study, Evangelize",
          "(C) Preach, Teach, Heal, Cast out demons",
          "(D) Work, Rest, Save, Retire",
        ],
        correctAnswer: "(A) Lead, Protect, Provide, Disciple",
        points: 1,
        orderIndex: 3,
      },
      {
        quizId: QUIZ_ID,
        question:
          "According to the chapter, why did God allow Moses to have 40 years in the wilderness before using him publicly?",
        type: "multiple_choice" as const,
        options: [
          "A) To punish him for leaving Egypt",
          "B) To prepare his character",
          "C) To remove his calling",
          "D) To distance him from leadership opportunities",
        ],
        correctAnswer: "B) To prepare his character",
        points: 1,
        orderIndex: 4,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Peer pressure is a factor every man has dealt with… The same way we felt pressure to become men in the sight of the world, shouldn't we also have a sense of urgency to become Men in the sight of God?",
        type: "multiple_choice" as const,
        options: ["YES", "NO"],
        correctAnswer: "YES",
        points: 1,
        orderIndex: 5,
      },
      {
        quizId: QUIZ_ID,
        question: "What do Moses' excuses primarily reveal about spiritual maturity?",
        type: "multiple_choice" as const,
        options: [
          "(A) God only calls confident leaders.",
          "(B) Spiritual maturity eliminates fear.",
          "(C) Obedience, despite insecurity, fosters maturity.",
          "(D) Leadership demands natural ability",
        ],
        correctAnswer: "(C) Obedience, despite insecurity, fosters maturity.",
        points: 1,
        orderIndex: 6,
      },
      {
        quizId: QUIZ_ID,
        question: "According to Luke 2:52 what did Jesus grow in?",
        type: "multiple_choice" as const,
        options: [
          "(A) Wisdom, Stature, Favor",
          "(B) Wisdom, Knowledge, Understanding",
          "(C) The Holy Spirit, Knowledge, Truth",
          "(D) Faith, Hope, Love",
        ],
        correctAnswer: "(A) Wisdom, Stature, Favor",
        points: 1,
        orderIndex: 7,
      },
      {
        quizId: QUIZ_ID,
        question:
          "In the Week 1 video, what was the meaning behind the quote about a man wearing similar attire on his wedding day and at a funeral?",
        type: "multiple_choice" as const,
        options: [
          "(A) Weddings and funerals are both formal occasions",
          "(B) Marriage represents the death of a single person and the birth of a man",
          "(C) Both events symbolize celebration",
          "(D) Tradition requires similar clothing for both events",
        ],
        correctAnswer: "(B) Marriage represents the death of a single person and the birth of a man",
        points: 1,
        orderIndex: 8,
      },
      {
        quizId: QUIZ_ID,
        question:
          "According to the chapter, what is one key difference between spiritual maturity and simply growing older?",
        type: "multiple_choice" as const,
        options: [
          "A) Spiritual maturity comes automatically with time",
          "B) Age guarantees wisdom and stability",
          "C) Spiritual maturity develops through obedience and growth, not just time",
          "D) Older believers are always more mature",
        ],
        correctAnswer: "C) Spiritual maturity develops through obedience and growth, not just time",
        points: 1,
        orderIndex: 9,
      },
      {
        quizId: QUIZ_ID,
        question:
          'Fill in the blank: According to first Corinthians 2:14 "the things of the spirit are _______ to a natural man."',
        type: "multiple_choice" as const,
        options: ["(A) foolishness", "(B) hidden", "(C) unknown", "(D) forbidden"],
        correctAnswer: "(A) foolishness",
        points: 1,
        orderIndex: 10,
      },
      {
        quizId: QUIZ_ID,
        question:
          "Bonus question\nThe life of Moses can be divided into three periods of 40 years: 40 years in Egypt, 40 years in Midian, and 40 years in the wilderness. We understand that each chunk was used to prepare him for what God was calling him to do. What can we learn from this pertaining to our own lives?\nWrite your answer(s):\nMen of God, put away childish things!",
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
          "Character Essay\nPlease provide a biblical character who grew in his or her maturity spiritually or physically in at least 100 words.",
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

    console.log(`✅ Week 2 quiz updated with ${questions.length} questions (id: ${QUIZ_ID})`);
  } catch (error: unknown) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    throw error;
  } finally {
    process.exit(0);
  }
}

addManOfGodWeek2Quiz();
