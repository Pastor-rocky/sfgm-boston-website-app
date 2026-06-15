import { db } from "./server/db";
import { courses } from "./shared/schema";
import { eq } from "drizzle-orm";
import { MAN_OF_GOD_DESCRIPTION } from "./shared/man-of-god-course";

const COURSE_ID = 16;

async function main() {
  await db
    .update(courses)
    .set({ description: MAN_OF_GOD_DESCRIPTION, duration: 10 })
    .where(eq(courses.id, COURSE_ID));

  console.log(`✅ Updated course ${COURSE_ID} description (10 weeks)`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
