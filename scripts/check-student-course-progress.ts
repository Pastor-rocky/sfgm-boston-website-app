/**
 * Check a student's Studying for Service (or any course) progress.
 * Usage: npx tsx scripts/check-student-course-progress.ts robert 5
 */
import { Pool } from "pg";

const search = process.argv[2] || "robert";
const courseId = parseInt(process.argv[3] || "5", 10);

const SFS_WEEK_READINGS: Record<number, number[]> = {
  1: [401, 402], 2: [403, 404], 3: [405, 406], 4: [407, 408], 5: [409, 410],
};

const SFS_QUIZ_WEEKS: Record<number, number> = {
  1: 59, 2: 60, 3: 61, 4: 62, 5: 63,
};

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL required");
    process.exit(1);
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const users = await pool.query(
    `SELECT id, username, email, first_name, last_name FROM users
     WHERE LOWER(username) LIKE $1 OR LOWER(email) LIKE $1 OR LOWER(first_name) LIKE $1
     ORDER BY username`,
    [`%${search.toLowerCase()}%`],
  );

  if (!users.rows.length) {
    console.log("No users found for:", search);
    await pool.end();
    return;
  }

  for (const u of users.rows) {
    console.log("\n===", u.username, u.email, "===");
    const enroll = await pool.query(
      `SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2`,
      [u.id, courseId],
    );
    if (!enroll.rows.length) {
      console.log("Not enrolled in course", courseId);
      continue;
    }

    const progress = await pool.query(
      `SELECT content_type, content_id, completed FROM content_progress
       WHERE student_id = $1 AND course_id = $2 ORDER BY content_id`,
      [u.id, courseId],
    );
    const completed = new Set(
      progress.rows.filter((r) => r.completed).map((r) => `${r.content_type}:${r.content_id}`),
    );

    console.log("\nWeek unlock status (Studying for Service reading IDs):");
    for (let week = 1; week <= 5; week++) {
      const ids = SFS_WEEK_READINGS[week] || [];
      const readingsDone = ids.every((id) => completed.has(`reading:${id}`));
      const quizId = SFS_QUIZ_WEEKS[week];
      const attempts = await pool.query(
        `SELECT score, completed_at FROM quiz_attempts
         WHERE student_id = $1 AND quiz_id = $2 ORDER BY completed_at DESC LIMIT 3`,
        [u.id, quizId],
      );
      const best = attempts.rows[0];
      const scoreNum = best ? parseFloat(String(best.score)) : 0;
      const pct = scoreNum <= 1 ? scoreNum * 100 : scoreNum;
      console.log(
        `  Week ${week}: readings=${readingsDone ? "OK" : "MISSING " + ids.filter((id) => !completed.has(`reading:${id}`)).join(",")}` +
          ` | quiz ${quizId}: ${best ? `score=${best.score} (~${pct.toFixed(0)}%)` : "not taken"}`,
      );
    }

    const week4Ok = (SFS_WEEK_READINGS[4] || []).every((id) => completed.has(`reading:${id}`));
    console.log("\nCan access Week 5?", week4Ok ? "YES (week 4 readings complete)" : "NO — finish week 4 e-book (407) + Bible (408)");
  }

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
