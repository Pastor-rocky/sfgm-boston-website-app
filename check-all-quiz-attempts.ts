#!/usr/bin/env node

/**
 * Check All Quiz Attempts and Student IDs
 */

import { db } from './server/db';
import { quizAttempts } from './shared/schema';

async function checkAllQuizAttempts() {
  console.log('🔍 Checking All Quiz Attempts...\n');
  
  // Get all quiz attempts (no filter)
  const allAttempts = await db.select()
    .from(quizAttempts);
  
  console.log(`📊 Total Quiz Attempts in Database: ${allAttempts.length}`);
  
  if (allAttempts.length > 0) {
    console.log('\n📝 All Quiz Attempts:');
    allAttempts.forEach((attempt, index) => {
      console.log(`   ${index + 1}. Student ID: "${attempt.studentId}", Quiz ID: ${attempt.quizId}, Score: ${(attempt.score * 100).toFixed(1)}%, Passed: ${attempt.score >= 0.7 ? 'Yes' : 'No'}`);
    });
    
    // Group by student ID
    const studentIds = [...new Set(allAttempts.map(a => a.studentId))];
    console.log(`\n👥 Student IDs found: ${studentIds.map(id => `"${id}"`).join(', ')}`);
    
    // Check for Course 1 Week 1 quiz (ID: 13)
    const week1QuizAttempts = allAttempts.filter(a => a.quizId === 13);
    console.log(`\n📝 Week 1 Quiz (ID: 13) Attempts: ${week1QuizAttempts.length}`);
    
    week1QuizAttempts.forEach((attempt, index) => {
      console.log(`   ${index + 1}. Student ID: "${attempt.studentId}", Score: ${(attempt.score * 100).toFixed(1)}%, Passed: ${attempt.score >= 0.7 ? 'Yes' : 'No'}`);
    });
  } else {
    console.log('❌ No quiz attempts found in database');
    console.log('This suggests the quiz completion is not being saved properly');
  }
  
  console.log('\n🔍 Possible Issues:');
  console.log('1. Quiz completion not being saved to database');
  console.log('2. Different student ID being used');
  console.log('3. Frontend showing cached/stale data');
  console.log('4. Quiz ID mismatch (expected: 13)');
  
  console.log('\n📝 Troubleshooting Steps:');
  console.log('1. Check browser developer tools for any errors');
  console.log('2. Try taking the quiz again');
  console.log('3. Check if quiz completion API is working');
  console.log('4. Verify the correct student ID is being used');
}

checkAllQuizAttempts().catch(error => {
  console.error('❌ Check failed:', error);
  process.exit(1);
});
