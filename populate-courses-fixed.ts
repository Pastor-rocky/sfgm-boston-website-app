import { db } from "./server/db.js";
import { courses } from "./shared/schema.js";

async function populateCourses() {
  try {
    console.log("📚 Populating courses in database with correct IDs...\n");

    // Delete existing courses first
    await db.delete(courses);
    console.log("🗑️  Cleared existing courses\n");

    // Courses matching the hardcoded IDs in bible-school.tsx
    // Note: Database uses auto-increment, so we need to insert in order
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
        name: "Acts in Action Course",
        description: "This Bible School semester we will be studying the first century church, reading through the book of Acts and paying close attention to what they did, so we can get what they got - signs, wonders, miracles and the empowering of the Holy Spirit to proclaim the Gospel like never before!",
        duration: 10,
        category: "Biblical Studies",
        difficulty: "Intermediate",
        points: 300,
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
        name: "Power of Preaching",
        description: "Master the art of biblical preaching with insights from Dr. Tony Evans and practical sermon preparation techniques.",
        duration: 5,
        category: "Ministry",
        difficulty: "Advanced",
        points: 200,
        isActive: true,
      },
      {
        name: "Introduction to Prophecy",
        description: "A comprehensive introduction to biblical prophecy and end times events. Students will explore prophetic literature, understand different eschatological viewpoints, and learn to interpret apocalyptic texts with sound hermeneutical principles.",
        duration: 5,
        category: "Prophecy",
        difficulty: "Intermediate",
        points: 200,
        isActive: true,
      },
      {
        name: "The Watchmen Project",
        description: "An in-depth study of biblical prophecy, covering detailed analysis of prophetic texts, chronological frameworks, and contemporary relevance of biblical prophecy. Students will examine complex prophetic passages and their fulfillment patterns.",
        duration: 10,
        category: "Prophecy",
        difficulty: "Advanced",
        points: 300,
        isActive: true,
      },
      {
        name: "Theology 101",
        description: "Welcome to our 10-week theology semester! Within this course we'll dive into various aspects of theology, each teaching will explore multiple topics and subjects, which will bring us to the conclusions of Why we believe What we believe, as outlined by the Word of God.",
        duration: 10,
        category: "Theology",
        difficulty: "Beginner",
        points: 300,
        isActive: true,
      },
    ];

    // Insert courses (will get IDs 1-10)
    console.log("Adding courses to database...\n");
    const insertedCourses = [];
    for (const course of coursesToAdd) {
      const [inserted] = await db.insert(courses).values(course).returning();
      insertedCourses.push(inserted);
      console.log(`✅ Added: ${inserted.name} (Database ID: ${inserted.id})`);
    }

    console.log(`\n✅ Successfully populated ${insertedCourses.length} courses!`);
    console.log("\n📝 Note: Database IDs start at 1, but hardcoded courses in bible-school.tsx start at 0.");
    console.log("   The bible-school page uses hardcoded courses, so this is OK.");
    console.log("   Other pages that fetch from /api/courses will use database IDs.");

  } catch (error: any) {
    console.error("❌ Error populating courses:", error.message);
    throw error;
  } finally {
    process.exit(0);
  }
}

populateCourses();


