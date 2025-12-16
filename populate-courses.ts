import { db } from "./server/db.js";
import { courses } from "./shared/schema.js";

async function populateCourses() {
  try {
    console.log("📚 Populating courses in database...\n");

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
        name: "Becoming a Fire Starter",
        description: "If you are tired of burning low and burning out, this is the book for you. Becoming a Fire Starter will instill in your walk of discipleship seven powerful principles that will enable you to not only be filled with the fire of the Holy Spirit, but to remain burning with passion for the Gospel of Jesus Christ and lost people.",
        duration: 10,
        category: "Ministry",
        difficulty: "Intermediate",
        points: 300,
        isActive: true,
      },
      {
        name: "Acts In Action Course",
        description: "A comprehensive study of the Book of Acts focusing on how the early church received power and acted on faith. Learn how to receive the same power that transformed the disciples and discover how to put your faith into action for the Kingdom of God.",
        duration: 8,
        category: "Bible Study",
        difficulty: "Intermediate",
        points: 280,
        isActive: true,
      },
      {
        name: "Level Up Leadership",
        description: "Leadership development course focused on growing as a leader in ministry.",
        duration: 6,
        category: "Leadership",
        difficulty: "Intermediate",
        points: 240,
        isActive: true,
      },
      {
        name: "The Power of Preaching",
        description: "Learn the fundamentals of effective preaching and communication.",
        duration: 8,
        category: "Ministry",
        difficulty: "Intermediate",
        points: 280,
        isActive: true,
      },
      {
        name: "Introduction to Prophecy",
        description: "An introduction to understanding biblical prophecy.",
        duration: 6,
        category: "Biblical Studies",
        difficulty: "Advanced",
        points: 240,
        isActive: true,
      },
      {
        name: "The Watchmen Project",
        description: "A comprehensive study on being watchmen in ministry.",
        duration: 8,
        category: "Ministry",
        difficulty: "Intermediate",
        points: 280,
        isActive: true,
      },
    ];

    // Check existing courses
    const existingCourses = await db.select().from(courses);
    console.log(`Found ${existingCourses.length} existing courses\n`);

    if (existingCourses.length > 0) {
      console.log("⚠️  Courses already exist in database!");
      console.log("Existing courses:");
      existingCourses.forEach(c => {
        console.log(`  - ${c.id}: ${c.name}`);
      });
      console.log("\nSkipping population. If you want to add courses, delete existing ones first.");
      return;
    }

    // Insert courses
    console.log("Adding courses to database...\n");
    for (const course of coursesToAdd) {
      const [inserted] = await db.insert(courses).values(course).returning();
      console.log(`✅ Added: ${inserted.name} (ID: ${inserted.id})`);
    }

    console.log(`\n✅ Successfully populated ${coursesToAdd.length} courses!`);

  } catch (error: any) {
    console.error("❌ Error populating courses:", error.message);
    throw error;
  } finally {
    process.exit(0);
  }
}

populateCourses();

