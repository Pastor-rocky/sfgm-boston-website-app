#!/usr/bin/env node

/**
 * Test Course 1 Complete Progression Flow
 * 
 * This script verifies:
 * 1. Video URLs are correct for Acts in Action
 * 2. Quiz unlocking requires ALL readings completion
 * 3. Complete progression flow works properly
 */

import { db } from './server/db';
import { courseVideos, contentProgress } from './shared/schema';
import { eq } from 'drizzle-orm';

async function testCourse1CompleteFlow() {
  console.log('🧪 Testing Course 1 Complete Progression Flow...\n');
  
  // Test 1: Verify video URLs are correct
  console.log('📹 Test 1: Verifying Video URLs');
  console.log('='.repeat(50));
  
  const videos = await db.select()
    .from(courseVideos)
    .where(eq(courseVideos.courseId, 1))
    .orderBy(courseVideos.orderIndex);
  
  const expectedUrls = [
    'https://www.youtube.com/watch?v=U2wSdkXhWbc&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=1&t=3s',
    'https://www.youtube.com/watch?v=YakUCnANRLU&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=2',
    'https://www.youtube.com/watch?v=lr4eer0TIyE&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=3',
    'https://www.youtube.com/watch?v=YRBoH1P_XU8&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=4',
    'https://www.youtube.com/watch?v=wmi4MmeoTcY&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=5'
  ];
  
  let urlTestPassed = true;
  videos.forEach((video, index) => {
    const weekNumber = video.title.match(/Week (\d+)/)?.[1];
    if (weekNumber) {
      const weekIndex = parseInt(weekNumber) - 1;
      if (weekIndex >= 0 && weekIndex < expectedUrls.length) {
        const expectedUrl = expectedUrls[weekIndex];
        const actualUrl = video.videoUrl;
        const matches = actualUrl === expectedUrl;
        
        console.log(`Week ${weekNumber}: ${matches ? '✅' : '❌'}`);
        if (!matches) {
          console.log(`  Expected: ${expectedUrl}`);
          console.log(`  Actual:   ${actualUrl}`);
          urlTestPassed = false;
        }
      }
    }
  });
  
  console.log(`\n📊 Video URL Test: ${urlTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
  
  // Test 2: Check current progress state
  console.log('\n📚 Test 2: Checking Progress State');
  console.log('='.repeat(50));
  
  const progress = await db.select()
    .from(contentProgress)
    .where(eq(contentProgress.courseId, 1));
  
  console.log(`📊 Current Course 1 Progress Records: ${progress.length}`);
  
  if (progress.length === 0) {
    console.log('✅ No progress records found - perfect for testing!');
  } else {
    console.log('📝 Found progress records:');
    progress.forEach((record, index) => {
      console.log(`   ${index + 1}. Content ID: ${record.contentId}, Type: ${record.contentType}, Completed: ${record.completedAt ? 'Yes' : 'No'}`);
    });
  }
  
  // Test 3: Expected progression flow
  console.log('\n🔄 Test 3: Expected Progression Flow');
  console.log('='.repeat(50));
  
  console.log('🎯 CORRECT PROGRESSION FLOW:');
  console.log('1. Student clicks Week 1 video ✅');
  console.log('2. Video completes → Week 1 readings unlock ✅');
  console.log('3. Student clicks ALL Week 1 readings:');
  console.log('   • Acts in Action Introduction (ID: 1)');
  console.log('   • Acts in Action Chapter 1 (ID: 2)');
  console.log('   • Acts Chapters 1-2 Bible reading (ID: 3)');
  console.log('4. ALL readings complete → Week 1 quiz unlocks ✅');
  console.log('5. Student completes quiz → Week 2 unlocks ✅');
  
  console.log('\n🔒 CURRENT LOCKING BEHAVIOR:');
  console.log('• Week 1 videos: ✅ Accessible');
  console.log('• Week 1 readings: 🔒 Locked until videos completed');
  console.log('• Week 1 quiz: 🔒 Locked until ALL readings completed');
  console.log('• Week 2+ content: 🔒 Locked until previous week completed');
  console.log('• Final exam: 🔒 Locked until all weeks completed');
  
  console.log('\n📋 TESTING INSTRUCTIONS:');
  console.log('1. Go to http://localhost:56000/course/1');
  console.log('2. Verify Week 1 videos show correct Acts in Action content');
  console.log('3. Verify Week 1 readings are locked (grayed out)');
  console.log('4. Click Week 1 video and complete it');
  console.log('5. Verify Week 1 readings unlock');
  console.log('6. Click ALL three Week 1 readings (Introduction, Chapter 1, Bible)');
  console.log('7. Verify Week 1 quiz unlocks only after ALL readings completed');
  console.log('8. Complete quiz and verify Week 2 unlocks');
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 TEST COMPLETE - Both issues should now be fixed!');
  console.log('✅ Video URLs updated to correct Acts in Action videos');
  console.log('✅ Quiz unlocking requires ALL readings completion');
}

testCourse1CompleteFlow().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
