#!/usr/bin/env node

/**
 * Fix Quiz 206 Answer Format Issues
 * 
 * Quiz 206 has answers with "B) " prefix but options don't have prefixes
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

async function fixQuiz206() {
  try {
    console.log('🔧 Fixing Quiz 206 answer format issues...\n');
    
    const questions = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, 206))
      .orderBy(quizQuestions.orderIndex);
    
    let fixedCount = 0;
    
    for (const question of questions) {
      if (!question.options || !Array.isArray(question.options) || !question.correctAnswer) {
        continue;
      }
      
      const normalizedAnswer = question.correctAnswer.trim();
      const normalizedOptions = question.options.map((opt: string) => opt.trim());
      
      // Check if answer has prefix but options don't
      const answerHasPrefix = /^[A-D][.)]\s/.test(normalizedAnswer);
      const optionsHavePrefix = normalizedOptions.some(opt => /^[A-D][.)]\s/.test(opt));
      
      if (answerHasPrefix && !optionsHavePrefix) {
        // Remove prefix from answer and match to option
        const answerContent = normalizedAnswer.replace(/^[A-D][.)]\s*/i, '').trim();
        const matchingOption = normalizedOptions.find(opt => 
          opt === answerContent || 
          opt.toLowerCase() === answerContent.toLowerCase()
        );
        
        if (matchingOption) {
          await db
            .update(quizQuestions)
            .set({ correctAnswer: matchingOption })
            .where(eq(quizQuestions.id, question.id));
          fixedCount++;
          console.log(`✅ Fixed Question ${question.orderIndex}: "${normalizedAnswer}" -> "${matchingOption}"`);
        }
      } else if (!answerHasPrefix && optionsHavePrefix) {
        // Answer doesn't have prefix but options do - find matching option
        const matchingOption = normalizedOptions.find(opt => {
          const optContent = opt.replace(/^[A-D][.)]\s*/i, '').trim();
          return optContent === normalizedAnswer || 
                 optContent.toLowerCase() === normalizedAnswer.toLowerCase();
        });
        
        if (matchingOption) {
          await db
            .update(quizQuestions)
            .set({ correctAnswer: matchingOption })
            .where(eq(quizQuestions.id, question.id));
          fixedCount++;
          console.log(`✅ Fixed Question ${question.orderIndex}: "${normalizedAnswer}" -> "${matchingOption}"`);
        }
      }
    }
    
    console.log(`\n✅ Fixed ${fixedCount} answer format issues in Quiz 206`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

fixQuiz206();




























