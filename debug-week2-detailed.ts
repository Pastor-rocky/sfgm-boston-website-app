#!/usr/bin/env node

/**
 * Debug Week 2 Locking Issue - Detailed Analysis
 */

import { db } from './server/db';
import { contentProgress, quizAttempts } from './shared/schema';
import { eq } from 'drizzle-orm';

async function debugWeek2LockingDetailed() {
  console.log('🔍 Detailed Debug: Week 2 Locking Issue...\n');
  
  // Check all progress for Course 1
  const progress = await db.select()
    .from(contentProgress)
    .where(eq(contentProgress.courseId, 1));
  
  console.log(`📊 Course 1 Progress Records: ${progress.length}`);
  progress.forEach((record, index) => {
    console.log(`   ${index + 1}. ID: ${record.contentId}, Type: ${record.contentType}, Completed: ${record.completedAt ? 'Yes' : 'No'}, Student: ${record.studentId}`);
  });
  
  // Check all quiz attempts
  const allAttempts = await db.select()
    .from(quizAttempts);
  
  console.log(`\n📝 All Quiz Attempts: ${allAttempts.length}`);
  allAttempts.forEach((attempt, index) => {
    console.log(`   ${index + 1}. Quiz ID: ${attempt.quizId}, Student: ${attempt.studentId}, Score: ${(attempt.score * 100).toFixed(1)}%, Passed: ${attempt.score >= 0.7 ? 'Yes' : 'No'}`);
  });
  
  // Find Course 1 Week 1 quiz attempts
  const week1QuizAttempts = allAttempts.filter(a => a.quizId === 13);
  console.log(`\n🎯 Week 1 Quiz (ID: 13) Attempts: ${week1QuizAttempts.length}`);
  
  // Analyze Week 1 completion for each student
  const studentIds = [...new Set([...progress.map(p => p.studentId), ...allAttempts.map(a => a.studentId)])];
  console.log(`\n👥 Student IDs found: ${studentIds.map(id => `"${id}"`).join(', ')}`);
  
  for (const studentId of studentIds) {
    console.log(`\n🔍 Analyzing Student: "${studentId}"`);
    
    const studentProgress = progress.filter(p => p.studentId === studentId);
    const studentQuizAttempts = allAttempts.filter(a => a.studentId === studentId);
    
    // Check Week 1 video (Content ID: 2)
    const week1VideoCompleted = studentProgress.some(p => p.contentId === 2 && p.contentType === 'video' && p.completed);
    console.log(`   • Week 1 Video: ${week1VideoCompleted ? '✅' : '❌'}`);
    
    // Check Week 1 readings (Content IDs: 1, 2, 3)
    const week1Readings = [1, 2, 3];
    const completedWeek1Readings = week1Readings.filter(id => 
      studentProgress.some(p => p.contentId === id && p.contentType === 'reading' && p.completed)
    );
    console.log(`   • Week 1 Readings: ${completedWeek1Readings.length}/3 ${completedWeek1Readings.length === 3 ? '✅' : '❌'}`);
    
    // Check Week 1 quiz (Quiz ID: 13)
    const week1QuizAttempt = studentQuizAttempts.find(a => a.quizId === 13);
    const week1QuizCompleted = week1QuizAttempt && week1QuizAttempt.score >= 0.7;
    console.log(`   • Week 1 Quiz: ${week1QuizCompleted ? '✅' : '❌'}`);
    
    const week1FullyCompleted = week1VideoCompleted && completedWeek1Readings.length === 3 && week1QuizCompleted;
    console.log(`   • Week 1 Fully Completed: ${week1FullyCompleted ? '✅ YES' : '❌ NO'}`);
    
    if (week1FullyCompleted) {
      console.log(`   🎉 Student "${studentId}" has completed Week 1 - Week 2 should be unlocked!`);
    }
  }
  
  console.log('\n🔧 Troubleshooting Steps:');
  console.log('1. Check if the frontend is using the correct student ID');
  console.log('2. Verify the canAccessWeek(2) function logic');
  console.log('3. Check for frontend caching issues');
  console.log('4. Ensure the isWeekFullyCompleted(1) function works correctly');
  
  console.log('\n📝 Expected Behavior:');
  console.log('• Week 1 video completed ✅');
  console.log('• All Week 1 readings completed ✅');
  console.log('• Week 1 quiz passed ✅');
  console.log('• Week 2 should unlock ✅');
}

debugWeek2LockingDetailed().catch(error => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});
