#!/usr/bin/env node

/**
 * Remove Wrong Videos from Course 1
 * 
 * This script permanently deletes:
 * 1. The "Don't Be a Jonah" video (kK_nCld8Jow) incorrectly assigned to Course 1
 * 2. The "Test Video" that shouldn't be there
 * 
 * Usage:
 *   DATABASE_URL="your_database_url" node_modules/.bin/tsx remove-wrong-course1-videos.ts
 */

import { db } from './server/db';
import { courseVideos } from './shared/schema';
import { eq, and, or, like, ilike } from 'drizzle-orm';

async function removeWrongVideos() {
  console.log('🔍 Searching for incorrect videos in Course 1...\n');
  
  // Find videos to remove:
  // 1. Video with YouTube URL kK_nCld8Jow (Don't Be a Jonah)
  // 2. Videos with "Test" in the title
  const wrongVideos = await db.select()
    .from(courseVideos)
    .where(
      and(
        eq(courseVideos.courseId, 1),
        or(
          like(courseVideos.videoUrl, '%kK_nCld8Jow%'),
          ilike(courseVideos.title, '%test%')
        )
      )
    );
  
  if (wrongVideos.length === 0) {
    console.log('❌ No incorrect videos found in Course 1');
    console.log('🔍 Checking all Course 1 videos...\n');
    
    // List all Course 1 videos to help debug
    const allVideos = await db.select()
      .from(courseVideos)
      .where(eq(courseVideos.courseId, 1))
      .orderBy(courseVideos.orderIndex);
    
    console.log(`📹 Found ${allVideos.length} videos for Course 1:\n`);
    allVideos.forEach((video, index) => {
      console.log(`${index + 1}. ID: ${video.id} - ${video.title}`);
      console.log(`   • Video URL: ${video.videoUrl}`);
      console.log(`   • Order Index: ${video.orderIndex}`);
      console.log(`   • Published: ${video.isPublished}`);
      console.log(`   • Deleted: ${video.isDeleted}`);
      console.log('');
    });
    
    process.exit(1);
  }
  
  console.log(`✅ Found ${wrongVideos.length} incorrect video(s) to remove:\n`);
  wrongVideos.forEach((video) => {
    console.log(`   • ID: ${video.id}`);
    console.log(`   • Title: ${video.title}`);
    console.log(`   • URL: ${video.videoUrl}`);
    console.log(`   • Published: ${video.isPublished}`);
    console.log('');
  });
  
  // Permanently delete the videos
  for (const video of wrongVideos) {
    console.log(`🗑️  Permanently deleting video ID ${video.id} (${video.title})...`);
    
    await db.delete(courseVideos)
      .where(eq(courseVideos.id, video.id));
    
    console.log(`✅ Video ID ${video.id} has been permanently deleted\n`);
  }
  
  console.log('🎉 Done! All incorrect videos have been removed from Course 1.');
  
  // Show remaining videos
  console.log('\n📹 Remaining Course 1 videos:');
  const remainingVideos = await db.select()
    .from(courseVideos)
    .where(
      and(
        eq(courseVideos.courseId, 1),
        eq(courseVideos.isDeleted, false)
      )
    )
    .orderBy(courseVideos.orderIndex);
  
  remainingVideos.forEach((video, index) => {
    console.log(`${index + 1}. ${video.title} (Published: ${video.isPublished})`);
  });
  
  process.exit(0);
}

if (import.meta.url === new URL(import.meta.url).href) {
  removeWrongVideos().catch(console.error);
}

