#!/usr/bin/env node

/**
 * Debug Week 2 Locking Issue
 * 
 * This script checks why Week 2 is still locked
 */

import { db } from './server/db';
import { contentProgress, quizAttempts } from './shared/schema';
import { eq } from 'drizzle-orm';

async function debugWeek2Locking() {
  console.log('🔍 Debugging Week 2 Locking Issue...\n');
  
  // Check current progress for Course 1
  const progress = await db.select()
    .from(contentProgress)
    .where(eq(contentProgress.courseId, 1));
  
  console.log(`📊 Current Course 1 Progress Records: ${progress.length}`);
  
  progress.forEach((record, index) => {
    console.log(`   ${index + 1}. Content ID: ${record.contentId}, Type: ${record.contentType}, Completed: ${record.completedAt ? 'Yes' : 'No'}`);
  });
  
  // Check quiz attempts for Course 1
  const quizAttemptsData = await db.select()
    .from(quizAttempts)
    .where(eq(quizAttempts.studentId, 'test-student'));
  
  console.log(`\n📝 Quiz Attempts: ${quizAttemptsData.length}`);
  
  quizAttemptsData.forEach((attempt, index) => {
    console.log(`   ${index + 1}. Quiz ID: ${attempt.quizId}, Score: ${attempt.score}, Passed: ${attempt.score >= 0.7 ? 'Yes' : 'No'}`);
  });
  
  // Analyze Week 1 completion requirements
  console.log('\n🔍 Week 1 Completion Analysis:');
  
  // Check video completion
  const week1VideoCompleted = progress.some(p => p.contentId === 2 && p.contentType === 'video' && p.completed);
  console.log(`   • Week 1 Video (ID: 2): ${week1VideoCompleted ? '✅ Completed' : '❌ Not completed'}`);
  
  // Check reading completion
  const week1Readings = [1, 2, 3]; // Introduction, Chapter 1, Bible
  const completedWeek1Readings = week1Readings.filter(id => 
    progress.some(p => p.contentId === id && p.contentType === 'reading' && p.completed)
  );
  console.log(`   • Week 1 Readings: ${completedWeek1Readings.length}/3 completed`);
  
  // Check quiz completion
  const week1QuizAttempt = quizAttemptsData.find(attempt => attempt.quizId === 13); // Week 1 quiz ID
  const week1QuizCompleted = week1QuizAttempt && week1QuizAttempt.score >= 0.7;
  console.log(`   • Week 1 Quiz (ID: 13): ${week1QuizCompleted ? '✅ Completed' : '❌ Not completed'}`);
  
  // Determine if Week 1 is fully completed
  const week1FullyCompleted = week1VideoCompleted && completedWeek1Readings.length === 3 && week1QuizCompleted;
  console.log(`\n🎯 Week 1 Fully Completed: ${week1FullyCompleted ? '✅ YES' : '❌ NO'}`);
  
  if (!week1FullyCompleted) {
    console.log('\n📋 Missing Requirements:');
    if (!week1VideoCompleted) console.log('   • Complete Week 1 video');
    if (completedWeek1Readings.length < 3) console.log('   • Complete all Week 1 readings');
    if (!week1QuizCompleted) console.log('   • Complete Week 1 quiz with passing score');
  } else {
    console.log('\n✅ Week 1 is fully completed - Week 2 should be unlocked!');
    console.log('If Week 2 is still locked, there might be a frontend caching issue.');
    console.log('Try refreshing the page or clearing browser cache.');
  }
  
  console.log('\n📝 Expected Week 1 Quiz ID: 13 (acts-week-1)');
  console.log('📝 Check if quiz exists and is accessible');
}

debugWeek2Locking().catch(error => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});
