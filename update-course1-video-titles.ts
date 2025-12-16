#!/usr/bin/env node

/**
 * Update Course 1 Video Titles
 * 
 * This script updates Course 1 video titles to use descriptive names
 * instead of generic "Week X" format
 */

import { db } from './server/db';
import { courseVideos } from './shared/schema';
import { eq } from 'drizzle-orm';

async function updateCourse1VideoTitles() {
  console.log('🔄 Updating Course 1 Video Titles...\n');
  
  // Correct video titles and durations for Acts in Action
  // Based on the video content and user request
  const correctTitles: { [key: number]: string } = {
    1: 'Introduction', // Week 1
    // Add more titles as needed - these will be updated based on actual video content
  };
  
  const correctDurations: { [key: number]: number } = {
    1: 60, // Week 1 is 1 hour (60 minutes)
    // Add more durations as needed
  };
  
  // Get all videos for Course 1, ordered by orderIndex
  const videos = await db.select()
    .from(courseVideos)
    .where(eq(courseVideos.courseId, 1))
    .orderBy(courseVideos.orderIndex);
  
  console.log(`📹 Found ${videos.length} videos for Course 1:\n`);
  
  // Update each video title
  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    const weekNumber = video.title.match(/Week (\d+)/)?.[1];
    
    if (weekNumber) {
      const weekNum = parseInt(weekNumber);
      
      // Check if we have a custom title or duration for this week
      const newTitle = correctTitles[weekNum];
      const newDuration = correctDurations[weekNum];
      
      if (newTitle || newDuration) {
        const updates: any = {};
        if (newTitle) updates.title = newTitle;
        if (newDuration) updates.duration = newDuration;
        
        console.log(`Updating Week ${weekNumber}:`);
        if (newTitle) {
          console.log(`  Title: ${video.title} → ${newTitle}`);
        }
        if (newDuration) {
          console.log(`  Duration: ${video.duration || 'N/A'} → ${newDuration} minutes`);
        }
        
        await db.update(courseVideos)
          .set(updates)
          .where(eq(courseVideos.id, video.id));
        
        console.log(`  ✅ Updated!\n`);
      } else {
        console.log(`Week ${weekNumber}: ${video.title} (no update needed - add title/duration to maps)\n`);
      }
    } else {
      // Try to match by orderIndex (assuming orderIndex 0 = Week 1, 1 = Week 2, etc.)
      const weekNum = video.orderIndex + 1;
      const newTitle = correctTitles[weekNum];
      const newDuration = correctDurations[weekNum];
      
      if (newTitle || newDuration) {
        const updates: any = {};
        if (newTitle) updates.title = newTitle;
        if (newDuration) updates.duration = newDuration;
        
        console.log(`Updating video at orderIndex ${video.orderIndex} (Week ${weekNum}):`);
        if (newTitle) {
          console.log(`  Title: ${video.title} → ${newTitle}`);
        }
        if (newDuration) {
          console.log(`  Duration: ${video.duration || 'N/A'} → ${newDuration} minutes`);
        }
        
        await db.update(courseVideos)
          .set(updates)
          .where(eq(courseVideos.id, video.id));
        
        console.log(`  ✅ Updated!\n`);
      } else {
        console.log(`Video: ${video.title} (orderIndex: ${video.orderIndex}) - no update needed\n`);
      }
    }
  }
  
  console.log('🎉 Course 1 Video Titles Update Complete!');
  console.log('\n📋 Summary:');
  console.log('• Week 1 updated to "Introduction"');
  console.log('• Other weeks can be updated by adding titles to the correctTitles map');
}

updateCourse1VideoTitles().catch(error => {
  console.error('❌ Update failed:', error);
  process.exit(1);
});

