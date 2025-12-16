#!/usr/bin/env node

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { db } from './server/db';
import { quizQuestions } from './shared/schema';
import { eq, and } from 'drizzle-orm';

async function checkQuestion() {
  try {
    const questions = await db
      .select()
      .from(quizQuestions)
      .where(and(
        eq(quizQuestions.quizId, 67),
        eq(quizQuestions.orderIndex, 20)
      ));
    
    if (questions.length === 0) {
      console.log('❌ Question 20 not found in Quiz 67');
      return;
    }
    
    const question = questions[0];
    
    console.log('📋 Quiz 67, Question 20 Details:');
    console.log('='.repeat(80));
    console.log(`ID: ${question.id}`);
    console.log(`Type: ${question.type}`);
    console.log(`Order Index: ${question.orderIndex}`);
    console.log(`Question Text: "${question.question}"`);
    console.log(`Question Length: ${question.question?.length || 0} characters`);
    console.log(`Correct Answer: "${question.correctAnswer}"`);
    console.log(`Options:`, question.options);
    console.log(`Points: ${question.points}`);
    console.log(`Is Bonus: ${question.isBonus}`);
    
    if (!question.question || question.question.trim().length < 10) {
      console.log('\n⚠️  ISSUE: Question text is too short or empty!');
      console.log(`   Current length: ${question.question?.length || 0} characters`);
      console.log(`   Text: "${question.question}"`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkQuestion();




























