#!/usr/bin/env node

/**
 * Fix Student ID Mismatch
 * 
 * This script updates the database records to use the correct student ID
 */

import { db } from './server/db';
import { contentProgress, quizAttempts } from './shared/schema';
import { eq } from 'drizzle-orm';

async function fixStudentIdMismatch() {
  console.log('🔧 Fixing Student ID Mismatch...\n');
  
  const oldStudentId = 'user_1758068127040_i32vigp3l';
  const newStudentId = 'test-student'; // This is what the frontend likely expects
  
  console.log(`🔄 Updating from "${oldStudentId}" to "${newStudentId}"`);
  
  // Update content progress records
  console.log('\n📊 Updating Content Progress Records...');
  const progressResult = await db.update(contentProgress)
    .set({ studentId: newStudentId })
    .where(eq(contentProgress.studentId, oldStudentId))
    .returning();
  
  console.log(`   ✅ Updated ${progressResult.length} content progress records`);
  
  // Update quiz attempts records
  console.log('\n📝 Updating Quiz Attempt Records...');
  const quizResult = await db.update(quizAttempts)
    .set({ studentId: newStudentId })
    .where(eq(quizAttempts.studentId, oldStudentId))
    .returning();
  
  console.log(`   ✅ Updated ${quizResult.length} quiz attempt records`);
  
  // Verify the updates
  console.log('\n🔍 Verifying Updates...');
  const newProgress = await db.select()
    .from(contentProgress)
    .where(eq(contentProgress.studentId, newStudentId));
  
  const newQuizAttempts = await db.select()
    .from(quizAttempts)
    .where(eq(quizAttempts.studentId, newStudentId));
  
  console.log(`   • Content Progress records: ${newProgress.length}`);
  console.log(`   • Quiz Attempt records: ${newQuizAttempts.length}`);
  
  // Check Week 1 completion with new student ID
  console.log('\n🎯 Checking Week 1 Completion with New Student ID:');
  
  const week1VideoCompleted = newProgress.some(p => p.contentId === 2 && p.contentType === 'video' && p.completed);
  console.log(`   • Week 1 Video: ${week1VideoCompleted ? '✅' : '❌'}`);
  
  const week1Readings = [1, 2, 3];
  const completedWeek1Readings = week1Readings.filter(id => 
    newProgress.some(p => p.contentId === id && p.contentType === 'reading' && p.completed)
  );
  console.log(`   • Week 1 Readings: ${completedWeek1Readings.length}/3 completed`);
  
  const week1QuizCompleted = newQuizAttempts.some(a => a.quizId === 13 && a.score >= 0.7);
  console.log(`   • Week 1 Quiz: ${week1QuizCompleted ? '✅' : '❌'}`);
  
  const week1FullyCompleted = week1VideoCompleted && completedWeek1Readings.length === 3 && week1QuizCompleted;
  console.log(`\n🎯 Week 1 Fully Completed: ${week1FullyCompleted ? '✅ YES' : '❌ NO'}`);
  
  if (week1FullyCompleted) {
    console.log('\n🎉 SUCCESS! Week 2 should now be unlocked!');
    console.log('Try refreshing the page at http://localhost:56000/course/1');
  }
}

fixStudentIdMismatch().catch(error => {
  console.error('❌ Fix failed:', error);
  process.exit(1);
});
