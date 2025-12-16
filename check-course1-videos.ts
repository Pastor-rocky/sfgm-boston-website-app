#!/usr/bin/env node

/**
 * Check Course 1 Video URLs
 * 
 * This script checks the current video URLs for Course 1
 */

import { db } from './server/db';
import { courseVideos } from './shared/schema';
import { eq } from 'drizzle-orm';

async function checkCourse1Videos() {
  console.log('🔍 Checking Course 1 Video URLs...\n');
  
  // Get all videos for Course 1
  const videos = await db.select()
    .from(courseVideos)
    .where(eq(courseVideos.courseId, 1))
    .orderBy(courseVideos.orderIndex);
  
  console.log(`📹 Found ${videos.length} videos for Course 1:\n`);
  
  videos.forEach((video, index) => {
    console.log(`${index + 1}. ${video.title}`);
    console.log(`   • Video URL: ${video.videoUrl}`);
    console.log(`   • Order Index: ${video.orderIndex}`);
    console.log(`   • Published: ${video.isPublished}`);
    console.log('');
  });
  
  console.log('🎯 Expected URLs (from user):');
  const expectedUrls = [
    'https://www.youtube.com/watch?v=U2wSdkXhWbc&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=1&t=3s',
    'https://www.youtube.com/watch?v=YakUCnANRLU&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=2',
    'https://www.youtube.com/watch?v=lr4eer0TIyE&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=3',
    'https://www.youtube.com/watch?v=YRBoH1P_XU8&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=4',
    'https://www.youtube.com/watch?v=wmi4MmeoTcY&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=5',
    'https://www.youtube.com/watch?v=KsDhPlg1HPw&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=6',
    'https://www.youtube.com/watch?v=CvUYK3TE_90&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=7',
    'https://www.youtube.com/watch?v=v2SY1FdG4tM&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=8',
    'https://www.youtube.com/watch?v=JH4LvpDzmUg&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=9',
    'https://www.youtube.com/watch?v=Gc9-JSmGHaE&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=10',
    'https://www.youtube.com/watch?v=5CSjS_P06WE&list=PLXGq3BCCH8NAgqMqylj02GMLw1CVgBamq&index=11'
  ];
  
  expectedUrls.forEach((url, index) => {
    console.log(`   Week ${index + 1}: ${url}`);
  });
}

checkCourse1Videos().catch(error => {
  console.error('❌ Check failed:', error);
  process.exit(1);
});
