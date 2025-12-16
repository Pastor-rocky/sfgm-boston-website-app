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

async function fixLast2() {
  // Quiz 39, Q1 - use option C (index 2)
  const [q39] = await db
    .select()
    .from(quizQuestions)
    .where(and(eq(quizQuestions.quizId, 39), eq(quizQuestions.orderIndex, 1)))
    .limit(1);
  
  if (q39 && q39.options && Array.isArray(q39.options)) {
    const correctOption = q39.options[2]; // "Because of Jonah's disobedience"
    await db
      .update(quizQuestions)
      .set({ correctAnswer: correctOption })
      .where(eq(quizQuestions.id, q39.id));
    console.log('✅ Fixed Quiz 39, Question 1');
  }
  
  // Quiz 44, Q5 - use option A (index 0)
  const [q44] = await db
    .select()
    .from(quizQuestions)
    .where(and(eq(quizQuestions.quizId, 44), eq(quizQuestions.orderIndex, 5)))
    .limit(1);
  
  if (q44 && q44.options && Array.isArray(q44.options)) {
    const correctOption = q44.options[0]; // "Fellow citizens with the saints and members of God's household"
    await db
      .update(quizQuestions)
      .set({ correctAnswer: correctOption })
      .where(eq(quizQuestions.id, q44.id));
    console.log('✅ Fixed Quiz 44, Question 5');
  }
  
  console.log('\n🎉 All issues fixed!');
  process.exit(0);
}

fixLast2();




























