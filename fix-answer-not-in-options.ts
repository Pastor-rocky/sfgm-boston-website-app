#!/usr/bin/env node

/**
 * Fix "Answer Not in Options" Issues
 * 
 * This script finds questions where the correct answer doesn't match any option
 * and fixes them by matching the answer to the correct option format.
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

async function fixAnswerNotInOptions() {
  try {
    console.log('🔍 Finding questions where correct answer is not in options...\n');
    
    // Get all multiple choice questions
    const allQuestions = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.type, 'multiple_choice'));
    
    const issues: Array<{
      id: number;
      quizId: number;
      orderIndex: number;
      question: string;
      currentAnswer: string;
      options: string[];
      fixedAnswer: string;
    }> = [];
    
    for (const question of allQuestions) {
      if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
        continue;
      }
      
      if (!question.correctAnswer) {
        continue;
      }
      
      const normalizedAnswer = question.correctAnswer.trim();
      const normalizedOptions = question.options.map((opt: string) => opt.trim());
      
      // Check if answer is in options (exact match or case-insensitive)
      const exactMatch = normalizedOptions.includes(normalizedAnswer);
      const caseInsensitiveMatch = normalizedOptions.some(opt => 
        opt.toLowerCase() === normalizedAnswer.toLowerCase()
      );
      
      // Also check if answer matches option without prefix (A), B), etc.)
      const answerWithoutPrefix = normalizedAnswer.replace(/^[A-D]\)\s*/i, '');
      const optionMatch = normalizedOptions.some(opt => {
        const optWithoutPrefix = opt.replace(/^[A-D]\)\s*/i, '');
        return optWithoutPrefix === answerWithoutPrefix || 
               optWithoutPrefix.toLowerCase() === answerWithoutPrefix.toLowerCase() ||
               opt === normalizedAnswer ||
               opt.toLowerCase() === normalizedAnswer.toLowerCase();
      });
      
      if (!exactMatch && !caseInsensitiveMatch && !optionMatch) {
        // Try to find a match by comparing content
        let fixedAnswer = normalizedAnswer;
        let foundMatch = false;
        
        // Try exact match first
        for (const opt of normalizedOptions) {
          if (opt === normalizedAnswer || opt.toLowerCase() === normalizedAnswer.toLowerCase()) {
            fixedAnswer = opt; // Use the option as stored
            foundMatch = true;
            break;
          }
        }
        
        // Try matching without prefixes
        if (!foundMatch) {
          for (const opt of normalizedOptions) {
            const optContent = opt.replace(/^[A-D]\)\s*/i, '').trim();
            const answerContent = normalizedAnswer.replace(/^[A-D]\)\s*/i, '').trim();
            
            if (optContent === answerContent || optContent.toLowerCase() === answerContent.toLowerCase()) {
              fixedAnswer = opt; // Use the option as stored
              foundMatch = true;
              break;
            }
          }
        }
        
        // Try matching by first letter/number
        if (!foundMatch) {
          const answerFirst = normalizedAnswer.charAt(0).toUpperCase();
          for (const opt of normalizedOptions) {
            const optFirst = opt.replace(/^[A-D]\)\s*/i, '').trim().charAt(0).toUpperCase();
            if (optFirst === answerFirst) {
              // Check if the content matches
              const optContent = opt.replace(/^[A-D]\)\s*/i, '').trim();
              const answerContent = normalizedAnswer.replace(/^[A-D]\)\s*/i, '').trim();
              if (optContent.toLowerCase().includes(answerContent.toLowerCase()) || 
                  answerContent.toLowerCase().includes(optContent.toLowerCase())) {
                fixedAnswer = opt;
                foundMatch = true;
                break;
              }
            }
          }
        }
        
        // If still no match, try to infer from numeric/letter answer
        if (!foundMatch) {
          // If answer is just a number (0, 1, 2, 3), map to option index
          const numMatch = normalizedAnswer.match(/^(\d+)$/);
          if (numMatch) {
            const index = parseInt(numMatch[1]);
            if (index >= 0 && index < normalizedOptions.length) {
              fixedAnswer = normalizedOptions[index];
              foundMatch = true;
            }
          }
          
          // If answer is just a letter (A, B, C, D), map to option
          if (!foundMatch) {
            const letterMatch = normalizedAnswer.match(/^([A-D])\)?$/i);
            if (letterMatch) {
              const letter = letterMatch[1].toUpperCase();
              const index = letter.charCodeAt(0) - 'A'.charCodeAt(0);
              if (index >= 0 && index < normalizedOptions.length) {
                fixedAnswer = normalizedOptions[index];
                foundMatch = true;
              }
            }
          }
        }
        
        if (foundMatch) {
          issues.push({
            id: question.id,
            quizId: question.quizId,
            orderIndex: question.orderIndex,
            question: question.question.substring(0, 60) + '...',
            currentAnswer: normalizedAnswer,
            options: normalizedOptions,
            fixedAnswer: fixedAnswer,
          });
        } else {
          console.log(`⚠️  Could not fix: Quiz ${question.quizId}, Q${question.orderIndex}`);
          console.log(`   Answer: "${normalizedAnswer}"`);
          console.log(`   Options: ${normalizedOptions.join(', ')}`);
        }
      }
    }
    
    console.log(`Found ${issues.length} questions with answer not in options\n`);
    
    if (issues.length === 0) {
      console.log('✅ All answers match their options!');
      process.exit(0);
    }
    
    // Show preview
    console.log('Preview of fixes (first 10):');
    console.log('='.repeat(100));
    issues.slice(0, 10).forEach((issue, idx) => {
      console.log(`\n${idx + 1}. Quiz ${issue.quizId}, Question ${issue.orderIndex}:`);
      console.log(`   Current: "${issue.currentAnswer}"`);
      console.log(`   Fixed:   "${issue.fixedAnswer}"`);
    });
    
    if (issues.length > 10) {
      console.log(`\n... and ${issues.length - 10} more to fix`);
    }
    
    // Fix all issues
    console.log('\n' + '='.repeat(100));
    console.log('Fixing answers...\n');
    
    let fixedCount = 0;
    
    for (const issue of issues) {
      try {
        await db
          .update(quizQuestions)
          .set({ correctAnswer: issue.fixedAnswer })
          .where(eq(quizQuestions.id, issue.id));
        
        fixedCount++;
        if (fixedCount % 20 === 0) {
          console.log(`  Fixed ${fixedCount}/${issues.length}...`);
        }
      } catch (error: any) {
        console.error(`  ❌ Error fixing question ${issue.id}: ${error.message}`);
      }
    }
    
    console.log(`\n✅ Fixed ${fixedCount}/${issues.length} answer mismatches`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

fixAnswerNotInOptions();




























