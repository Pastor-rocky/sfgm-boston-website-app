import { db } from "./server/db";
import { quizzes, quizQuestions } from "./shared/schema";
import { eq, sql } from "drizzle-orm";

async function fix() {
  await db.delete(quizQuestions).where(eq(quizQuestions.quizId, 220));
  const count = await db.select({ c: sql<number>`count(*)` }).from(quizQuestions).where(eq(quizQuestions.quizId, 220));
  console.log("Questions for quiz 220 after delete:", count);
  process.exit(0);
}
fix();
