#!/usr/bin/env node
/**
 * Restore joepastorrockys (Joseph Mitchell) + Studying for Service week 1–2 grades.
 */
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { db } from "../server/db";
import {
  users,
  enrollments,
  quizAttempts,
  contentProgress,
  courseVideos,
} from "../shared/schema";
import { STUDYING_FOR_SERVICE_WEEK_READING_IDS } from "../shared/course-reading-ids";

const USER = {
  username: "joepastorrockys",
  email: "josephrussian2005@gmail.com",
  firstName: "Joseph",
  lastName: "Mitchell",
  phone: "(857)266-0488",
  sfgmChurch: "SFGM Boston",
  role: "student" as const,
};

const TEMP_PASSWORD = "SfgmBoston123";
const STUDYING_FOR_SERVICE_COURSE_ID = 5;

const QUIZ_GRADES = [
  { quizId: 59, label: "Studying for Service — Week 1 Quiz", scorePercent: 60 },
  { quizId: 60, label: "Studying for Service — Week 2 Quiz", scorePercent: 90 },
];

function extractWeekNumber(title: string): number | null {
  const match = title.match(/Week\s+(\d+)/i);
  return match ? Number(match[1]) : null;
}

async function ensureUser() {
  const [byEmail] = await db.select().from(users).where(eq(users.email, USER.email.toLowerCase()));
  const [byUsername] = await db
    .select()
    .from(users)
    .where(eq(users.username, USER.username.toLowerCase()));

  if (byEmail && byUsername && byEmail.id !== byUsername.id) {
    throw new Error(
      `Email and username belong to different accounts (${byEmail.id} vs ${byUsername.id})`,
    );
  }

  if (byEmail || byUsername) {
    return byEmail || byUsername!;
  }

  const hashedPassword = await bcrypt.hash(TEMP_PASSWORD, 10);
  const id = `user_${randomUUID()}`;

  const [created] = await db
    .insert(users)
    .values({
      id,
      email: USER.email.toLowerCase(),
      username: USER.username.toLowerCase(),
      password: hashedPassword,
      firstName: USER.firstName,
      lastName: USER.lastName,
      phone: USER.phone,
      role: USER.role,
      sfgmChurch: USER.sfgmChurch,
      emailVerified: true,
      registrationMethod: "email",
      profileCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  console.log(`✅ Created account (temp password: ${TEMP_PASSWORD})`);
  return created;
}

async function ensureEnrollment(studentId: string) {
  const [existing] = await db
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.studentId, studentId),
        eq(enrollments.courseId, STUDYING_FOR_SERVICE_COURSE_ID),
      ),
    )
    .limit(1);

  if (existing) {
    console.log(`ℹ️  Already enrolled in Studying for Service (${existing.id})`);
    return existing;
  }

  const [created] = await db
    .insert(enrollments)
    .values({
      studentId,
      courseId: STUDYING_FOR_SERVICE_COURSE_ID,
      status: "active",
      enrolledAt: new Date(),
    })
    .returning();

  console.log(`✅ Enrolled in Studying for Service (enrollment ${created.id})`);
  return created;
}

async function ensureQuizGrade(studentId: string, quizId: number, scorePercent: number, label: string) {
  const existing = await db
    .select()
    .from(quizAttempts)
    .where(and(eq(quizAttempts.studentId, studentId), eq(quizAttempts.quizId, quizId)));

  if (existing.length > 0) {
    const best = existing.reduce((a, b) =>
      parseFloat(String(a.score ?? 0)) >= parseFloat(String(b.score ?? 0)) ? a : b,
    );
    const targetScore = (scorePercent / 100).toFixed(2);
    const currentPercent = parseFloat(String(best.score ?? 0)) * 100;

    if (Math.abs(currentPercent - scorePercent) > 0.01) {
      await db
        .update(quizAttempts)
        .set({ score: targetScore, updatedAt: new Date() })
        .where(eq(quizAttempts.id, best.id));
      console.log(`✅ ${label}: updated ${currentPercent.toFixed(0)}% → ${scorePercent}%`);
      return { ...best, score: targetScore };
    }

    console.log(`ℹ️  ${label}: already has attempt (${currentPercent.toFixed(0)}%)`);
    return best;
  }

  const score = (scorePercent / 100).toFixed(2);
  const now = new Date();

  const [created] = await db
    .insert(quizAttempts)
    .values({
      studentId,
      quizId,
      answers: { restored: true, note: "Manually restored after accidental account deletion" },
      score,
      startedAt: now,
      completedAt: now,
      submittedAt: now,
      timeSpent: 10,
      essayGraded: false,
      certificateApproved: false,
      updatedAt: now,
    })
    .returning();

  console.log(`✅ ${label}: restored at ${scorePercent}%`);
  return created;
}

