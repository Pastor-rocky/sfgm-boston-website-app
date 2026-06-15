/**
 * Systematic platform audit: courses, passing scores, research questions, progression config.
 * Run: npx tsx --env-file=.env audit-platform-systematic.ts
 */
import { db } from "./server/db";
import { courses, quizzes, quizQuestions, courseVideos, courseModules } from "./shared/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { courseProgressConfig } from "./server/course-progress-config";
import { getCourseWeekReadingSets } from "./shared/course-reading-ids";
import { DEFAULT_PASSING_SCORE, MAN_OF_GOD_WEEK1_PASSING_SCORE } from "./shared/course-constants";
import { isResearchQuestion } from "./shared/quiz-scoring";

const MAN_OF_GOD_WEEK1_QUIZ_ID = 221;

/** Client hardcoded reading IDs — from shared/course-reading-ids.ts */
function clientReadingMap(courseId: number): Record<number, number[]> {
  const sets = getCourseWeekReadingSets(courseId);
  const map: Record<number, number[]> = {};
  sets.forEach((ids, i) => { map[i + 1] = ids; });
  return map;
}

const CLIENT_READING_IDS: Record<number, Record<number, number[]>> = {
  1: clientReadingMap(1),
  2: clientReadingMap(2),
  3: clientReadingMap(3),
  4: clientReadingMap(4),
  5: clientReadingMap(5),
  6: clientReadingMap(6),
  7: clientReadingMap(7),
  8: clientReadingMap(8),
  16: clientReadingMap(16),
};

const COURSE_NAMES: Record<number, string> = {
  1: "Acts in Action",
  2: "Fire Starter",
  3: "Don't Be a Jonah",
  4: "G.R.O.W",
  5: "Studying for Service",
  6: "Deacon Course",
  7: "Level Up Leadership",
  8: "Youth Ministry",
  16: "Man of God",
};

const EXPECTED_WEEKS: Record<number, number> = {
  1: 10, 2: 10, 3: 11, 4: 4, 5: 12, 6: 5, 7: 6, 8: 5, 16: 10,
};

/** Weekly quiz count may differ from reading weeks (by design) */
const EXPECTED_WEEKLY_QUIZZES: Record<number, number> = {
  1: 10, 2: 10, 3: 11, 4: 4, 5: 11, 6: 5, 7: 5, 8: 5, 16: 10,
};

type Issue = { severity: "error" | "warn"; courseId: number; message: string };

