#!/usr/bin/env node

/**
 * Fix Remaining Answer Issues
 * 
 * Fixes the 10 questions that need manual review by matching answer content to options.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { db } from './server/db';
import { quizQuestions } from './shared/schema';
import { eq, and } from 'drizzle-orm';

async function fixRemaining() {
  const fixes = [
    {
      quizId: 23,
      orderIndex: 11,
      correctAnswer: 'C) The church in Antioch while they were worshiping and fasting',
    },
    {
      quizId: 23,
      orderIndex: 24,
      correctAnswer: 'D) Keep watch over themselves and the flock, expect \'wolves,\' and remember it is more blessed to give than to receive',
    },
    {
      quizId: 39,
      orderIndex: 15,
      correctAnswer: 'C) They are worthy of double honor, especially those who labor in preaching and',
    },
    {
      quizId: 39,
      orderIndex: 1,
      correctAnswer: 'C) Because of Jonah\'s disobedience',
    },
    {
      quizId: 44,
      orderIndex: 5,
      correctAnswer: 'A) Fellow citizens with the saints and members of God\'s household',
    },
    {
      quizId: 55,
      orderIndex: 13,
      correctAnswer: 'A. The Holy Spirit who would be given to believers',
    },
    {
      quizId: 55,
      orderIndex: 17,
      correctAnswer: 'A. Telling him to wash in the pool of Siloam after anointing his eyes with mud',
    },
    {
      quizId: 206,
      orderIndex: 24,
      correctAnswer: 'B) Achieving measurable results',
    },
    {
      quizId: 206,
      orderIndex: 27,
      correctAnswer: 'C) Achieving consistent results',
    },
    {
      quizId: 201,
      orderIndex: 10,
      correctAnswer: 'B) Deep friendship and loyalty',
    },
  ];
  
  // Also need to fix Quiz 206 questions 13, 16, 23, 32, 33, 42, 43, 45
  const quiz206Fixes = [
    { orderIndex: 13, correctAnswer: 'B) Friends' },
    { orderIndex: 16, correctAnswer: 'B) Abraham was God\'s friend' },
    { orderIndex: 23, correctAnswer: 'B) Bear fruit' },
    { orderIndex: 32, correctAnswer: 'C) People Development' },
    { orderIndex: 33, correctAnswer: 'D) Pinnacle' },
    { orderIndex: 42, correctAnswer: 'B) People Development' },
    { orderIndex: 43, correctAnswer: 'C) Pinnacle' },
    { orderIndex: 45, correctAnswer: 'D) Pinnacle' },
  ];
  
  console.log('🔧 Fixing remaining answer issues...\n');
  
  let fixedCount = 0;
  
  for (const fix of fixes) {
    try {
      const [question] = await db
        .select()
        .from(quizQuestions)
        .where(and(
          eq(quizQuestions.quizId, fix.quizId),
          eq(quizQuestions.orderIndex, fix.orderIndex)
        ))
        .limit(1);
      
      if (question) {
        // Verify the answer is in options
        const options = question.options as string[] || [];
        const normalizedOptions = options.map(opt => opt.trim());
        const normalizedAnswer = fix.correctAnswer.trim();
        
        // Try to find matching option
        let matchingOption = normalizedOptions.find(opt => 
          opt === normalizedAnswer || 
          opt.toLowerCase() === normalizedAnswer.toLowerCase() ||
          opt.replace(/^[A-D][.)]\s*/i, '') === normalizedAnswer.replace(/^[A-D][.)]\s*/i, '')
        );
        
        if (!matchingOption) {
          // Try matching by content
          const answerContent = normalizedAnswer.replace(/^[A-D][.)]\s*/i, '').trim();
          matchingOption = normalizedOptions.find(opt => {
            const optContent = opt.replace(/^[A-D][.)]\s*/i, '').trim();
            return optContent === answerContent || 
                   optContent.toLowerCase() === answerContent.toLowerCase() ||
                   optContent.includes(answerContent) ||
                   answerContent.includes(optContent);
          });
        }
        
        if (matchingOption) {
          await db
            .update(quizQuestions)
            .set({ correctAnswer: matchingOption })
            .where(eq(quizQuestions.id, question.id));
          
          fixedCount++;
          console.log(`✅ Fixed Quiz ${fix.quizId}, Question ${fix.orderIndex}`);
        } else {
          // Use the provided answer as-is
          await db
            .update(quizQuestions)
            .set({ correctAnswer: fix.correctAnswer })
            .where(eq(quizQuestions.id, question.id));
          
          fixedCount++;
          console.log(`✅ Fixed Quiz ${fix.quizId}, Question ${fix.orderIndex} (using provided answer)`);
        }
      }
    } catch (error: any) {
      console.error(`❌ Error fixing Quiz ${fix.quizId}, Q${fix.orderIndex}: ${error.message}`);
    }
  }
  
  // Fix Quiz 206 additional questions
  for (const fix of quiz206Fixes) {
    try {
      const [question] = await db
        .select()
        .from(quizQuestions)
        .where(and(
          eq(quizQuestions.quizId, 206),
          eq(quizQuestions.orderIndex, fix.orderIndex)
        ))
        .limit(1);
      
      if (question) {
        const options = question.options as string[] || [];
        const normalizedOptions = options.map(opt => opt.trim());
        
        // Find matching option
        let matchingOption = normalizedOptions.find(opt => {
          const optContent = opt.replace(/^[A-D][.)]\s*/i, '').trim().toLowerCase();
          const answerContent = fix.correctAnswer.replace(/^[A-D][.)]\s*/i, '').trim().toLowerCase();
          return optContent === answerContent || 
                 optContent.includes(answerContent) ||
                 answerContent.includes(optContent);
        });
        
        if (matchingOption) {
          await db
            .update(quizQuestions)
            .set({ correctAnswer: matchingOption })
            .where(eq(quizQuestions.id, question.id));
          
          fixedCount++;
          console.log(`✅ Fixed Quiz 206, Question ${fix.orderIndex}`);
        }
      }
    } catch (error: any) {
      console.error(`❌ Error fixing Quiz 206, Q${fix.orderIndex}: ${error.message}`);
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} remaining answer issues`);
  process.exit(0);
}

fixRemaining();




























