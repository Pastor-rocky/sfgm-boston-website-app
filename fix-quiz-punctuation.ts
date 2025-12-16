#!/usr/bin/env node

/**
 * Fix Quiz Question Punctuation
 * 
 * This script finds all quiz questions that don't end with proper punctuation
 * (?, ., or !) and fixes them by adding a question mark.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { db } from './server/db';
import { quizQuestions, quizzes } from './shared/schema';
import { eq, asc } from 'drizzle-orm';

interface QuestionToFix {
  id: number;
  quizId: number;
  quizTitle: string;
  orderIndex: number;
  currentText: string;
  fixedText: string;
}

async function fixPunctuation() {
  try {
    console.log('🔍 Finding questions with missing punctuation...\n');
    
    // Get all questions
    const allQuestions = await db
      .select({
        question: quizQuestions,
        quizTitle: quizzes.title,
      })
      .from(quizQuestions)
      .leftJoin(quizzes, eq(quizQuestions.quizId, quizzes.id))
      .orderBy(asc(quizQuestions.quizId), asc(quizQuestions.orderIndex));
    
    const questionsToFix: QuestionToFix[] = [];
    
    // Find questions missing proper punctuation
    for (const row of allQuestions) {
      const question = row.question;
      if (!question.question) continue;
      
      const questionText = question.question.trim();
      
      // Check if it ends with proper punctuation
      if (questionText && !questionText.match(/[?.!]$/)) {
        // Determine what punctuation to add
        // Most quiz questions should end with "?"
        let fixedText = questionText;
        
        // If it's clearly a question (starts with who, what, where, when, why, how, etc.)
        const questionWords = /^(who|what|where|when|why|how|which|whose|whom|is|are|was|were|do|does|did|can|could|should|would|will|has|have|had)/i;
        if (questionWords.test(questionText)) {
          fixedText = questionText + '?';
        } else {
          // For statements, add a period
          fixedText = questionText + '.';
        }
        
        questionsToFix.push({
          id: question.id,
          quizId: question.quizId,
          quizTitle: row.quizTitle || 'Unknown',
          orderIndex: question.orderIndex,
          currentText: questionText,
          fixedText: fixedText,
        });
      }
    }
    
    console.log(`Found ${questionsToFix.length} questions needing punctuation fixes\n`);
    
    if (questionsToFix.length === 0) {
      console.log('✅ All questions already have proper punctuation!');
      process.exit(0);
    }
    
    // Show preview of first 10
    console.log('Preview of questions to fix (first 10):');
    console.log('='.repeat(100));
    questionsToFix.slice(0, 10).forEach((q, idx) => {
      console.log(`\n${idx + 1}. Quiz ${q.quizId} (${q.quizTitle}), Question ${q.orderIndex}:`);
      console.log(`   Current: "${q.currentText}"`);
      console.log(`   Fixed:   "${q.fixedText}"`);
    });
    
    if (questionsToFix.length > 10) {
      console.log(`\n... and ${questionsToFix.length - 10} more questions`);
    }
    
    // Fix all questions
    console.log('\n' + '='.repeat(100));
    console.log('Fixing questions...\n');
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const question of questionsToFix) {
      try {
        await db
          .update(quizQuestions)
          .set({
            question: question.fixedText
          })
          .where(eq(quizQuestions.id, question.id));
        
        fixedCount++;
        if (fixedCount % 50 === 0) {
          console.log(`  Fixed ${fixedCount}/${questionsToFix.length} questions...`);
        }
      } catch (error: any) {
        errorCount++;
        console.error(`  ❌ Error fixing question ${question.id}: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(100));
    console.log('📊 SUMMARY');
    console.log('='.repeat(100));
    console.log(`Total questions found: ${questionsToFix.length}`);
    console.log(`✅ Successfully fixed: ${fixedCount}`);
    if (errorCount > 0) {
      console.log(`❌ Errors: ${errorCount}`);
    }
    console.log('\n✅ Punctuation fixes complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

fixPunctuation();




























