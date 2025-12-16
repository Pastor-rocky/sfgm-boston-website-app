#!/usr/bin/env node

/**
 * Debug Reading Unlock Issue
 * 
 * Check why Week 1 readings aren't unlocking after watching video
 */

import { db } from './server/db';
import { contentProgress, courseVideos } from './shared/schema';
import { eq, and } from 'drizzle-orm';

async function debugUnlock() {
  console.log('🔍 Debugging Course 1 Reading Unlock Issue\n');
  
  // Get Week 1 video
  const videos = await db.select().from(courseVideos)
    .where(and(
      eq(courseVideos.courseId, 1),
      eq(courseVideos.isPublished, true)
    ));
  
  const extractWeekNumber = (title: string) => {
    const weekMatch = title.match(/Week (\d+)/i);
    if (weekMatch) return parseInt(weekMatch[1]);
    return 1;
  };
  
  const week1Videos = videos.filter(v => {
    const week = extractWeekNumber(v.title);
    const hasWeek = /Week \d+/i.test(v.title);
    return week === 1 && hasWeek;
  });
  
  console.log('📹 Week 1 Videos:');
  week1Videos.forEach(v => {
    console.log(`  ID ${v.id}: "${v.title}"`);
  });
  
  // Check progress for all users
  const allProgress = await db.select().from(contentProgress)
    .where(and(
      eq(contentProgress.courseId, 1),
      eq(contentProgress.contentType, 'video')
    ));
  
  console.log('\n📊 Video Progress Records:');
  const progressByVideo: Record<number, number> = {};
  allProgress.forEach(p => {
    if (p.completed) {
      progressByVideo[p.contentId] = (progressByVideo[p.contentId] || 0) + 1;
    }
  });
  
  week1Videos.forEach(v => {
    const count = progressByVideo[v.id] || 0;
    console.log(`  Video ID ${v.id}: ${count} completion(s)`);
  });
  
  console.log('\n💡 Expected Behavior:');
  console.log('  - Week 1 readings should unlock when Video ID 2 is completed');
  console.log('  - Check if contentProgress query is refreshing in the UI');
  console.log('  - Check if isContentCompleted is checking the right courseId');
  
  process.exit(0);
}

debugUnlock();

