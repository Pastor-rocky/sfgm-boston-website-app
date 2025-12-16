#!/usr/bin/env node

/**
 * Verify Week 2 Unlocking After Quiz Completion
 */

import { db } from './server/db';
import { contentProgress, quizAttempts } from './shared/schema';
import { eq } from 'drizzle-orm';

async function verifyWeek2Unlock() {
  console.log('🔍 Verifying Week 2 Unlocking After Quiz Completion...\n');
  
  // Check current progress for Course 1
  const progress = await db.select()
    .from(contentProgress)
    .where(eq(contentProgress.courseId, 1));
  
  console.log(`📊 Current Course 1 Progress Records: ${progress.length}`);
  
  progress.forEach((record, index) => {
    console.log(`   ${index + 1}. Content ID: ${record.contentId}, Type: ${record.contentType}, Completed: ${record.completedAt ? 'Yes' : 'No'}`);
  });
  
  // Check quiz attempts
  const quizAttemptsData = await db.select()
    .from(quizAttempts)
    .where(eq(quizAttempts.studentId, 'test-student'));
  
  console.log(`\n📝 Quiz Attempts: ${quizAttemptsData.length}`);
  
  quizAttemptsData.forEach((attempt, index) => {
    console.log(`   ${index + 1}. Quiz ID: ${attempt.quizId}, Score: ${(attempt.score * 100).toFixed(1)}%, Passed: ${attempt.score >= 0.7 ? 'Yes' : 'No'}`);
  });
  
  // Analyze Week 1 completion
  console.log('\n🔍 Week 1 Completion Analysis:');
  
  const week1VideoCompleted = progress.some(p => p.contentId === 2 && p.contentType === 'video' && p.completed);
  console.log(`   • Week 1 Video: ${week1VideoCompleted ? '✅ Completed' : '❌ Not completed'}`);
  
  const week1Readings = [1, 2, 3];
  const completedWeek1Readings = week1Readings.filter(id => 
    progress.some(p => p.contentId === id && p.contentType === 'reading' && p.completed)
  );
  console.log(`   • Week 1 Readings: ${completedWeek1Readings.length}/3 completed`);
  
  const week1QuizAttempt = quizAttemptsData.find(attempt => attempt.quizId === 13);
  const week1QuizCompleted = week1QuizAttempt && week1QuizAttempt.score >= 0.7;
  console.log(`   • Week 1 Quiz: ${week1QuizCompleted ? '✅ Completed' : '❌ Not completed'}`);
  
  const week1FullyCompleted = week1VideoCompleted && completedWeek1Readings.length === 3 && week1QuizCompleted;
  console.log(`\n🎯 Week 1 Fully Completed: ${week1FullyCompleted ? '✅ YES' : '❌ NO'}`);
  
  if (week1FullyCompleted) {
    console.log('\n🎉 SUCCESS! Week 1 is fully completed!');
    console.log('✅ Week 2 should now be unlocked');
    console.log('✅ Week 2 videos should be accessible');
    console.log('✅ Week 2 readings should be accessible');
    console.log('✅ Week 2 quiz should be accessible');
    
    console.log('\n📝 Next Steps:');
    console.log('1. Refresh the page at http://localhost:56000/course/1');
    console.log('2. Verify Week 2 videos are no longer grayed out');
    console.log('3. Verify Week 2 readings are accessible');
    console.log('4. Complete Week 2 content to unlock Week 3');
  } else {
    console.log('\n❌ Week 1 is not fully completed yet');
    console.log('Check the missing requirements above');
  }
}

verifyWeek2Unlock().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
