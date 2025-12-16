#!/usr/bin/env node

/**
 * Fix Course 1 Video Unlock Issue
 * 
 * Problem: "Test Video" (ID=1) has no week number, causing Week 1 readings to not unlock
 * Solution: Unpublish the test video so it doesn't interfere with week-based progression
 */

import { db } from './server/db';
import { courseVideos } from './shared/schema';
import { eq, and } from 'drizzle-orm';

async function fixVideoUnlock() {
  console.log('🔧 Fixing Course 1 Video Unlock Issue...\n');
  
  // Find test videos without proper week numbers
  const allVideos = await db.select().from(courseVideos)
    .where(and(
      eq(courseVideos.courseId, 1),
      eq(courseVideos.isPublished, true)
    ));
  
  const testVideos = allVideos.filter(v => !v.title.match(/Week \d+/i));
  
  if (testVideos.length === 0) {
    console.log('✅ No test videos found. Issue may already be fixed.');
    process.exit(0);
  }
  
  console.log(`Found ${testVideos.length} test video(s) to unpublish:\n`);
  
  for (const video of testVideos) {
    console.log(`  - ID ${video.id}: "${video.title}"`);
    
    // Unpublish the test video
    await db.update(courseVideos)
      .set({ isPublished: false })
      .where(eq(courseVideos.id, video.id));
    
    console.log(`    ✅ Unpublished`);
  }
  
  console.log('\n✅ Fix complete! Week 1 readings should now unlock after watching Week 1 video.');
  console.log('\n📝 Note: The test video is still in the database but unpublished.');
  console.log('   You can delete it later if needed.');
  
  process.exit(0);
}

fixVideoUnlock();

