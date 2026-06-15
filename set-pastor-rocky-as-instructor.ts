#!/usr/bin/env node
/**
 * Set PastorRocky as instructor with known login credentials.
 * Run: node --env-file=.env node_modules/.bin/tsx set-pastor-rocky-as-instructor.ts
 */
import { db } from "./server/db";
import { users } from "./shared/schema";
import { eq, or, ilike } from "drizzle-orm";
import bcrypt from "bcryptjs";

const USERNAME = "PastorRocky";
const PASSWORD = "Rocky123";
const EMAIL = "pastor_rocky@sfgmboston.com";

async function main() {
  console.log("Setting PastorRocky as instructor...\n");

  const [existing] = await db
    .select()
    .from(users)
    .where(
      or(
        eq(users.email, EMAIL),
        ilike(users.username, "pastorrocky"),
        eq(users.id, "pastor-rocky"),
      ),
    )
    .limit(1);

  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  if (!existing) {
    const id = "pastor-rocky";
    await db.insert(users).values({
      id,
      email: EMAIL,
      username: USERNAME,
      password: hashedPassword,
      firstName: "Rocky",
      lastName: "Kaslov",
      role: "instructor",
      emailVerified: true,
      sfgmChurch: "SFGM Boston",
      gender: "Male",
    } as any);
    console.log("Created new instructor account.");
    console.log(`   Username: ${USERNAME}`);
    console.log(`   Password: ${PASSWORD}`);
    console.log(`   Email:    ${EMAIL}`);
    console.log(`   Role:     instructor`);
    return;
  }

  await db
    .update(users)
    .set({
      username: USERNAME,
      password: hashedPassword,
      role: "instructor",
      email: EMAIL,
      firstName: existing.firstName || "Rocky",
      lastName: existing.lastName || "Kaslov",
      emailVerified: true,
      updatedAt: new Date(),
    } as any)
    .where(eq(users.id, existing.id));

  const verified = await bcrypt.compare(PASSWORD, hashedPassword);
  console.log("PastorRocky updated.");
  console.log(`   ID:       ${existing.id}`);
  console.log(`   Username: ${USERNAME}`);
  console.log(`   Password: ${PASSWORD}`);
  console.log(`   Email:    ${EMAIL}`);
  console.log(`   Role:     instructor`);
  console.log(`   Hash OK:  ${verified}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });
