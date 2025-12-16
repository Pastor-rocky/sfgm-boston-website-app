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

async function fixQuestion() {
  try {
    // The question is about who asked for John the Baptist's head
    // Based on the answer options, this is clearly about the biblical story
    // where Herodias's daughter asked for John the Baptist's head
    
    const newQuestionText = "Who asked for John the Baptist's head on a platter?";
    
    const result = await db
      .update(quizQuestions)
      .set({
        question: newQuestionText
      })
      .where(and(
        eq(quizQuestions.quizId, 67),
        eq(quizQuestions.orderIndex, 20)
      ))
      .returning();
    
    if (result.length > 0) {
      console.log('✅ Successfully updated Quiz 67, Question 20');
      console.log(`   Old text: "?"`);
      console.log(`   New text: "${newQuestionText}"`);
    } else {
      console.log('❌ No question found to update');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

fixQuestion();




























