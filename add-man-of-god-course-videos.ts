import { db } from "./server/db";
import { courses, courseVideos } from "./shared/schema";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

const PLAYLIST_ID = "PLXGq3BCCH8NAV3XhXbakIAy-JxZjOYa56";
const COURSE_ID = 16;

const videos = [
  {
    videoId: "hbjwhdbvz_g",
    title: "The Man of God Series - Course Introduction - SFGM Bible School",
  },
  {
    videoId: "VhU5gpbqDOI",
    title: "Chapter One • A Mature Man",
  },
  {
    videoId: "GMrCiq7mP6A",
    title: 'Chapter two."A Business man"',
  },
  {
    videoId: "FyfNF0-aGiM",
    title: "Chapter Three “A leading man.” ",
  },
  {
    videoId: "AY0PoIV9Tu4",
    title: "Chapter Four “A New Man.” ",
  },
  {
    videoId: "xoER2hWDTb0",
    title:
      "Man of God Series - Part 2 (Week 5)  - Don’t mess with God‘s glory. - SFGM Bible School",
  },
  {
    videoId: "ROkJJgJiOgE",
    title:
      "Man of God Series - Part 2 (Week 6) -  Don’t mess with Gods girls - SFGM Bible School",
  },
  {
    videoId: "J7h6y489GmI",
    title:
      "Man Of God Series - Part 2 (Week 7) -  Don't Mess With Gods Gold - SFGM Bible School",
  },
  {
    videoId: "vqTqOlCNkko",
    title:
      "Man Of God Series - Part 2 (Week 8)  Don't Mess With Gods Gifts - SFGM Bible School",
  },
  {
    videoId: "JA3SWVKJ4DI",
    title: "Course Conclusion “A real man.” ",
  },
];

async function addManOfGodCourseVideos() {
  console.log("Setting up SFGM Man of God Course (ID 16)...\n");

  const existingCourse = await db
    .select()
    .from(courses)
    .where(eq(courses.id, COURSE_ID))
    .limit(1);

  if (existingCourse.length === 0) {
    await db.execute(sql`
      INSERT INTO courses (
        id, name, description, duration, is_active, is_updated,
        category, difficulty, points
      ) VALUES (
        ${COURSE_ID},
        ${"SFGM Man of God Course"},
        ${"The Man of God course is an 8-week Bible study designed to challenge, equip, and empower men to walk boldly in their God-given purpose. This course is taught by two pastors from different SFGM locations, each bringing unique insights to help you grow spiritually and practically. Weeks 1–4: Led by Pastor Kevin from SFGM Columbus. Weeks 5–8: Led by Bishop Anthony Lee from SFGM Orlando. Each week focuses on key biblical principles that build your identity, character, and leadership as a man of God. Lessons cover vital topics such as God's glory, honoring relationships, faithful stewardship, and using your spiritual gifts with humility."},
        ${10},
        ${true},
        ${false},
        ${"Character Development"},
        ${"Intermediate"},
        ${300}
      )
    `);

    await db.execute(
      sql`SELECT setval(pg_get_serial_sequence('courses', 'id'), GREATEST((SELECT MAX(id) FROM courses), ${COURSE_ID}))`,
    );

    console.log("Created course 16 in database.");
  } else {
    await db
      .update(courses)
      .set({ duration: 10, isActive: true })
      .where(eq(courses.id, COURSE_ID));
    console.log("Course 16 already exists — updated duration to 10 weeks.");
  }

  const existingVideos = await db
    .select()
    .from(courseVideos)
    .where(
      and(eq(courseVideos.courseId, COURSE_ID), eq(courseVideos.isDeleted, false)),
    );

  if (existingVideos.length > 0) {
    console.log(`Removing ${existingVideos.length} existing Man of God videos...`);
    for (const video of existingVideos) {
      await db.delete(courseVideos).where(eq(courseVideos.id, video.id));
    }
  }

  await db.execute(
    sql`SELECT setval(pg_get_serial_sequence('course_videos', 'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM course_videos), 1))`,
  );

  for (let i = 0; i < videos.length; i++) {
    const week = i + 1;
    const entry = videos[i];
    const videoUrl = `https://www.youtube.com/watch?v=${entry.videoId}&list=${PLAYLIST_ID}&index=${week}`;

    await db.insert(courseVideos).values({
      courseId: COURSE_ID,
      title: `SFGM Man of God - Week ${week}: ${entry.title}`,
      description: entry.title,
      videoUrl,
      duration: null,
      orderIndex: week,
      isRequired: true,
      isPublished: true,
      publishedAt: new Date(),
    });

    console.log(`  Week ${week}: ${entry.title}`);
  }

  console.log(`\nDone — ${videos.length} videos added for course ${COURSE_ID}.`);
  process.exit(0);
}

addManOfGodCourseVideos().catch((error) => {
  console.error("Failed to add Man of God videos:", error);
  process.exit(1);
});
