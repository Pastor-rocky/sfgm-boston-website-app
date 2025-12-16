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

async function verifyAndFix() {
  const fixes = [
    { quizId: 39, orderIndex: 1 },
    { quizId: 44, orderIndex: 5 },
  ];
  
  for (const fix of fixes) {
    const [question] = await db
      .select()
      .from(quizQuestions)
      .where(and(
        eq(quizQuestions.quizId, fix.quizId),
        eq(quizQuestions.orderIndex, fix.orderIndex)
      ))
      .limit(1);
    
    if (question) {
      const options = question.options as string[] || [];
      const answer = question.correctAnswer?.trim() || '';
      
      console.log(`\nQuiz ${fix.quizId}, Question ${fix.orderIndex}:`);
      console.log(`Answer: "${answer}"`);
      console.log(`Options:`, options);
      
      // Find exact match
      const exactMatch = options.find(opt => opt.trim() === answer);
      if (exactMatch) {
        console.log(`✅ Exact match found: "${exactMatch}"`);
        await db
          .update(quizQuestions)
          .set({ correctAnswer: exactMatch })
          .where(eq(quizQuestions.id, question.id));
        console.log(`   Updated to use exact match`);
      } else {
        // Try case-insensitive
        const caseMatch = options.find(opt => opt.trim().toLowerCase() === answer.toLowerCase());
        if (caseMatch) {
          console.log(`✅ Case-insensitive match found: "${caseMatch}"`);
          await db
            .update(quizQuestions)
            .set({ correctAnswer: caseMatch })
            .where(eq(quizQuestions.id, question.id));
          console.log(`   Updated to use case match`);
        } else {
          console.log(`⚠️  No match found - may need manual review`);
        }
      }
    }
  }
  
  console.log('\n✅ Verification complete');
  process.exit(0);
}

verifyAndFix();




























