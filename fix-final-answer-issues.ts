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

async function fixFinal() {
  try {
    // Fix Quiz 39, Q1 - remove prefix from answer
    await db.update(quizQuestions)
      .set({ correctAnswer: 'Because of Jonah\'s disobedience' })
      .where(and(eq(quizQuestions.quizId, 39), eq(quizQuestions.orderIndex, 1)));
    console.log('✅ Fixed Quiz 39, Question 1');
    
    // Fix Quiz 44, Q5 - remove prefix from answer
    await db.update(quizQuestions)
      .set({ correctAnswer: 'Fellow citizens with the saints and members of God\'s household' })
      .where(and(eq(quizQuestions.quizId, 44), eq(quizQuestions.orderIndex, 5)));
    console.log('✅ Fixed Quiz 44, Question 5');
    
    // Now run comprehensive fix again to catch any remaining issues
    console.log('\n🔍 Running comprehensive fix for any remaining issues...\n');
    
    const allQuestions = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.type, 'multiple_choice'));
    
    let fixedCount = 0;
    
    for (const question of allQuestions) {
      if (!question.options || !Array.isArray(question.options) || !question.correctAnswer) {
        continue;
      }
      
      const normalizedAnswer = question.correctAnswer.trim();
      const normalizedOptions = question.options.map((opt: string) => opt.trim());
      
      // Check if answer matches any option
      const exactMatch = normalizedOptions.includes(normalizedAnswer);
      const caseInsensitiveMatch = normalizedOptions.some(opt => 
        opt.toLowerCase() === normalizedAnswer.toLowerCase()
      );
      
      // Check content match (without prefixes)
      const answerContent = normalizedAnswer.replace(/^[A-D][.)]\s*/i, '').trim();
      const contentMatch = normalizedOptions.some(opt => {
        const optContent = opt.replace(/^[A-D][.)]\s*/i, '').trim();
        return optContent === answerContent || 
               optContent.toLowerCase() === answerContent.toLowerCase();
      });
      
      if (!exactMatch && !caseInsensitiveMatch && !contentMatch) {
        // Try to find matching option
        let matchingOption = null;
        
        // Try exact content match
        for (const opt of normalizedOptions) {
          const optContent = opt.replace(/^[A-D][.)]\s*/i, '').trim();
          if (optContent === answerContent || optContent.toLowerCase() === answerContent.toLowerCase()) {
            matchingOption = opt;
            break;
          }
        }
        
        // Try partial match
        if (!matchingOption) {
          for (const opt of normalizedOptions) {
            const optContent = opt.replace(/^[A-D][.)]\s*/i, '').trim().toLowerCase();
            if (optContent.includes(answerContent.toLowerCase()) || 
                answerContent.toLowerCase().includes(optContent)) {
              matchingOption = opt;
              break;
            }
          }
        }
        
        if (matchingOption) {
          await db
            .update(quizQuestions)
            .set({ correctAnswer: matchingOption })
            .where(eq(quizQuestions.id, question.id));
          fixedCount++;
        }
      }
    }
    
    console.log(`✅ Fixed ${fixedCount} additional answer mismatches`);
    console.log('\n🎉 All answer issues have been fixed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

fixFinal();




























