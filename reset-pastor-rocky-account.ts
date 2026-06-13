#!/usr/bin/env node
/**
 * Reset Pastor Rocky account and remove duplicate Pastor Rocky / Rocky test users.
 * Keeps: pastor_rocky@sfgmboston.com
 */
import { db } from "./server/db";
import {
  users,
  contentProgress,
  quizAttempts,
  enrollments,
  authTokens,
  essaySubmissions,
} from "./shared/schema";
import { eq, and, ne, or, ilike, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

const KEEP_EMAIL = "pastor_rocky@sfgmboston.com";
const USERNAME = "PastorRocky";
const PASSWORD = "Rocky123";

async function deleteUserData(userId: string) {
  await db.delete(contentProgress).where(eq(contentProgress.studentId, userId));
  await db.delete(quizAttempts).where(eq(quizAttempts.studentId, userId));
  await db.delete(enrollments).where(eq(enrollments.studentId, userId));
  await db.delete(authTokens).where(eq(authTokens.userId, userId));
  await db.delete(essaySubmissions).where(eq(essaySubmissions.studentId, userId));
  await db.delete(users).where(eq(users.id, userId));
}

async function main() {
  const [keepUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, KEEP_EMAIL));

  if (!keepUser) {
    console.error(`❌ No user found with email ${KEEP_EMAIL}`);
    process.exit(1);
  }

  console.log(`✅ Keeping account: ${keepUser.username} (${keepUser.id})`);

  const duplicates = await db
    .select()
    .from(users)
    .where(
      and(
        ne(users.id, keepUser.id),
        or(
          ilike(users.username, "%pastor%rocky%"),
          ilike(users.username, "pastorrocky%"),
          and(ilike(users.firstName, "rocky"), ilike(users.lastName, "kaslov")),
          ilike(users.email, "%pastor_rocky%"),
          eq(users.id, "pastor-rocky"),
        ),
      ),
    );

  for (const dup of duplicates) {
    console.log(`🗑️  Deleting duplicate: ${dup.username} (${dup.email})`);
    await deleteUserData(dup.id);
  }

  const hashedPassword = await bcrypt.hash(PASSWORD, 10);
  await db
    .update(users)
    .set({
      username: USERNAME,
      password: hashedPassword,
      firstName: "Rocky",
      lastName: "Kaslov",
      emailVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, keepUser.id));

  const verify = await bcrypt.compare(PASSWORD, hashedPassword);
  console.log("\n✅ Pastor Rocky account updated");
  console.log(`   Username: ${USERNAME}`);
  console.log(`   Email:    ${KEEP_EMAIL}`);
  console.log(`   Password: ${PASSWORD} (verify hash: ${verify})`);
  console.log(`   Deleted ${duplicates.length} duplicate account(s)`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Failed:", err);
    process.exit(1);
  });
