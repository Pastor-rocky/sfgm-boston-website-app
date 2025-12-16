#!/usr/bin/env node

/**
 * Check and clean up any remaining Course 3 quiz attempts
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

async function checkAndCleanCourse3Attempts() {
  try {
    console.log('🔍 Checking for Course 3 quiz attempts...\n');
    console.log('='.repeat(80));

    // Course 3 quiz IDs: [26, 46, 37, 38, 39, 40, 41, 42, 43, 44, 45, 47]
    const jonahQuizIds = [26, 46, 37, 38, 39, 40, 41, 42, 43, 44, 45, 47];

    // Get all quiz attempts for these quiz IDs
    const allAttempts = await db
      .select()
      .from(quizAttempts)
      .where(inArray(quizAttempts.quizId, jonahQuizIds));

    console.log(`Found ${allAttempts.length} total quiz attempts for Course 3 quizzes\n`);

    if (allAttempts.length > 0) {
      // Group by student
      const attemptsByStudent = new Map<string, any[]>();
      allAttempts.forEach(attempt => {
        const studentId = attempt.studentId || 'unknown';
        if (!attemptsByStudent.has(studentId)) {
          attemptsByStudent.set(studentId, []);
        }
        attemptsByStudent.get(studentId)!.push(attempt);
      });

      console.log(`Found attempts for ${attemptsByStudent.size} student(s):\n`);

      for (const [studentId, attempts] of attemptsByStudent.entries()) {
        console.log(`Student: ${studentId}`);
        console.log(`  Attempts: ${attempts.length}`);
        attempts.forEach(attempt => {
          console.log(`    - Quiz ID: ${attempt.quizId}, Score: ${attempt.score}, Completed: ${attempt.completedAt ? 'Yes' : 'No'}`);
        });
        console.log('');
      }

      // Ask if user wants to delete (for now, just show what would be deleted)
      console.log('To delete these attempts, unenroll and re-enroll from Course 3.');
      console.log('Or manually delete using the database.\n');
    } else {
      console.log('✅ No Course 3 quiz attempts found in database.\n');
      console.log('If you\'re still seeing quiz attempts in the UI, it\'s likely a cache issue.');
      console.log('Try:');
      console.log('  1. Hard refresh the page (Cmd+Shift+R or Ctrl+Shift+R)');
      console.log('  2. Clear browser cache');
      console.log('  3. Check server logs for unenroll confirmation\n');
    }

  } catch (error) {
    console.error('❌ Error checking Course 3 quiz attempts:', error);
  } finally {
    process.exit(0);
  }
}

checkAndCleanCourse3Attempts().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});




























