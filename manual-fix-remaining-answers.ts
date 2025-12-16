#!/usr/bin/env node

/**
 * Manual Fix for Remaining Answer Issues
 * 
 * Lists the 10 questions that couldn't be automatically fixed
 * so they can be manually reviewed and corrected.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { db } from './server/db';
import { quizQuestions, quizzes } from './shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

async function listManualFixes() {
  try {
    console.log('📋 Questions Requiring Manual Review\n');
    console.log('='.repeat(100));
    
    // These are the quiz/question IDs that need manual fixing
    const manualFixes = [
      { quizId: 23, orderIndex: 11 },
      { quizId: 23, orderIndex: 24 },
      { quizId: 39, orderIndex: 15 },
      { quizId: 39, orderIndex: 1 },
      { quizId: 44, orderIndex: 5 },
      { quizId: 55, orderIndex: 13 },
      { quizId: 55, orderIndex: 17 },
      { quizId: 206, orderIndex: 24 },
      { quizId: 206, orderIndex: 27 },
      { quizId: 201, orderIndex: 10 },
    ];
    
    for (const fix of manualFixes) {
      const [question] = await db
        .select({
          question: quizQuestions,
          quizTitle: quizzes.title,
        })
        .from(quizQuestions)
        .leftJoin(quizzes, eq(quizQuestions.quizId, quizzes.id))
        .where(and(
          eq(quizQuestions.quizId, fix.quizId),
          eq(quizQuestions.orderIndex, fix.orderIndex)
        ))
        .limit(1);
      
      if (question) {
        console.log(`\nQuiz ${fix.quizId} (${question.quizTitle}), Question ${fix.orderIndex}:`);
        console.log(`  Question: "${question.question.question}"`);
        console.log(`  Current Answer: "${question.question.correctAnswer}"`);
        console.log(`  Options:`);
        if (question.question.options && Array.isArray(question.question.options)) {
          question.question.options.forEach((opt: string, idx: number) => {
            console.log(`    ${String.fromCharCode(65 + idx)}) ${opt}`);
          });
        }
        console.log(`  ⚠️  ACTION NEEDED: Review and manually set the correct answer`);
      }
    }
    
    console.log('\n' + '='.repeat(100));
    console.log('💡 These questions need manual review because the answer text');
    console.log('   doesn\'t closely match any option. Please review each one and');
    console.log('   update the correctAnswer field to match one of the options exactly.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

listManualFixes();




























