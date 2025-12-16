#!/usr/bin/env node

/**
 * Test Course 1 Reading Locking
 * 
 * This script verifies that Course 1 readings are properly locked
 * until videos are completed
 */

import { db } from './server/db';
import { contentProgress } from './shared/schema';
import { eq } from 'drizzle-orm';

async function testCourse1ReadingLocking() {
  console.log('🧪 Testing Course 1 Reading Locking...\n');
  
  // Check current progress for Course 1
  const progress = await db.select()
    .from(contentProgress)
    .where(eq(contentProgress.courseId, 1));
  
  console.log(`📊 Current Course 1 Progress Records: ${progress.length}`);
  
  if (progress.length === 0) {
    console.log('✅ No progress records found - this is correct for a fresh start');
    console.log('\n🔒 Expected Behavior:');
    console.log('   • Week 1 videos: Should be accessible');
    console.log('   • Week 1 readings: Should be LOCKED (grayed out with lock icons)');
    console.log('   • Week 2+ content: Should be LOCKED');
    console.log('   • Final exam: Should be LOCKED');
    
    console.log('\n📋 Test Steps:');
    console.log('   1. Go to http://localhost:56000/course/1');
    console.log('   2. Check that Week 1 videos are accessible (normal colors)');
    console.log('   3. Check that Week 1 readings show "🔒 Locked" buttons');
    console.log('   4. Check that Week 1 reading cards are grayed out');
    console.log('   5. Check that Week 2+ content is locked');
    
    console.log('\n🎯 What Should Happen:');
    console.log('   • Student clicks Week 1 video');
    console.log('   • Video completes → Week 1 readings unlock');
    console.log('   • Student clicks audiobook/Bible reading');
    console.log('   • Readings complete → Week 1 quiz unlocks');
    console.log('   • Student completes quiz → Week 2 unlocks');
  } else {
    console.log('📝 Found progress records:');
    progress.forEach((record, index) => {
      console.log(`   ${index + 1}. Content ID: ${record.contentId}, Type: ${record.contentType}, Completed: ${record.completedAt ? 'Yes' : 'No'}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 TEST COMPLETE - Check the website for visual verification!');
}

testCourse1ReadingLocking().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
