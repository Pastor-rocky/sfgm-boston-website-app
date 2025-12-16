import { db } from "./server/db.js";
import { courses, quizzes } from "./shared/schema.js";
import { inArray, eq } from "drizzle-orm";

async function checkCoursesWithQuizzes() {
  try {
    console.log("🔍 Checking which courses have quizzes...\n");

    // Course IDs that have quizzes (from course-progress-config.ts and storage.ts)
    const coursesWithQuizzes = {
      0: { name: "G.R.O.W Beginner Course", quizIds: [71, 72, 73, 74, 75] },
      1: { name: "Acts in Action Course", quizIds: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23] },
      2: { name: "Becoming a Fire Starter", quizIds: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58] },
      3: { name: "Don't Be a Jonah", quizIds: [26, 46, 37, 38, 39, 40, 41, 42, 43, 44, 45, 47] },
      4: { name: "G.R.O.W Beginner Course", quizIds: [71, 72, 73, 74, 75] }, // Same as course 0
      5: { name: "Studying for Service", quizIds: [59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70] },
      6: { name: "Deacon Course", quizIds: [76, 77, 78, 79, 80, 82] },
      7: { name: "Level Up Leadership", quizIds: [200, 201, 202, 203, 204, 206] },
      8: { name: "Youth Ministry Course", quizIds: [207, 208, 209, 210, 211, 212] },
    };

    // Get all quiz IDs
    const allQuizIds = new Set<number>();
    Object.values(coursesWithQuizzes).forEach(c => {
      c.quizIds.forEach(id => allQuizIds.add(id));
    });

    // Check which quizzes exist in database
    const existingQuizzes = await db
      .select({ id: quizzes.id })
      .from(quizzes)
      .where(inArray(quizzes.id, Array.from(allQuizIds)));

    const existingQuizIds = new Set(existingQuizzes.map(q => q.id));
    console.log(`📊 Found ${existingQuizzes.length} quizzes in database\n`);

    // Check each course
    console.log("Courses with quizzes:\n");
    const validCourses: Array<{ id: number; name: string; quizCount: number; hasAllQuizzes: boolean }> = [];
    
    for (const [courseIdStr, courseInfo] of Object.entries(coursesWithQuizzes)) {
      const courseId = parseInt(courseIdStr);
      const missingQuizzes = courseInfo.quizIds.filter(id => !existingQuizIds.has(id));
      const hasAllQuizzes = missingQuizzes.length === 0;
      
      validCourses.push({
        id: courseId,
        name: courseInfo.name,
        quizCount: courseInfo.quizIds.length,
        hasAllQuizzes,
      });

      const status = hasAllQuizzes ? "✅" : "⚠️";
      console.log(`${status} Course ${courseId}: ${courseInfo.name}`);
      console.log(`   Quizzes: ${courseInfo.quizIds.length} total, ${courseInfo.quizIds.length - missingQuizzes.length} found`);
      if (missingQuizzes.length > 0) {
        console.log(`   Missing: ${missingQuizzes.join(", ")}`);
      }
      console.log("");
    }

    // Get unique course names (removing duplicates)
    const uniqueCourses = Array.from(new Map(
      validCourses.map(c => [c.name, c])
    ).values());

    console.log(`\n📚 Summary: ${uniqueCourses.length} unique courses with quizzes:`);
    uniqueCourses.forEach(c => {
      console.log(`  - ${c.name} (Course ID: ${c.id})`);
    });

    console.log("\n✅ These are the 8 courses that should be in the database!");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    process.exit(0);
  }
}

checkCoursesWithQuizzes();


