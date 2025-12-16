#!/usr/bin/env node

/**
 * Course Progress Reset Script
 * 
 * This script resets all course progress data including:
 * - Content progress (videos, readings, quizzes)
 * - Quiz attempts
 * - Course enrollments
 * - Any other progress tracking data
 */

import { db } from './server/db';
import { contentProgress, quizAttempts, enrollments } from './shared/schema';
import { eq } from 'drizzle-orm';

class CourseProgressResetter {
  async resetAllProgress(): Promise<void> {
    console.log('🔄 Starting Course Progress Reset...\n');
    
    try {
      // Reset content progress
      console.log('📊 Resetting content progress...');
      const contentProgressResult = await db.delete(contentProgress);
      console.log(`   ✅ Deleted content progress records`);
      
      // Reset quiz attempts
      console.log('📝 Resetting quiz attempts...');
      const quizAttemptsResult = await db.delete(quizAttempts);
      console.log(`   ✅ Deleted quiz attempt records`);
      
      // Reset course enrollments (optional - uncomment if needed)
      // console.log('🎓 Resetting course enrollments...');
      // const enrollmentsResult = await db.delete(enrollments);
      // console.log(`   ✅ Deleted enrollment records`);
      
      console.log('\n🎉 Course Progress Reset Complete!');
      console.log('\n📋 What was reset:');
      console.log('   • All video completion status');
      console.log('   • All reading completion status');
      console.log('   • All quiz completion status');
      console.log('   • All quiz attempt scores');
      console.log('   • All progress tracking data');
      
      console.log('\n🔓 What this means:');
      console.log('   • All courses will show as "not started"');
      console.log('   • Week 1 will be accessible for all courses');
      console.log('   • All other weeks will be locked');
      console.log('   • Students can start fresh with any course');
      
      console.log('\n✅ Ready for testing the new progression system!');
      
    } catch (error) {
      console.error('❌ Error resetting progress:', error);
      throw error;
    }
  }
}

// Run the reset
async function main() {
  const resetter = new CourseProgressResetter();
  await resetter.resetAllProgress();
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Reset failed:', error);
  process.exit(1);
});
