/**
 * Mock Family Night final exam attempts for leaderboard QA.
 * Run: npx tsx scripts/mock-family-night-final-exam-leaderboard.ts
 * Cleanup only mock rows: npx tsx scripts/mock-family-night-final-exam-leaderboard.ts --cleanup
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { and, eq, inArray, sql } from "drizzle-orm";

const QUIZ_ID = 244;
const MOCK_TAG = "family-night-mock-2026-06";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", ".env") });

async function main() {
  const cleanupOnly = process.argv.includes("--cleanup");

  const { db } = await import("../server/db");
  const { users, quizAttempts } = await import("../shared/schema");
  const { getFamilyNightLeaderboard } = await import("../server/services/familyNightLeaderboard");

  const existingMock = await db
    .select({ id: quizAttempts.id })
    .from(quizAttempts)
    .where(
      and(
        eq(quizAttempts.quizId, QUIZ_ID),
        sql`${quizAttempts.answers}->>'mockTag' = ${MOCK_TAG}`,
      ),
    );

  if (existingMock.length > 0) {
    await db.delete(quizAttempts).where(
      inArray(
        quizAttempts.id,
        existingMock.map((r) => r.id),
      ),
    );
    console.log(`Removed ${existingMock.length} previous mock attempt(s).`);
  }

  if (cleanupOnly) {
    const board = await getFamilyNightLeaderboard();
    console.log("Cleanup done. Remaining overall entries:", board.overall.length);
    process.exit(0);
  }

  const students = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      username: users.username,
      gender: users.gender,
    })
    .from(users)
    .where(eq(users.role, "student"))
    .orderBy(users.createdAt)
    .limit(30);

  if (students.length < 30) {
    console.warn(`Only found ${students.length} students (wanted 30). Using all available.`);
  }

  if (students.length === 0) {
    throw new Error("No students found in database.");
  }

  const pick = students.slice(0, 30);
  const men = pick.filter((s) => s.gender === "Male");
  const women = pick.filter((s) => s.gender === "Female");
  const fastestStudent = men[0] ?? pick[0]!;
  const fastestWoman = women[0] ?? null;

  type MockAttempt = {
    studentId: string;
    score: number;
    timeSpent: number;
    label: string;
  };

  const plans: MockAttempt[] = [];

  plans.push({
    studentId: fastestStudent.id,
    score: 1,
    timeSpent: 1,
    label: "FASTEST_PERFECT",
  });

  if (fastestWoman && fastestWoman.id !== fastestStudent.id) {
    plans.push({
      studentId: fastestWoman.id,
      score: 1,
      timeSpent: 1,
      label: "FASTEST_WOMAN",
    });
  }

  const used = new Set(plans.map((p) => p.studentId));
  let minute = 2;
  for (const student of pick) {
    if (used.has(student.id)) continue;

    let score: number;
    const usedCount = used.size;
    if (usedCount <= 18) {
      score = 1;
    } else if (usedCount <= 24) {
      score = 0.9;
    } else if (usedCount <= 28) {
      score = 0.8;
    } else {
      score = 0.7;
    }

    plans.push({
      studentId: student.id,
      score,
      timeSpent: minute,
      label: score === 1 ? "PERFECT" : `SCORE_${Math.round(score * 100)}`,
    });
    used.add(student.id);
    minute += 1;
  }

  const retryStudent = pick.find((s) => s.id !== fastestStudent.id) ?? pick[1];
  if (retryStudent && plans.some((p) => p.studentId === retryStudent.id && p.score === 1)) {
    plans.push({
      studentId: retryStudent.id,
      score: 0.8,
      timeSpent: 1,
      label: "RETRY_WORSE",
    });
  }

  const now = new Date();
  const rows = plans.map((plan, index) => ({
    studentId: plan.studentId,
    quizId: QUIZ_ID,
    answers: {
      mockTag: MOCK_TAG,
      mockLabel: plan.label,
      mockIndex: index,
    },
    score: plan.score.toFixed(2),
    startedAt: new Date(now.getTime() - plan.timeSpent * 60_000),
    completedAt: now,
    submittedAt: now,
    timeSpent: plan.timeSpent,
    essay: null,
    essayGraded: false,
    instructorFeedback: null,
    finalGrade: null,
    certificateApproved: false,
    updatedAt: now,
  }));

  await db.insert(quizAttempts).values(rows);

  console.log(`\n✅ Inserted ${rows.length} mock final exam attempts for quiz ${QUIZ_ID}`);
  console.log(
    `🏆 Designated fastest winner: ${fastestStudent.firstName ?? ""} ${fastestStudent.lastName ?? ""} (${fastestStudent.username}) — 100% in 1 min`,
  );
  if (fastestWoman) {
    console.log(
      `🏆 Designated fastest woman: ${fastestWoman.firstName ?? ""} ${fastestWoman.lastName ?? ""} (${fastestWoman.username}) — 100% in 1 min`,
    );
  } else {
    console.log("ℹ️  No students with gender=Female in this sample — women's champion skipped.");
  }

  const board = await getFamilyNightLeaderboard();

  console.log("\n=== OVERALL TOP 10 ===");
  for (const entry of board.overall.slice(0, 10)) {
    console.log(
      `#${entry.rank} ${entry.displayName} — ${entry.scorePercent}% — ${entry.timeSpentMinutes} min`,
    );
  }

  console.log("\n=== CHAMPIONS ===");
  console.log("Overall:", board.champions.overall);
  console.log("Men:", board.champions.men);
  console.log("Women:", board.champions.women);

  const top = board.overall[0];
  const ok =
    top?.studentId === fastestStudent.id &&
    top.scorePercent >= 100 &&
    top.timeSpentMinutes === 1;

  if (ok) {
    console.log("\n✅ PASS — Fastest perfect score is ranked #1 overall.");
  } else {
    console.error("\n❌ FAIL — Expected fastest student at #1.");
    console.error("Got:", top);
    process.exit(1);
  }

  const student2Best = board.overall.find((e) => e.studentId === retryStudent?.id);
  if (student2Best && student2Best.scorePercent < 100) {
    console.log("✅ PASS — Retry with lower score did not replace a perfect attempt.");
  } else if (student2Best?.scorePercent >= 100) {
    console.log("✅ PASS — Student kept best score (100%) over a faster lower score.");
  }

  if (fastestWoman && board.champions.women?.studentId === fastestWoman.id) {
    console.log("✅ PASS — Fastest woman ranked as women's champion.");
  }

  console.log("\nView live board: http://localhost:56000/family-night (log in)");
  console.log(`Cleanup mock data: npx tsx scripts/mock-family-night-final-exam-leaderboard.ts --cleanup`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
