import { db } from '../server/db';
import { quizzes, quizQuestions } from '../shared/schema';
import { eq, inArray, and, gt } from 'drizzle-orm';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

async function reduceCourse6Quizzes() {
  console.log('Reducing Course 6 quiz questions...\n');

  // Course 6 quiz IDs: 76, 77, 78, 79, 80 (weekly), 82 (final)
  const weeklyQuizIds = [76, 77, 78, 79, 80];
  const finalExamId = 82;

  // Reduce weekly quizzes to 10 questions each
  console.log('Reducing weekly quizzes to 10 questions each...');
  for (const quizId of weeklyQuizIds) {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));
    if (!quiz) {
      console.log(`  ⚠️  Quiz ${quizId} not found, skipping`);
      continue;
    }

    // Get all questions ordered by orderIndex
    const allQuestions = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quizId))
      .orderBy(quizQuestions.orderIndex);

    console.log(`\n${quiz.title} (ID: ${quizId})`);
    console.log(`  Current questions: ${allQuestions.length}`);

    if (allQuestions.length > 10) {
      // Keep first 10, delete the rest
      const questionsToKeep = allQuestions.slice(0, 10);
      const questionsToDelete = allQuestions.slice(10);

      // Delete questions beyond the first 10
      for (const question of questionsToDelete) {
        await db
          .delete(quizQuestions)
          .where(eq(quizQuestions.id, question.id));
      }

      console.log(`  ✓ Kept ${questionsToKeep.length} questions, deleted ${questionsToDelete.length}`);
    } else {
      console.log(`  ✓ Already has ${allQuestions.length} questions (no change needed)`);
    }
  }

  // Reduce final exam to 25 questions
  console.log('\n\nReducing final exam to 25 questions...');
  const [finalQuiz] = await db.select().from(quizzes).where(eq(quizzes.id, finalExamId));
  if (!finalQuiz) {
    console.log(`  ⚠️  Final exam ${finalExamId} not found`);
  } else {
    const allQuestions = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, finalExamId))
      .orderBy(quizQuestions.orderIndex);

    console.log(`\n${finalQuiz.title} (ID: ${finalExamId})`);
    console.log(`  Current questions: ${allQuestions.length}`);

    if (allQuestions.length > 25) {
      // Keep first 25, delete the rest
      const questionsToKeep = allQuestions.slice(0, 25);
      const questionsToDelete = allQuestions.slice(25);

      // Delete questions beyond the first 25
      for (const question of questionsToDelete) {
        await db
          .delete(quizQuestions)
          .where(eq(quizQuestions.id, question.id));
      }

      console.log(`  ✓ Kept ${questionsToKeep.length} questions, deleted ${questionsToDelete.length}`);
    } else {
      console.log(`  ✓ Already has ${allQuestions.length} questions (no change needed)`);
    }
  }

  // Verify final counts
  console.log('\n\nFinal verification:');
  for (const quizId of [...weeklyQuizIds, finalExamId]) {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));
    if (quiz) {
      const questions = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, quizId));
      
      const expectedCount = quiz.isFinalExam ? 25 : 10;
      const status = questions.length === expectedCount ? '✓' : '⚠️';
      console.log(`  ${status} ${quiz.title}: ${questions.length} questions (expected: ${expectedCount})`);
    }
  }
}

reduceCourse6Quizzes()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });

























