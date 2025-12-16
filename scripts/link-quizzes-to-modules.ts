import { db } from '../server/db';
import { courseModules, quizzes, courses } from '../shared/schema';
import { eq, inArray } from 'drizzle-orm';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Quiz ID mappings by course
const QUIZ_MAPPINGS: Record<number, { quizIds: number[], weekNumbers: number[] }> = {
  1: { 
    quizIds: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], 
    weekNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] // 10 weekly + 1 final (week 11)
  },
  2: { 
    quizIds: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58], 
    weekNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] // 10 weekly + 1 final (week 11)
  },
  3: { 
    quizIds: [26, 46, 37, 38, 39, 40, 41, 42, 43, 44, 45, 47], 
    weekNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] // 11 weekly + 1 final (week 12)
  },
  4: { 
    quizIds: [71, 72, 73, 74, 75], 
    weekNumbers: [1, 2, 3, 4, 5] // 4 weekly + 1 final (week 5)
  },
  5: { 
    quizIds: [59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70], 
    weekNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] // 12 weekly + 1 final (week 12)
  },
  6: { 
    quizIds: [76, 77, 78, 79, 80, 82], 
    weekNumbers: [1, 2, 3, 4, 5, 6] // 5 weekly + 1 final (week 6)
  },
  7: {
    quizIds: [200, 201, 202, 203, 204, 206], // Level Up Leadership: 5 weekly + 1 final
    weekNumbers: [1, 2, 3, 4, 5, 6] // 5 weekly + 1 final (week 6)
  },
  8: {
    quizIds: [], // Need to find these
    weekNumbers: []
  }
};

async function linkQuizzesToModules() {
  console.log('Starting quiz-to-module linking process...\n');

  for (const [courseIdStr, mapping] of Object.entries(QUIZ_MAPPINGS)) {
    const courseId = parseInt(courseIdStr);
    const { quizIds, weekNumbers } = mapping;

    if (quizIds.length === 0) {
      console.log(`Skipping Course ${courseId} - no quiz IDs defined`);
      continue;
    }

    console.log(`\nProcessing Course ${courseId}...`);
    console.log(`  Quiz IDs: ${quizIds.join(', ')}`);
    console.log(`  Week numbers: ${weekNumbers.join(', ')}`);

    // Get course info
    const [course] = await db.select().from(courses).where(eq(courses.id, courseId));
    if (!course) {
      console.log(`  ❌ Course ${courseId} not found, skipping`);
      continue;
    }

    // Get existing quizzes
    const existingQuizzes = await db
      .select()
      .from(quizzes)
      .where(inArray(quizzes.id, quizIds));

    console.log(`  Found ${existingQuizzes.length} quizzes in database`);

    // Process each quiz
    for (let i = 0; i < quizIds.length; i++) {
      const quizId = quizIds[i];
      const weekNumber = weekNumbers[i];
      const quiz = existingQuizzes.find(q => q.id === quizId);

      if (!quiz) {
        console.log(`  ⚠️  Quiz ${quizId} not found, skipping`);
        continue;
      }

      // Check if quiz already has a module
      if (quiz.moduleId) {
        const existingModule = await db
          .select()
          .from(courseModules)
          .where(eq(courseModules.id, quiz.moduleId));
        
        if (existingModule.length > 0) {
          console.log(`  ✓ Quiz ${quizId} already linked to module ${quiz.moduleId}`);
          continue;
        }
      }

      // Check if a module already exists for this course/week
      const existingModules = await db
        .select()
        .from(courseModules)
        .where(
          eq(courseModules.courseId, courseId)
        );

      // Try to find a module with matching week number
      let targetModule = existingModules.find(m => m.weekNumber === weekNumber && m.moduleType === 'quiz');

      // If no matching module, create one
      if (!targetModule) {
        const isFinalExam = quiz.isFinalExam || false;
        const moduleTitle = isFinalExam 
          ? `${course.name} - Final Exam`
          : `${course.name} - Week ${weekNumber} Quiz`;
        
        const [newModule] = await db
          .insert(courseModules)
          .values({
            courseId: courseId,
            title: moduleTitle,
            description: `Quiz module for ${course.name}`,
            orderIndex: weekNumber,
            weekNumber: weekNumber,
            moduleType: 'quiz',
            isRequired: true,
          })
          .returning();
        
        targetModule = newModule;
        console.log(`  ✓ Created module ${targetModule.id} for Week ${weekNumber}`);
      }

      // Link quiz to module
      await db
        .update(quizzes)
        .set({ moduleId: targetModule.id })
        .where(eq(quizzes.id, quizId));

      console.log(`  ✓ Linked quiz ${quizId} (${quiz.title}) to module ${targetModule.id}`);
    }
  }

  console.log('\n✅ Quiz-to-module linking complete!');
  
  // Verify the links
  console.log('\nVerifying links...');
  for (const [courseIdStr, mapping] of Object.entries(QUIZ_MAPPINGS)) {
    const courseId = parseInt(courseIdStr);
    const { quizIds } = mapping;
    
    if (quizIds.length === 0) continue;

    const linkedQuizzes = await db
      .select({ id: quizzes.id, title: quizzes.title, moduleId: quizzes.moduleId })
      .from(quizzes)
      .where(inArray(quizzes.id, quizIds));

    const linkedCount = linkedQuizzes.filter(q => q.moduleId !== null).length;
    console.log(`  Course ${courseId}: ${linkedCount}/${quizIds.length} quizzes linked`);
  }
}

linkQuizzesToModules()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });

