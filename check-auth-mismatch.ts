#!/usr/bin/env node

/**
 * Check Authentication and Student ID Mismatch
 */

import { db } from './server/db';
import { contentProgress, quizAttempts } from './shared/schema';
import { eq } from 'drizzle-orm';

async function checkAuthMismatch() {
  console.log('🔍 Checking Authentication and Student ID Mismatch...\n');
  
  // Get all unique student IDs from both tables
  const progressStudentIds = await db.select({ studentId: contentProgress.studentId })
    .from(contentProgress)
    .where(eq(contentProgress.courseId, 1));
  
  const quizStudentIds = await db.select({ studentId: quizAttempts.studentId })
    .from(quizAttempts);
  
  const uniqueProgressIds = [...new Set(progressStudentIds.map(p => p.studentId))];
  const uniqueQuizIds = [...new Set(quizStudentIds.map(q => q.studentId))];
  
  console.log('📊 Student IDs in Content Progress:');
  uniqueProgressIds.forEach((id, index) => {
    console.log(`   ${index + 1}. "${id}"`);
  });
  
  console.log('\n📝 Student IDs in Quiz Attempts:');
  uniqueQuizIds.forEach((id, index) => {
    console.log(`   ${index + 1}. "${id}"`);
  });
  
  // Check if there's a mismatch
  const allIds = [...new Set([...uniqueProgressIds, ...uniqueQuizIds])];
  console.log(`\n👥 All Unique Student IDs: ${allIds.length}`);
  
  if (allIds.length > 1) {
    console.log('\n❌ STUDENT ID MISMATCH DETECTED!');
    console.log('The frontend is likely using a different student ID than what\'s in the database.');
    console.log('\n🔧 Possible Solutions:');
    console.log('1. Check what student ID the frontend is using');
    console.log('2. Update the database records to match the frontend student ID');
    console.log('3. Fix the authentication system to use consistent IDs');
  } else {
    console.log('\n✅ Student IDs are consistent');
  }
  
  // Check the specific student ID we know exists
  const knownStudentId = 'user_1758068127040_i32vigp3l';
  console.log(`\n🎯 Checking known student ID: "${knownStudentId}"`);
  
  const progressForKnownId = await db.select()
    .from(contentProgress)
    .where(eq(contentProgress.studentId, knownStudentId));
  
  const quizForKnownId = await db.select()
    .from(quizAttempts)
    .where(eq(quizAttempts.studentId, knownStudentId));
  
  console.log(`   • Content Progress records: ${progressForKnownId.length}`);
  console.log(`   • Quiz Attempt records: ${quizForKnownId.length}`);
  
  if (progressForKnownId.length > 0 || quizForKnownId.length > 0) {
    console.log(`\n✅ Student ID "${knownStudentId}" has data in database`);
    console.log('The issue is likely that the frontend is using a different student ID.');
  }
}

checkAuthMismatch().catch(error => {
  console.error('❌ Check failed:', error);
  process.exit(1);
});
