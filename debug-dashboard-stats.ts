#!/usr/bin/env node

/**
 * Debug script to check dashboard stats for a specific student
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { storage } from './server/storage';
import { db } from './server/db';
import { quizAttempts, quizzes } from './shared/schema';
import { eq, and, inArray, isNotNull, desc } from 'drizzle-orm';

async function debugDashboardStats() {
  try {
    console.log('🔍 Debugging Dashboard Stats\n');
    console.log('='.repeat(80));
    
    // Get a test student (pastor-rocky or first enrolled student)
    const testStudentId = 'pastor-rocky'; // Change this to the actual student ID if needed
    
    console.log(`\n📊 Checking stats for student: ${testStudentId}\n`);
    
    // Check Course 1 (Acts in Action) - Quiz IDs 13-23
    console.log('\n📚 Course 1: Acts in Action');
    console.log('-'.repeat(80));
    const course1QuizIds = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    
    const course1Attempts = await db
      .select({
        id: quizAttempts.id,
        quizId: quizAttempts.quizId,
        score: quizAttempts.score,
        completedAt: quizAttempts.completedAt,
        quizTitle: quizzes.title,
        passingScore: quizzes.passingScore,
      })
      .from(quizAttempts)
      .leftJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
      .where(and(
        eq(quizAttempts.studentId, testStudentId),
        inArray(quizAttempts.quizId, course1QuizIds),
        isNotNull(quizAttempts.completedAt)
      ))
      .orderBy(desc(quizAttempts.completedAt));
    
    console.log(`Found ${course1Attempts.length} quiz attempts`);
    
    if (course1Attempts.length > 0) {
      // Get unique quiz IDs
      const uniqueQuizIds = new Set(course1Attempts.map(a => a.quizId));
      console.log(`Unique quizzes attempted: ${uniqueQuizIds.size}`);
      
      // Get best score per quiz
      const bestScoresByQuiz = new Map();
      course1Attempts.forEach(attempt => {
        const quizId = attempt.quizId;
        const score = parseFloat(attempt.score || '0');
        const scorePercent = score <= 1 ? score * 100 : score;
        const passingScore = attempt.passingScore || 60;
        
        if (!bestScoresByQuiz.has(quizId) || scorePercent > (bestScoresByQuiz.get(quizId)?.score || 0)) {
          bestScoresByQuiz.set(quizId, { 
            score: scorePercent, 
            passingScore,
            quizTitle: attempt.quizTitle 
          });
        }
      });
      
      console.log('\nBest scores per quiz:');
      bestScoresByQuiz.forEach((data, quizId) => {
        const passed = data.score >= data.passingScore ? '✓ PASSED' : '✗ FAILED';
        console.log(`  Quiz ${quizId} (${data.quizTitle}): ${data.score.toFixed(1)}% (passing: ${data.passingScore}%) ${passed}`);
      });
      
      // Latest attempt
      const latest = course1Attempts[0];
      const latestScore = parseFloat(latest.score || '0');
      const latestScorePercent = latestScore <= 1 ? latestScore * 100 : latestScore;
      console.log(`\nLatest Score: ${latestScorePercent.toFixed(1)}% (from quiz: ${latest.quizTitle})`);
      
      // Passed count
      const passedCount = Array.from(bestScoresByQuiz.values()).filter(q => q.score >= q.passingScore).length;
      console.log(`Passed: ${passedCount}/${uniqueQuizIds.size}`);
    }
    
    // Check Course 2 (Fire Starter) - Quiz IDs 48-58
    console.log('\n\n📚 Course 2: Becoming a Fire Starter');
    console.log('-'.repeat(80));
    const course2QuizIds = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58];
    
    const course2Attempts = await db
      .select({
        id: quizAttempts.id,
        quizId: quizAttempts.quizId,
        score: quizAttempts.score,
        completedAt: quizAttempts.completedAt,
        quizTitle: quizzes.title,
        passingScore: quizzes.passingScore,
      })
      .from(quizAttempts)
      .leftJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
      .where(and(
        eq(quizAttempts.studentId, testStudentId),
        inArray(quizAttempts.quizId, course2QuizIds),
        isNotNull(quizAttempts.completedAt)
      ))
      .orderBy(desc(quizAttempts.completedAt));
    
    console.log(`Found ${course2Attempts.length} quiz attempts`);
    
    if (course2Attempts.length > 0) {
      // Get unique quiz IDs
      const uniqueQuizIds = new Set(course2Attempts.map(a => a.quizId));
      console.log(`Unique quizzes attempted: ${uniqueQuizIds.size}`);
      
      // Get best score per quiz
      const bestScoresByQuiz = new Map();
      course2Attempts.forEach(attempt => {
        const quizId = attempt.quizId;
        const score = parseFloat(attempt.score || '0');
        const scorePercent = score <= 1 ? score * 100 : score;
        const passingScore = attempt.passingScore || 60;
        
        if (!bestScoresByQuiz.has(quizId) || scorePercent > (bestScoresByQuiz.get(quizId)?.score || 0)) {
          bestScoresByQuiz.set(quizId, { 
            score: scorePercent, 
            passingScore,
            quizTitle: attempt.quizTitle 
          });
        }
      });
      
      console.log('\nBest scores per quiz:');
      bestScoresByQuiz.forEach((data, quizId) => {
        const passed = data.score >= data.passingScore ? '✓ PASSED' : '✗ FAILED';
        console.log(`  Quiz ${quizId} (${data.quizTitle}): ${data.score.toFixed(1)}% (passing: ${data.passingScore}%) ${passed}`);
      });
      
      // Latest attempt
      const latest = course2Attempts[0];
      const latestScore = parseFloat(latest.score || '0');
      const latestScorePercent = latestScore <= 1 ? latestScore * 100 : latestScore;
      console.log(`\nLatest Score: ${latestScorePercent.toFixed(1)}% (from quiz: ${latest.quizTitle})`);
      
      // Passed count
      const passedCount = Array.from(bestScoresByQuiz.values()).filter(q => q.score >= q.passingScore).length;
      console.log(`Passed: ${passedCount}/${uniqueQuizIds.size}`);
    }
    
    // Check progress calculation
    console.log('\n\n📈 Progress Calculations');
    console.log('-'.repeat(80));
    const enrollments = await storage.getStudentEnrollments(testStudentId);
    
    enrollments.forEach(enrollment => {
      if (enrollment.courseId === 1 || enrollment.courseId === 2) {
        console.log(`\nCourse ${enrollment.courseId} (${enrollment.course?.name}): ${enrollment.progress}%`);
      }
    });
    
    console.log('\n✅ Debug complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

debugDashboardStats().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});




























