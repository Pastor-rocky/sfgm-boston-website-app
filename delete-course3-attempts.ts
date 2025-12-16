#!/usr/bin/env node

/**
 * Manually delete Course 3 quiz attempts for a specific student
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { db } from './server/db';
import { quizAttempts } from './shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

async function deleteCourse3Attempts() {
  try {
    console.log('🗑️  Deleting Course 3 quiz attempts...\n');
    console.log('='.repeat(80));

    const studentId = 'pastor-rocky'; // Change this if needed
    const jonahQuizIds = [26, 46, 37, 38, 39, 40, 41, 42, 43, 44, 45, 47];

    // Check how many attempts exist before deletion
    const attemptsBefore = await db
      .select()
      .from(quizAttempts)
      .where(and(
        eq(quizAttempts.studentId, studentId),
        inArray(quizAttempts.quizId, jonahQuizIds)
      ));

    console.log(`Found ${attemptsBefore.length} quiz attempts to delete for student ${studentId}`);
    if (attemptsBefore.length > 0) {
      attemptsBefore.forEach(attempt => {
        console.log(`  - Quiz ID: ${attempt.quizId}, Score: ${attempt.score}, Completed: ${attempt.completedAt ? 'Yes' : 'No'}`);
      });
    }

    // Delete the attempts
    await db
      .delete(quizAttempts)
      .where(and(
        eq(quizAttempts.studentId, studentId),
        inArray(quizAttempts.quizId, jonahQuizIds)
      ));

    // Verify deletion
    const attemptsAfter = await db
      .select()
      .from(quizAttempts)
      .where(and(
        eq(quizAttempts.studentId, studentId),
        inArray(quizAttempts.quizId, jonahQuizIds)
      ));

    if (attemptsAfter.length === 0) {
      console.log(`\n✅ Successfully deleted ${attemptsBefore.length} quiz attempt(s)`);
      console.log('✅ Verified: No Course 3 quiz attempts remain in database');
    } else {
      console.log(`\n⚠️  WARNING: ${attemptsAfter.length} quiz attempt(s) still exist after deletion!`);
    }

  } catch (error) {
    console.error('❌ Error deleting Course 3 quiz attempts:', error);
  } finally {
    process.exit(0);
  }
}

deleteCourse3Attempts().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});




























