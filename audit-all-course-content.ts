#!/usr/bin/env node

/**
 * Comprehensive Course Content Audit
 * 
 * Checks for missing videos, audio files, quizzes, and other content
 * that needs to be migrated to the database
 */

import { db } from './server/db';
import { courseVideos, courseReadings, quizzes, courses } from './shared/schema';
import { eq, and, sql } from 'drizzle-orm';

interface ContentAudit {
  videos: { courseId: number; count: number; expected: number }[];
  readings: { courseId: number; count: number; expected: number }[];
  quizzes: { courseId: number; count: number; expected: number }[];
  audioFiles: { courseId: number; missing: string[] }[];
}

async function auditAllContent() {
  console.log('🔍 COMPREHENSIVE COURSE CONTENT AUDIT\n');
  console.log('='.repeat(80));
  
  const audit: ContentAudit = {
    videos: [],
    readings: [],
    quizzes: [],
    audioFiles: []
  };

  // Expected content counts by course
  const expectedVideos: Record<number, number> = {
    1: 11, // Acts in Action - 11 weeks
    2: 0,  // Fire Starter - no videos
    3: 5,  // Jonah - weeks 1,3,5,7,9 (or all 11?)
    4: 0,  // G.R.O.W - no videos
    5: 0,  // Studying - no videos (or check)
    6: 0,  // Deacon - no videos
    7: 0,  // Level Up - check
    8: 0   // Youth - no videos
  };

  const expectedReadings: Record<number, number> = {
    1: 21, 2: 20, 3: 22, 4: 4, 5: 24, 6: 5, 7: 6, 8: 5
  };

  const expectedQuizzes: Record<number, number> = {
    1: 11, // 10 weekly + 1 final
    2: 11, // 10 weekly + 1 final
    3: 12, // 11 weekly + 1 final
    4: 5,  // 4 weekly + 1 final
    5: 13, // 12 weekly + 1 final
    6: 6,  // 5 weekly + 1 final
    7: 6,  // 5 weekly + 1 final
    8: 6   // 5 weekly + 1 final
  };

  // Get all courses
  const allCourses = await db.select().from(courses).where(eq(courses.isActive, true));
  console.log(`\n📚 Found ${allCourses.length} active courses\n`);

  // Audit Videos
  console.log('📹 AUDITING VIDEOS...\n');
  for (const course of allCourses) {
    const videos = await db
      .select()
      .from(courseVideos)
      .where(and(
        eq(courseVideos.courseId, course.id),
        eq(courseVideos.isDeleted, false)
      ));
    
    const count = videos.length;
    const expected = expectedVideos[course.id] || 0;
    
    audit.videos.push({ courseId: course.id, count, expected });
    
    const status = count >= expected ? '✅' : '⚠️';
    console.log(`${status} Course ${course.id} (${course.name}): ${count}/${expected} videos`);
    
    if (count < expected) {
      const videos = await db
        .select()
        .from(courseVideos)
        .where(and(
          eq(courseVideos.courseId, course.id),
          eq(courseVideos.isDeleted, false)
        ));
      console.log(`   Existing video titles: ${videos.map(v => v.title).join(', ') || 'None'}`);
    }
  }

  // Audit Readings
  console.log('\n📖 AUDITING READINGS...\n');
  for (const course of allCourses) {
    const readings = await db
      .select()
      .from(courseReadings)
      .where(and(
        eq(courseReadings.courseId, course.id),
        eq(courseReadings.isActive, true)
      ));
    
    const count = readings.length;
    const expected = expectedReadings[course.id] || 0;
    
    audit.readings.push({ courseId: course.id, count, expected });
    
    const status = count === expected ? '✅' : '⚠️';
    console.log(`${status} Course ${course.id} (${course.name}): ${count}/${expected} readings`);
  }

  // Audit Quizzes
  console.log('\n📝 AUDITING QUIZZES...\n');
  
  // Get quiz IDs from course progress config
  const quizIdsByCourse: Record<number, number[]> = {
    1: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    2: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58],
    3: [26, 46, 37, 38, 39, 40, 41, 42, 43, 44, 45, 47],
    4: [71, 72, 73, 74, 75],
    5: [59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70],
    6: [76, 77, 78, 79, 80, 82],
    7: [200, 201, 202, 203, 204, 206],
    8: [207, 208, 209, 210, 211, 212]
  };

  for (const course of allCourses) {
    const expectedQuizIds = quizIdsByCourse[course.id] || [];
    const expected = expectedQuizzes[course.id] || 0;
    
    // Check which quizzes exist
    const existingQuizzes = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, expectedQuizIds[0])); // Check first quiz
    
    // Count quizzes that exist
    let foundCount = 0;
    for (const quizId of expectedQuizIds) {
      const [quiz] = await db
        .select()
        .from(quizzes)
        .where(eq(quizzes.id, quizId))
        .limit(1);
      if (quiz) foundCount++;
    }
    
    audit.quizzes.push({ courseId: course.id, count: foundCount, expected });
    
    const status = foundCount === expected ? '✅' : '⚠️';
    console.log(`${status} Course ${course.id} (${course.name}): ${foundCount}/${expected} quizzes`);
    
    if (foundCount < expected) {
      const missingIds: number[] = [];
      for (const quizId of expectedQuizIds) {
        const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);
        if (!quiz) missingIds.push(quizId);
      }
      if (missingIds.length > 0) {
        console.log(`   Missing quiz IDs: ${missingIds.join(', ')}`);
      }
    }
  }

  // Check for audio file references in readings
  console.log('\n🎵 CHECKING AUDIO FILE REFERENCES IN READINGS...\n');
  const readingsWithAudio = await db
    .select()
    .from(courseReadings)
    .where(eq(courseReadings.isActive, true));
  
  const audioReferences: Record<number, string[]> = {};
  readingsWithAudio.forEach(reading => {
    if (reading.content && reading.content.includes('.mp3')) {
      if (!audioReferences[reading.courseId]) audioReferences[reading.courseId] = [];
      // Extract audio file references
      const matches = reading.content.match(/\/uploads\/[^"'\s]+\.mp3/g);
      if (matches) {
        audioReferences[reading.courseId].push(...matches);
      }
    }
  });

  for (const [courseId, files] of Object.entries(audioReferences)) {
    console.log(`Course ${courseId}: ${files.length} audio file references found`);
    files.forEach(file => console.log(`   - ${file}`));
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 AUDIT SUMMARY');
  console.log('='.repeat(80));
  
  const missingVideos = audit.videos.filter(v => v.count < v.expected);
  const missingReadings = audit.readings.filter(r => r.count < r.expected);
  const missingQuizzes = audit.quizzes.filter(q => q.count < q.expected);
  
  if (missingVideos.length > 0) {
    console.log(`\n⚠️  Missing Videos: ${missingVideos.length} courses`);
    missingVideos.forEach(v => {
      console.log(`   Course ${v.courseId}: Missing ${v.expected - v.count} videos`);
    });
  } else {
    console.log('\n✅ All videos present');
  }
  
  if (missingReadings.length > 0) {
    console.log(`\n⚠️  Missing Readings: ${missingReadings.length} courses`);
    missingReadings.forEach(r => {
      console.log(`   Course ${r.courseId}: Missing ${r.expected - r.count} readings`);
    });
  } else {
    console.log('\n✅ All readings present');
  }
  
  if (missingQuizzes.length > 0) {
    console.log(`\n⚠️  Missing Quizzes: ${missingQuizzes.length} courses`);
    missingQuizzes.forEach(q => {
      console.log(`   Course ${q.courseId}: Missing ${q.expected - q.count} quizzes`);
    });
  } else {
    console.log('\n✅ All quizzes present');
  }
  
  console.log('\n✅ Audit complete!\n');
  
  process.exit(0);
}

auditAllContent();

