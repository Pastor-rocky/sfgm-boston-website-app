/**
 * Set passing_score to 70% for all quizzes except Man of God Week 1 (essay, quiz ID 221).
 * Run: npx tsx --env-file=.env update-all-quiz-passing-scores.ts
 */
import { db } from "./server/db";
import { quizzes } from "./shared/schema";
import { eq, ne, sql } from "drizzle-orm";
import { DEFAULT_PASSING_SCORE, MAN_OF_GOD_WEEK1_PASSING_SCORE } from "./shared/course-constants";

const MAN_OF_GOD_WEEK1_QUIZ_ID = 221;

async function main() {
  const before = await db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      passingScore: quizzes.passingScore,
    })
    .from(quizzes)
    .where(sql`${quizzes.passingScore} IS DISTINCT FROM ${DEFAULT_PASSING_SCORE}`);

  await db
    .update(quizzes)
    .set({ passingScore: DEFAULT_PASSING_SCORE })
    .where(ne(quizzes.id, MAN_OF_GOD_WEEK1_QUIZ_ID));

  await db
    .update(quizzes)
    .set({ passingScore: MAN_OF_GOD_WEEK1_PASSING_SCORE })
    .where(eq(quizzes.id, MAN_OF_GOD_WEEK1_QUIZ_ID));

  const after = await db
    .select({
      passingScore: quizzes.passingScore,
      count: sql<number>`count(*)::int`,
    })
    .from(quizzes)
    .groupBy(quizzes.passingScore);

  console.log(`✅ Set passing score to ${DEFAULT_PASSING_SCORE}% for all quizzes except ID ${MAN_OF_GOD_WEEK1_QUIZ_ID}`);
  console.log(`✅ Man of God Week 1 (ID ${MAN_OF_GOD_WEEK1_QUIZ_ID}) remains ${MAN_OF_GOD_WEEK1_PASSING_SCORE}%`);
  console.log(`   Quizzes that were not ${DEFAULT_PASSING_SCORE}% before: ${before.length}`);
  if (before.length > 0 && before.length <= 20) {
    for (const q of before) {
      console.log(`   - ${q.id}: ${q.passingScore}% — ${q.title}`);
    }
  }
  console.log("   Distribution after update:");
  for (const row of after) {
    console.log(`   - ${row.passingScore}%: ${row.count} quiz(zes)`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
