#!/usr/bin/env node

/**
 * Simple List of All 50 Final Exam Questions with Answers
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { db } from './server/db';
import { quizQuestions } from './shared/schema';
import { eq, asc } from 'drizzle-orm';

async function displaySimpleList() {
  try {
    const questions = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, 23))
      .orderBy(asc(quizQuestions.orderIndex));
    
    console.log('='.repeat(80));
    console.log('COURSE 1 FINAL EXAM - ALL 50 QUESTIONS WITH ANSWERS');
    console.log('='.repeat(80));
    console.log('');
    
    questions.forEach((question, index) => {
      const questionNum = index + 1;
      
      // Get the correct answer letter
      let correctAnswerLetter = '';
      if (question.options && Array.isArray(question.options)) {
        const normalizedAnswer = question.correctAnswer?.trim() || '';
        question.options.forEach((opt: string, idx: number) => {
          const normalizedOpt = opt.trim();
          const isCorrect = 
            normalizedOpt === normalizedAnswer ||
            normalizedOpt.toLowerCase() === normalizedAnswer.toLowerCase() ||
            normalizedOpt.replace(/^[A-D][.)]\s*/i, '').trim() === normalizedAnswer.replace(/^[A-D][.)]\s*/i, '').trim();
          
          if (isCorrect) {
            correctAnswerLetter = String.fromCharCode(65 + idx); // A, B, C, or D
          }
        });
      }
      
      console.log(`${questionNum}. ${question.question}`);
      console.log(`   Answer: ${correctAnswerLetter}`);
      console.log('');
    });
    
    console.log('='.repeat(80));
    console.log(`Total: ${questions.length} questions`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

displaySimpleList();




























