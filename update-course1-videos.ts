#!/usr/bin/env node

/**
 * Update Course 1 Video URLs
 * 
 * This script updates all Course 1 video URLs to the correct Acts in Action videos
 */

import { db } from './server/db';
import { courseVideos } from './shared/schema';
import { eq } from 'drizzle-orm';

async function updateCourse1VideoUrls() {
  console.log('🔄 Updating Course 1 Video URLs...\n');
  
  // Correct video URLs for Acts in Action
  const correctUrls = [
    'https://www.youtube.com/watch?v=U2wSdkXhWbc&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=1&t=3s', // Week 1
    'https://www.youtube.com/watch?v=YakUCnANRLU&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=2', // Week 2
    'https://www.youtube.com/watch?v=lr4eer0TIyE&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=3', // Week 3
    'https://www.youtube.com/watch?v=YRBoH1P_XU8&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=4', // Week 4
    'https://www.youtube.com/watch?v=wmi4MmeoTcY&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=5', // Week 5
    'https://www.youtube.com/watch?v=KsDhPlg1HPw&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=6', // Week 6
    'https://www.youtube.com/watch?v=CvUYK3TE_90&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=7', // Week 7
    'https://www.youtube.com/watch?v=v2SY1FdG4tM&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=8', // Week 8
    'https://www.youtube.com/watch?v=JH4LvpDzmUg&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=9', // Week 9
    'https://www.youtube.com/watch?v=Gc9-JSmGHaE&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=10', // Week 10
    'https://www.youtube.com/watch?v=5CSjS_P06WE&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=11' // Week 11
  ];
  
  // Get all videos for Course 1, ordered by week number
  const videos = await db.select()
    .from(courseVideos)
    .where(eq(courseVideos.courseId, 1))
    .orderBy(courseVideos.orderIndex);
  
  console.log(`📹 Found ${videos.length} videos to update:\n`);
  
  // Update each video URL
  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    const weekNumber = video.title.match(/Week (\d+)/)?.[1];
    
    if (weekNumber) {
      const weekIndex = parseInt(weekNumber) - 1; // Convert to 0-based index
      if (weekIndex >= 0 && weekIndex < correctUrls.length) {
        const newUrl = correctUrls[weekIndex];
        
        console.log(`Updating ${video.title}:`);
        console.log(`  Old: ${video.videoUrl}`);
        console.log(`  New: ${newUrl}`);
        
        await db.update(courseVideos)
          .set({ videoUrl: newUrl })
          .where(eq(courseVideos.id, video.id));
        
        console.log(`  ✅ Updated!\n`);
      } else {
        console.log(`⚠️  Skipping ${video.title} - no matching URL for Week ${weekNumber}\n`);
      }
    } else {
      console.log(`⚠️  Skipping ${video.title} - no week number found\n`);
    }
  }
  
  console.log('🎉 Course 1 Video URLs Updated Successfully!');
  console.log('\n📋 Summary:');
  console.log('• All Week 1-10 videos updated to correct Acts in Action URLs');
  console.log('• Week 11 video updated (if exists)');
  console.log('• Test videos and other non-week videos left unchanged');
}

updateCourse1VideoUrls().catch(error => {
  console.error('❌ Update failed:', error);
  process.exit(1);
});
