#!/usr/bin/env node

/**
 * Verify and Display Final Exam for Course 1
 * 
 * This script verifies the final exam is correct and displays
 * all 50 questions with their correct answers in a clean format.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { db } from './server/db';
import { quizzes, quizQuestions } from './shared/schema';
import { eq, asc } from 'drizzle-orm';

async function verifyAndDisplay() {
  try {
    console.log('🔍 Verifying Final Exam (Quiz 23)...\n');
    
    // Get final exam quiz
    const [finalExam] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, 23))
      .limit(1);
    
    if (!finalExam) {
      console.error('❌ Final exam not found');
      process.exit(1);
    }
    
    // Update quiz settings if needed
    await db
      .update(quizzes)
      .set({
        timeLimit: 75, // 75 minutes for 50 questions
        passingScore: 60,
        isFinalExam: true,
        isPublished: true,
      })
      .where(eq(quizzes.id, 23));
    
    console.log('✅ Final exam settings updated:');
    console.log(`   Time Limit: 75 minutes`);
    console.log(`   Passing Score: 60%`);
    console.log(`   Final Exam: Yes`);
    console.log(`   Published: Yes\n`);
    
    // Get all questions
    const questions = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, 23))
      .orderBy(asc(quizQuestions.orderIndex));
    
    console.log(`Found ${questions.length} questions\n`);
    
    // Verify all questions
    let errors = 0;
    for (const question of questions) {
      if (!question.question || question.question.trim().length < 10) {
        errors++;
        console.log(`⚠️  Question ${question.orderIndex}: Question text too short`);
      }
      
      if (!question.correctAnswer || question.correctAnswer.trim() === '') {
        errors++;
        console.log(`⚠️  Question ${question.orderIndex}: Missing correct answer`);
      }
      
      if (question.type === 'multiple_choice') {
        if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
          errors++;
          console.log(`⚠️  Question ${question.orderIndex}: Invalid options`);
        } else {
          const normalizedAnswer = question.correctAnswer.trim();
          const normalizedOptions = question.options.map((opt: string) => opt.trim());
          
          const exactMatch = normalizedOptions.includes(normalizedAnswer);
          const caseInsensitiveMatch = normalizedOptions.some(opt => 
            opt.toLowerCase() === normalizedAnswer.toLowerCase()
          );
          const contentMatch = normalizedOptions.some(opt => {
            const optContent = opt.replace(/^[A-D][.)]\s*/i, '').trim();
            const answerContent = normalizedAnswer.replace(/^[A-D][.)]\s*/i, '').trim();
            return optContent === answerContent || 
                   optContent.toLowerCase() === answerContent.toLowerCase();
          });
          
          if (!exactMatch && !caseInsensitiveMatch && !contentMatch) {
            errors++;
            console.log(`⚠️  Question ${question.orderIndex}: Answer not in options`);
          }
        }
      }
    }
    
    if (errors > 0) {
      console.log(`\n❌ Found ${errors} errors that need to be fixed`);
    } else {
      console.log('✅ All questions verified - no errors found!\n');
    }
    
    // Display all questions with answers
    console.log('='.repeat(100));
    console.log('📋 FINAL EXAM: ALL 50 QUESTIONS WITH ANSWERS');
    console.log('='.repeat(100) + '\n');
    
    questions.forEach((question, index) => {
      const questionNum = index + 1;
      
      console.log(`${questionNum}. ${question.question}`);
      
      if (question.options && Array.isArray(question.options)) {
        question.options.forEach((opt: string, idx: number) => {
          const normalizedOpt = opt.trim();
          const normalizedAnswer = question.correctAnswer?.trim() || '';
          
          // Check if this is the correct answer
          const isCorrect = 
            normalizedOpt === normalizedAnswer ||
            normalizedOpt.toLowerCase() === normalizedAnswer.toLowerCase() ||
            normalizedOpt.replace(/^[A-D][.)]\s*/i, '').trim() === normalizedAnswer.replace(/^[A-D][.)]\s*/i, '').trim();
          
          const marker = isCorrect ? '✓' : ' ';
          const letter = String.fromCharCode(65 + idx);
          
          // Clean up option display (remove duplicate prefixes if present)
          let displayOpt = normalizedOpt;
          if (normalizedOpt.match(/^[A-D][.)]\s*[A-D][.)]\s*/i)) {
            displayOpt = normalizedOpt.replace(/^[A-D][.)]\s*/i, '');
          }
          
          console.log(`   ${marker} ${letter}) ${displayOpt}`);
        });
      }
      
      // Show correct answer clearly
      let correctAnswerDisplay = question.correctAnswer?.trim() || '';
      // Clean up if it has duplicate prefix
      if (correctAnswerDisplay.match(/^[A-D][.)]\s*[A-D][.)]\s*/i)) {
        correctAnswerDisplay = correctAnswerDisplay.replace(/^[A-D][.)]\s*/i, '');
      }
      
      console.log(`\n   ✅ CORRECT ANSWER: ${correctAnswerDisplay}`);
      console.log('');
    });
    
    // Summary
    console.log('='.repeat(100));
    console.log('📊 FINAL EXAM SUMMARY');
    console.log('='.repeat(100));
    console.log(`Quiz ID: 23`);
    console.log(`Title: ${finalExam.title}`);
    console.log(`Total Questions: ${questions.length}`);
    console.log(`Time Limit: 75 minutes`);
    console.log(`Passing Score: 60%`);
    console.log(`Status: ${errors === 0 ? '✅ READY' : '⚠️  NEEDS FIXES'}`);
    
    if (errors === 0) {
      console.log(`\n🎉 Final exam is complete and ready for use!`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

verifyAndDisplay();




