async function ensureReadingProgress(studentId: string, readingId: number) {
  const [existing] = await db
    .select()
    .from(contentProgress)
    .where(
      and(
        eq(contentProgress.studentId, studentId),
        eq(contentProgress.courseId, STUDYING_FOR_SERVICE_COURSE_ID),
        eq(contentProgress.contentType, "reading"),
        eq(contentProgress.contentId, readingId),
      ),
    )
    .limit(1);

  if (existing?.completed) return;

  if (existing) {
    await db
      .update(contentProgress)
      .set({ completed: true, completedAt: new Date() })
      .where(eq(contentProgress.id, existing.id));
    return;
  }

  await db.insert(contentProgress).values({
    studentId,
    courseId: STUDYING_FOR_SERVICE_COURSE_ID,
    contentType: "reading",
    contentId: readingId,
    completed: true,
    completedAt: new Date(),
    createdAt: new Date(),
  });
}

async function ensureVideoProgress(studentId: string, videoId: number) {
  const [existing] = await db
    .select()
    .from(contentProgress)
    .where(
      and(
        eq(contentProgress.studentId, studentId),
        eq(contentProgress.courseId, STUDYING_FOR_SERVICE_COURSE_ID),
        eq(contentProgress.contentType, "video"),
        eq(contentProgress.contentId, videoId),
      ),
    )
    .limit(1);

  if (existing?.completed) return;

  if (existing) {
    await db
      .update(contentProgress)
      .set({ completed: true, completedAt: new Date() })
      .where(eq(contentProgress.id, existing.id));
    return;
  }

  await db.insert(contentProgress).values({
    studentId,
    courseId: STUDYING_FOR_SERVICE_COURSE_ID,
    contentType: "video",
    contentId: videoId,
    completed: true,
    completedAt: new Date(),
    createdAt: new Date(),
  });
}

async function restoreWeekContent(studentId: string, weekNumbers: number[]) {
  for (const week of weekNumbers) {
    const readingIds = STUDYING_FOR_SERVICE_WEEK_READING_IDS[week] ?? [];
    for (const readingId of readingIds) {
      await ensureReadingProgress(studentId, readingId);
    }
  }

  const videos = await db
    .select()
    .from(courseVideos)
    .where(
      and(
        eq(courseVideos.courseId, STUDYING_FOR_SERVICE_COURSE_ID),
        eq(courseVideos.isPublished, true),
        eq(courseVideos.isDeleted, false),
      ),
    );

  for (const week of weekNumbers) {
    const weekVideos = videos.filter((v) => extractWeekNumber(v.title) === week);
    for (const video of weekVideos) {
      await ensureVideoProgress(studentId, video.id);
    }
    console.log(`✅ Week ${week} readings + ${weekVideos.length} video(s) marked complete`);
  }
}

async function main() {
  console.log("Restoring Joseph Mitchell (joepastorrockys)...\n");

  const user = await ensureUser();
  console.log(`   User ID: ${user.id}`);
  console.log(`   Username: ${user.username}`);
  console.log(`   Email: ${user.email}\n`);

  await ensureEnrollment(user.id);

  for (const grade of QUIZ_GRADES) {
    await ensureQuizGrade(user.id, grade.quizId, grade.scorePercent, grade.label);
  }

  await restoreWeekContent(user.id, [1, 2]);

  console.log("\nDone. Joseph should see:");
  console.log("   • Studying for Service Week 1 quiz: 60%");
  console.log("   • Studying for Service Week 2 quiz: 90%");
  console.log("   • Week 3 unlocked (weeks 1–2 content marked complete)");
  if (!user.password) {
    console.log(`\n   Login password: ${TEMP_PASSWORD}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Failed:", err);
    process.exit(1);
  });
