#!/usr/bin/env node

/**
 * Test script to check Course 2 progress calculation
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { storage } from './server/storage';
import { db } from './server/db';
import { quizAttempts, quizzes, contentProgress, enrollments } from './shared/schema';
import { eq, and, inArray, isNotNull } from 'drizzle-orm';

async function testCourse2Progress() {
  try {
    console.log('🔍 Testing Course 2 Progress Calculation\n');
    console.log('='.repeat(80));
    
    // Get a test student ID (you can modify this)
    // For now, let's check all students enrolled in Course 2
    const course2Enrollments = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.courseId, 2))
      .limit(5);
    
    if (course2Enrollments.length === 0) {
      console.log('❌ No students enrolled in Course 2');
      return;
    }
    
    console.log(`Found ${course2Enrollments.length} enrollment(s) in Course 2\n`);
    
    for (const enrollment of course2Enrollments) {
      const studentId = enrollment.studentId;
      console.log(`\n📚 Testing for student: ${studentId}`);
      console.log('-'.repeat(80));
      
      // Calculate progress using the storage method
      const progress = await storage.calculateCourseProgress(studentId, 2);
      console.log(`\n✅ Calculated Progress: ${progress}%`);
      
      // Also manually check the data
      console.log('\n📊 Manual Data Check:');
      
      // Check quiz attempts
      const fireStarterQuizIds = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58];
      const attempts = await db
        .select()
        .from(quizAttempts)
        .where(and(
          eq(quizAttempts.studentId, studentId),
          inArray(quizAttempts.quizId, fireStarterQuizIds),
          isNotNull(quizAttempts.completedAt)
        ));
      
      console.log(`   Quiz Attempts: ${attempts.length}`);
      if (attempts.length > 0) {
        attempts.forEach(a => {
          console.log(`     - Quiz ${a.quizId}: score=${a.score}, completedAt=${a.completedAt}`);
        });
      }
      
      // Check reading progress
      const readings = await db
        .select()
        .from(contentProgress)
        .where(and(
          eq(contentProgress.studentId, studentId),
          eq(contentProgress.courseId, 2),
          eq(contentProgress.contentType, 'reading'),
          eq(contentProgress.completed, true)
        ));
      
      console.log(`   Completed Readings: ${readings.length}`);
      if (readings.length > 0) {
        readings.forEach(r => {
          console.log(`     - Content ID ${r.contentId}`);
        });
      }
      
      // Check video progress
      const videos = await db
        .select()
        .from(contentProgress)
        .where(and(
          eq(contentProgress.studentId, studentId),
          eq(contentProgress.courseId, 2),
          eq(contentProgress.contentType, 'video'),
          eq(contentProgress.completed, true)
        ));
      
      console.log(`   Completed Videos: ${videos.length}`);
      if (videos.length > 0) {
        videos.forEach(v => {
          console.log(`     - Content ID ${v.contentId}`);
        });
      }
      
      // Calculate expected progress
      const quizDetails = await db
        .select()
        .from(quizzes)
        .where(inArray(quizzes.id, fireStarterQuizIds));
      
      const passedQuizIds = new Set();
      attempts.forEach(attempt => {
        const quiz = quizDetails.find(q => q.id === attempt.quizId);
        const passingScore = (quiz?.passingScore || 60) / 100;
        const score = parseFloat(attempt.score || '0');
        if (score >= passingScore) {
          passedQuizIds.add(attempt.quizId);
        }
      });
      
      const completedQuizzes = passedQuizIds.size;
      const totalQuizzes = 11;
      const completedReadings = readings.length;
      const totalReadings = 20;
      const completedVideos = videos.length;
      const totalVideos = 10;
      
      const totalContent = totalQuizzes + totalReadings + totalVideos;
      const completedContent = completedQuizzes + completedReadings + completedVideos;
      const expectedProgress = totalContent > 0 ? (completedContent / totalContent) * 100 : 0;
      
      console.log(`\n📈 Expected Progress Calculation:`);
      console.log(`   Quizzes: ${completedQuizzes}/${totalQuizzes}`);
      console.log(`   Readings: ${completedReadings}/${totalReadings}`);
      console.log(`   Videos: ${completedVideos}/${totalVideos}`);
      console.log(`   Total: ${completedContent}/${totalContent} = ${expectedProgress.toFixed(2)}%`);
      console.log(`   Rounded: ${Math.round(expectedProgress)}%`);
      
      if (Math.abs(progress - expectedProgress) > 0.1) {
        console.log(`\n⚠️  WARNING: Calculated progress (${progress}%) doesn't match expected (${expectedProgress.toFixed(2)}%)`);
      } else {
        console.log(`\n✅ Progress calculation matches expected value`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Test complete');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

testCourse2Progress();

