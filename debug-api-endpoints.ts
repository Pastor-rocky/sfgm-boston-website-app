#!/usr/bin/env node

/**
 * Debug API Endpoints for Course 1
 */

import { db } from './server/db';
import { contentProgress, quizAttempts } from './shared/schema';
import { eq } from 'drizzle-orm';

async function debugAPIEndpoints() {
  console.log('🔍 Debugging API Endpoints for Course 1...\n');
  
  const courseId = 1;
  const studentId = 'user_1758068127040_i32vigp3l';
  
  console.log(`📚 Course ID: ${courseId}`);
  console.log(`👤 Student ID: "${studentId}"`);
  
  // Check what the content-progress API should return
  console.log('\n📊 Content Progress API Response:');
  const progress = await db.select()
    .from(contentProgress)
    .where(eq(contentProgress.courseId, courseId));
  
  console.log(`   Total records: ${progress.length}`);
  progress.forEach((record, index) => {
    console.log(`   ${index + 1}. ID: ${record.contentId}, Type: ${record.contentType}, Completed: ${record.completed}, Student: "${record.studentId}"`);
  });
  
  // Check what the quiz-attempts API should return
  console.log('\n📝 Quiz Attempts API Response:');
  const attempts = await db.select()
    .from(quizAttempts);
  
  console.log(`   Total records: ${attempts.length}`);
  attempts.forEach((attempt, index) => {
    console.log(`   ${index + 1}. Quiz ID: ${attempt.quizId}, Student: "${attempt.studentId}", Score: ${(attempt.score * 100).toFixed(1)}%`);
  });
  
  // Simulate the frontend logic with actual data
  console.log('\n🧪 Simulating Frontend Logic with Real Data:');
  
  // Check Week 1 video (Content ID: 2)
  const week1VideoCompleted = progress.some(p => 
    p.contentId === 2 && p.contentType === 'video' && p.completed && p.studentId === studentId
  );
  console.log(`   • Week 1 Video (ID: 2): ${week1VideoCompleted ? '✅' : '❌'}`);
  
  // Check Week 1 readings (Content IDs: 1, 2, 3)
  const week1Readings = [1, 2, 3];
  const completedWeek1Readings = week1Readings.filter(id => 
    progress.some(p => p.contentId === id && p.contentType === 'reading' && p.completed && p.studentId === studentId)
  );
  console.log(`   • Week 1 Readings: ${completedWeek1Readings.length}/3 completed`);
  
  // Check Week 1 quiz (Quiz ID: 13)
  const week1QuizAttempt = attempts.find(a => a.quizId === 13 && a.studentId === studentId);
  const week1QuizCompleted = week1QuizAttempt && week1QuizAttempt.score >= 0.7;
  console.log(`   • Week 1 Quiz (ID: 13): ${week1QuizCompleted ? '✅' : '❌'}`);
  
  const week1FullyCompleted = week1VideoCompleted && completedWeek1Readings.length === 3 && week1QuizCompleted;
  console.log(`\n🎯 Week 1 Fully Completed: ${week1FullyCompleted ? '✅ YES' : '❌ NO'}`);
  
  if (!week1FullyCompleted) {
    console.log('\n❌ Missing Requirements:');
    if (!week1VideoCompleted) console.log('   • Week 1 video not completed');
    if (completedWeek1Readings.length < 3) console.log('   • Week 1 readings incomplete');
    if (!week1QuizCompleted) console.log('   • Week 1 quiz not completed');
  } else {
    console.log('\n✅ Week 1 is fully completed - Week 2 should be unlocked!');
    console.log('\n🔧 Possible Frontend Issues:');
    console.log('1. API not returning correct student data');
    console.log('2. Frontend using different student ID');
    console.log('3. React Query caching stale data');
    console.log('4. isWeekFullyCompleted function logic error');
  }
}

debugAPIEndpoints().catch(error => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});
