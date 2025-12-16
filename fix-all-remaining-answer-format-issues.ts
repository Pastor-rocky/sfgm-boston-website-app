#!/usr/bin/env node

/**
 * Fix All Remaining Answer Format Issues Across All Quizzes
 * 
 * This script fixes answer format mismatches where answers have prefixes
 * but options don't, or vice versa.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { db } from './server/db';
import { quizQuestions } from './shared/schema';
import { eq } from 'drizzle-orm';

async function fixAllFormatIssues() {
  try {
    console.log('🔧 Fixing all answer format issues across all quizzes...\n');
    
    const allQuestions = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.type, 'multiple_choice'))
      .orderBy(quizQuestions.quizId, quizQuestions.orderIndex);
    
    let fixedCount = 0;
    const issues: Array<{ quizId: number; orderIndex: number; answer: string; options: string[] }> = [];
    
    for (const question of allQuestions) {
      if (!question.options || !Array.isArray(question.options) || !question.correctAnswer) {
        continue;
      }
      
      const normalizedAnswer = question.correctAnswer.trim();
      const normalizedOptions = question.options.map((opt: string) => opt.trim());
      
      // Check if answer is in options (exact match)
      const exactMatch = normalizedOptions.includes(normalizedAnswer);
      if (exactMatch) {
        continue; // Already correct
      }
      
      // Check case-insensitive match
      const caseInsensitiveMatch = normalizedOptions.find(opt => 
        opt.toLowerCase() === normalizedAnswer.toLowerCase()
      );
      if (caseInsensitiveMatch) {
        await db
          .update(quizQuestions)
          .set({ correctAnswer: caseInsensitiveMatch })
          .where(eq(quizQuestions.id, question.id));
        fixedCount++;
        continue;
      }
      
      // Check content match (without prefixes)
      const answerContent = normalizedAnswer.replace(/^[A-D][.)]\s*/i, '').trim();
      const contentMatch = normalizedOptions.find(opt => {
        const optContent = opt.replace(/^[A-D][.)]\s*/i, '').trim();
        return optContent === answerContent || 
               optContent.toLowerCase() === answerContent.toLowerCase();
      });
      
      if (contentMatch) {
        await db
          .update(quizQuestions)
          .set({ correctAnswer: contentMatch })
          .where(eq(quizQuestions.id, question.id));
        fixedCount++;
        continue;
      }
      
      // Try partial match
      const partialMatch = normalizedOptions.find(opt => {
        const optContent = opt.replace(/^[A-D][.)]\s*/i, '').trim().toLowerCase();
        const answerContentLower = answerContent.toLowerCase();
        return optContent.includes(answerContentLower) || 
               answerContentLower.includes(optContent) ||
               optContent === answerContentLower ||
               opt.toLowerCase() === normalizedAnswer.toLowerCase();
      });
      
      if (partialMatch) {
        await db
          .update(quizQuestions)
          .set({ correctAnswer: partialMatch })
          .where(eq(quizQuestions.id, question.id));
        fixedCount++;
        continue;
      }
      
      // If still no match, record for manual review
      issues.push({
        quizId: question.quizId,
        orderIndex: question.orderIndex,
        answer: normalizedAnswer,
        options: normalizedOptions,
      });
    }
    
    console.log(`✅ Fixed ${fixedCount} answer format issues`);
    
    if (issues.length > 0) {
      console.log(`\n⚠️  ${issues.length} questions still need manual review:`);
      issues.slice(0, 10).forEach(issue => {
        console.log(`\n  Quiz ${issue.quizId}, Question ${issue.orderIndex}:`);
        console.log(`    Answer: "${issue.answer}"`);
        console.log(`    Options: ${issue.options.join(', ')}`);
      });
      if (issues.length > 10) {
        console.log(`\n  ... and ${issues.length - 10} more`);
      }
    } else {
      console.log('\n🎉 All answer format issues have been fixed!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

fixAllFormatIssues();




























