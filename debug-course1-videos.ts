#!/usr/bin/env node

/**
 * Debug Course 1 Video Detection
 * 
 * This script checks if Course 1 has videos and why readings might not be locked
 */

import { db } from './server/db';
import { courseVideos, courseReadings } from './shared/schema';
import { eq } from 'drizzle-orm';

async function debugCourse1() {
  console.log('🔍 Debugging Course 1 Video Detection...\n');
  
  // Get all videos for Course 1
  const videos = await db.select()
    .from(courseVideos)
    .where(eq(courseVideos.courseId, 1));
  
  console.log(`📹 Videos found for Course 1: ${videos.length}`);
  
  videos.forEach((video, index) => {
    console.log(`  ${index + 1}. ${video.title}`);
    console.log(`     • Published: ${video.isPublished}`);
    console.log(`     • Video URL: ${video.videoUrl ? 'Yes' : 'No'}`);
    console.log(`     • Order Index: ${video.orderIndex}`);
  });
  
  // Get all readings for Course 1
  const readings = await db.select()
    .from(courseReadings)
    .where(eq(courseReadings.courseId, 1));
  
  console.log(`\n📚 Readings found for Course 1: ${readings.length}`);
  
  readings.forEach((reading, index) => {
    console.log(`  ${index + 1}. ${reading.title}`);
    console.log(`     • Published: ${reading.isPublished}`);
    console.log(`     • Order Index: ${reading.orderIndex}`);
  });
  
  // Check if course has videos (same logic as frontend)
  const hasVideos = videos.some(v => v.isPublished && v.videoUrl);
  console.log(`\n🎯 Course 1 has videos: ${hasVideos}`);
  
  if (!hasVideos) {
    console.log('\n❌ PROBLEM FOUND: Course 1 is not detected as having videos!');
    console.log('This means readings will be accessible immediately instead of locked.');
    
    const videosWithUrls = videos.filter(v => v.videoUrl);
    const publishedVideos = videos.filter(v => v.isPublished);
    
    console.log(`\n📊 Analysis:`);
    console.log(`   • Videos with URLs: ${videosWithUrls.length}`);
    console.log(`   • Published videos: ${publishedVideos.length}`);
    console.log(`   • Published videos with URLs: ${videos.filter(v => v.isPublished && v.videoUrl).length}`);
  } else {
    console.log('\n✅ Course 1 is correctly detected as having videos.');
    console.log('The issue might be elsewhere in the logic.');
  }
}

debugCourse1().catch(error => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});
