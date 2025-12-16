import { db } from "./server/db.js";
import { courses } from "./shared/schema.js";

async function populate8Courses() {
  try {
    console.log("📚 Populating ONLY the 8 courses with quizzes...\n");

    // Delete all existing courses first
    await db.delete(courses);
    console.log("🗑️  Cleared all existing courses\n");

    // The 8 courses that have quizzes (matching course-progress-config.ts)
    const coursesToAdd = [
      {
        name: "G.R.O.W Beginner Course",
        description: "Welcome orientation and practice course for new Bible school students. Learn how the platform works while exploring G.R.O.W ministry principles: Give, Read, Obey, Win Souls. This ungraded course introduces you to taking quizzes, watching videos, and reading materials before starting your real academic coursework.",
        duration: 4,
        category: "Foundation",
        difficulty: "Beginner",
        points: 180,
        isActive: true,
      },
      {
        name: "Acts in Action Course",
        description: "This Bible School semester we will be studying the first century church, reading through the book of Acts and paying close attention to what they did, so we can get what they got - signs, wonders, miracles and the empowering of the Holy Spirit to proclaim the Gospel like never before!",
        duration: 10,
        category: "Biblical Studies",
        difficulty: "Intermediate",
        points: 300,
        isActive: true,
      },
      {
        name: "Becoming a Fire Starter",
        description: "If you are tired of burning low and burning out, this is the book for you. Becoming a Fire Starter will instill in your walk of discipleship seven powerful principles that will enable you to not only be filled with the fire of the Holy Spirit, but to remain burning with passion for the Gospel of Jesus Christ and lost people.",
        duration: 10,
        category: "Ministry",
        difficulty: "Intermediate",
        points: 300,
        isActive: true,
      },
      {
        name: "Don't Be a Jonah",
        description: "Bishop Anthony Lee's sixth book is filled with compassion and urgency to encourage all those who are running from the call that God has for their life, so they would submit to the plans God has for them and no longer deal with the unnecessary storms that plague us when we rebel against the will of God.",
        duration: 11,
        category: "Biblical Studies",
        difficulty: "Intermediate",
        points: 320,
        isActive: true,
      },
      {
        name: "Studying for Service",
        description: "Introduction to studying Scripture and understanding the importance of knowing your text thoroughly before preaching. Learn the Five Ws method and staying in context.",
        duration: 12,
        category: "Biblical Studies",
        difficulty: "Intermediate",
        points: 340,
        isActive: true,
      },
      {
        name: "Deacon Course",
        description: "Comprehensive deaconship training course covering biblical principles and practical ministry skills for deacons.",
        duration: 5,
        category: "Ministry",
        difficulty: "Intermediate",
        points: 240,
        isActive: true,
      },
      {
        name: "Level Up Leadership",
        description: "The SFGM Level Up leadership class is an in depth 7 week course that will teach you how to lead better by serving more. This course will be taught by Bishop Anthony Lee as he breaks down each level of leadership with all its biblical principles, application and truths.",
        duration: 7,
        category: "Leadership Development",
        difficulty: "Advanced",
        points: 240,
        isActive: true,
      },
      {
        name: "Youth Ministry Course",
        description: "Comprehensive youth ministry training course designed to equip leaders for effective youth ministry.",
        duration: 5,
        category: "Ministry",
        difficulty: "Intermediate",
        points: 200,
        isActive: true,
      },
    ];

    // Insert courses (will get database IDs 1-8)
    console.log("Adding 8 courses to database...\n");
    const insertedCourses = [];
    for (const course of coursesToAdd) {
      const [inserted] = await db.insert(courses).values(course).returning();
      insertedCourses.push(inserted);
      console.log(`✅ Added: ${inserted.name} (Database ID: ${inserted.id})`);
    }

    console.log(`\n✅ Successfully populated ${insertedCourses.length} courses!`);
    console.log("\n📝 Note: These courses match the quiz mappings:");
    console.log("   - Database ID 1 = G.R.O.W (quizzes 71-75)");
    console.log("   - Database ID 2 = Acts in Action (quizzes 13-23)");
    console.log("   - Database ID 3 = Fire Starter (quizzes 48-58)");
    console.log("   - Database ID 4 = Don't Be a Jonah (quizzes 26, 46, 37-45, 47)");
    console.log("   - Database ID 5 = Studying for Service (quizzes 59-70)");
    console.log("   - Database ID 6 = Deacon Course (quizzes 76-80, 82)");
    console.log("   - Database ID 7 = Level Up Leadership (quizzes 200-204, 206)");
    console.log("   - Database ID 8 = Youth Ministry (quizzes 207-212)");

  } catch (error: any) {
    console.error("❌ Error populating courses:", error.message);
    throw error;
  } finally {
    process.exit(0);
  }
}

populate8Courses();