function extractWeek(title: string): number | null {
  if (/final exam/i.test(title)) return 99;
  const m = title.match(/Week (\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

async function main() {
  const issues: Issue[] = [];
  const allCourses = await db.select().from(courses).where(eq(courses.isActive, true));
  const allQuizzes = await db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      passingScore: quizzes.passingScore,
      timeLimit: quizzes.timeLimit,
      isFinalExam: quizzes.isFinalExam,
      moduleId: quizzes.moduleId,
    })
    .from(quizzes);

  const allQuestions = await db
    .select({ quizId: quizQuestions.quizId, question: quizQuestions.question })
    .from(quizQuestions);

  const researchByQuiz = new Map<number, number[]>();
  for (const q of allQuestions) {
    if (isResearchQuestion(q.question)) {
      const list = researchByQuiz.get(q.quizId) ?? [];
      list.push(list.length + 1);
      researchByQuiz.set(q.quizId, list);
    }
  }

  // Passing score audit
  const badPassing = allQuizzes.filter((q) => {
    if (q.id === MAN_OF_GOD_WEEK1_QUIZ_ID) return q.passingScore !== MAN_OF_GOD_WEEK1_PASSING_SCORE;
    return q.passingScore !== DEFAULT_PASSING_SCORE;
  });

  console.log("═".repeat(80));
  console.log("SYSTEMATIC PLATFORM AUDIT");
  console.log("═".repeat(80));
  console.log(`\n📊 Passing scores: ${allQuizzes.length} quizzes total`);
  if (badPassing.length === 0) {
    console.log(`   ✅ All quizzes at ${DEFAULT_PASSING_SCORE}% (MoG Week 1 at ${MAN_OF_GOD_WEEK1_PASSING_SCORE}%)`);
  } else {
    console.log(`   ❌ ${badPassing.length} quiz(zes) with wrong passing score:`);
    for (const q of badPassing.slice(0, 30)) {
      console.log(`      - ID ${q.id}: ${q.passingScore}% — ${q.title}`);
      issues.push({ severity: "error", courseId: 0, message: `Quiz ${q.id} passing score ${q.passingScore}%` });
    }
  }

  console.log(`\n🔬 Research questions: ${researchByQuiz.size} quiz(zes) with research wording`);
  if (researchByQuiz.size === 0) {
    console.log("   ✅ No questions contain 'research outside the bible' — card hidden everywhere");
  } else {
    for (const [quizId, nums] of researchByQuiz) {
      const quiz = allQuizzes.find((q) => q.id === quizId);
      console.log(`   ⚠️  Quiz ${quizId} (${quiz?.title}): questions ${nums.join(", ")}`);
      issues.push({ severity: "warn", courseId: 0, message: `Quiz ${quizId} has research questions` });
    }
  }

  // Per-course audit
  const auditedCourseIds = [1, 2, 3, 4, 5, 6, 7, 8, 16];
  console.log("\n" + "─".repeat(80));
  console.log("PER-COURSE AUDIT");
  console.log("─".repeat(80));

  for (const courseId of auditedCourseIds) {
    const name = COURSE_NAMES[courseId] ?? `Course ${courseId}`;
    const config = courseProgressConfig[courseId];
    const configQuizIds = config?.quizIds ?? [];
    const configQuizzes = allQuizzes.filter((q) => configQuizIds.includes(q.id));

    const videos = await db
      .select({ id: courseVideos.id, title: courseVideos.title, isPublished: courseVideos.isPublished })
      .from(courseVideos)
      .where(eq(courseVideos.courseId, courseId));

    const publishedVideos = videos.filter((v) => v.isPublished && /Week \d+/i.test(v.title));
    const expectedWeeks = EXPECTED_WEEKS[courseId] ?? 0;
    const expectedWeeklyQuizzes = EXPECTED_WEEKLY_QUIZZES[courseId] ?? expectedWeeks;
    const weeklyQuizzes = configQuizzes.filter((q) => !q.isFinalExam);
    const finalQuizzes = configQuizzes.filter((q) => q.isFinalExam);

    const readingMap = CLIENT_READING_IDS[courseId] ?? {};
    const readingWeeks = Object.keys(readingMap).length;
    const readingsPerWeek = Object.values(readingMap).map((ids) => ids.length);

    let status = "✅";
    const courseIssues: string[] = [];

    if (!config) {
      status = "❌";
      courseIssues.push("missing courseProgressConfig entry");
    }
    if (weeklyQuizzes.length !== expectedWeeklyQuizzes) {
      status = "❌";
      courseIssues.push(`weekly quizzes ${weeklyQuizzes.length}/${expectedWeeklyQuizzes}`);
    }
    if (finalQuizzes.length !== 1) {
      status = status === "✅" ? "⚠️" : status;
      courseIssues.push(`final exams ${finalQuizzes.length} (expected 1)`);
    }
    if (readingWeeks !== expectedWeeks) {
      status = "❌";
      courseIssues.push(`reading weeks ${readingWeeks}/${expectedWeeks}`);
    }

    // Check each quiz has questions
    for (const q of configQuizzes) {
      const qCount = allQuestions.filter((qq) => qq.quizId === q.id).length;
      if (qCount === 0 && courseId !== 16) {
        status = "❌";
        courseIssues.push(`quiz ${q.id} has 0 questions`);
      }
      if (q.passingScore !== (q.id === MAN_OF_GOD_WEEK1_QUIZ_ID ? MAN_OF_GOD_WEEK1_PASSING_SCORE : DEFAULT_PASSING_SCORE)) {
        status = "❌";
        courseIssues.push(`quiz ${q.id} passing ${q.passingScore}%`);
      }
    }

    // Video expectation (some courses use video on alternating weeks only)
    const expectsVideos = config?.video?.type === "published";
    const minVideos = courseId === 3 ? 5 : expectedWeeks;
    if (expectsVideos && publishedVideos.length < minVideos) {
      status = status === "✅" ? "⚠️" : status;
      courseIssues.push(`published week videos ${publishedVideos.length}/${expectedWeeks}`);
    }

    // Progression config reading strategy vs client IDs
    if (config?.reading?.type === "explicitWeekSets") {
      const sets = config.reading.weekSets;
      for (let i = 0; i < sets.length; i++) {
        const clientIds = readingMap[i + 1] ?? [];
        if (JSON.stringify(sets[i]) !== JSON.stringify(clientIds)) {
          status = "❌";
          courseIssues.push(`week ${i + 1} reading IDs mismatch config vs client`);
        }
      }
    }

    console.log(`\n${status} Course ${courseId}: ${name}`);
    console.log(`   Weeks: ${expectedWeeks} | Quizzes: ${weeklyQuizzes.length} weekly + ${finalQuizzes.length} final`);
    console.log(`   Passing: ${configQuizzes.every((q) => q.passingScore === (q.id === 221 ? 100 : 70)) ? "all correct" : "ISSUES"}`);
    console.log(`   Readings: ${readingWeeks} weeks (${readingsPerWeek.join("+")} ids/week)`);
    console.log(`   Videos: ${publishedVideos.length} published with week titles`);
    console.log(`   Progression: week N unlocks after week N-1 content (video+reading); quiz after week content`);

    if (courseIssues.length) {
      console.log(`   Issues: ${courseIssues.join("; ")}`);
      for (const msg of courseIssues) {
        issues.push({ severity: status === "❌" ? "error" : "warn", courseId, message: msg });
      }
    }

    // List quiz details
    for (const q of configQuizzes.sort((a, b) => (extractWeek(a.title) ?? 0) - (extractWeek(b.title) ?? 0))) {
      const qCount = allQuestions.filter((qq) => qq.quizId === q.id).length;
      const week = extractWeek(q.title);
      const pass = q.id === 221 ? 100 : 70;
      const passOk = q.passingScore === pass ? "✓" : "✗";
      const research = researchByQuiz.has(q.id) ? " [RESEARCH]" : "";
      console.log(`      • ${q.title}: ${qCount} q, ${q.timeLimit ?? "?"}min, ${q.passingScore}% pass ${passOk}${research}`);
    }
  }

  // Family Night (standalone quiz, not in course hub)
  const fnQuiz = allQuizzes.find((q) => q.id === 220);
  console.log("\n" + "─".repeat(80));
  console.log("FAMILY NIGHT (standalone mini-course)");
  if (fnQuiz) {
    const passOk = fnQuiz.passingScore === DEFAULT_PASSING_SCORE;
    const qCount = allQuestions.filter((q) => q.quizId === 220).length;
    console.log(`   ${passOk ? "✅" : "❌"} Quiz 220: ${fnQuiz.title}, ${qCount} questions, ${fnQuiz.passingScore}% pass`);
    if (!passOk) issues.push({ severity: "error", courseId: 0, message: "Family Night quiz passing score wrong" });
  } else {
    console.log("   ❌ Quiz 220 not found");
    issues.push({ severity: "error", courseId: 0, message: "Family Night quiz 220 missing" });
  }

  // Summary
  console.log("\n" + "═".repeat(80));
  console.log("SUMMARY");
  console.log("═".repeat(80));
  const errors = issues.filter((i) => i.severity === "error");
  const warns = issues.filter((i) => i.severity === "warn");
  if (errors.length === 0 && warns.length === 0) {
    console.log("✅ No issues found — all courses structurally sound.");
  } else {
    console.log(`❌ ${errors.length} error(s), ⚠️ ${warns.length} warning(s)`);
  }

  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
