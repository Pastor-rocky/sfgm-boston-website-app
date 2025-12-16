#!/usr/bin/env node

/**
 * Properly Fix Same-Quiz Duplicates
 * 
 * Instead of just adding "(Duplicate)", we should actually remove or properly handle them.
 * Let's check what Quiz 73 looks like and fix it properly.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { db } from './server/db';
import { quizQuestions, quizzes } from './shared/schema';
import { eq, and, asc } from 'drizzle-orm';

async function fixSameQuizDuplicates() {
  try {
    console.log('🔍 Checking Quiz 73 for duplicate questions...\n');
    
    // Get all questions from Quiz 73
    const questions = await db
      .select({
        question: quizQuestions,
        quizTitle: quizzes.title,
      })
      .from(quizQuestions)
      .leftJoin(quizzes, eq(quizQuestions.quizId, quizzes.id))
      .where(eq(quizQuestions.quizId, 73))
      .orderBy(asc(quizQuestions.orderIndex));
    
    console.log(`Found ${questions.length} questions in Quiz 73\n`);
    
    // Find duplicates
    const questionMap = new Map<string, typeof questions>();
    const duplicates: Array<{ text: string; questions: typeof questions }> = [];
    
    for (const row of questions) {
      const normalizedText = row.question.question.trim().toLowerCase();
      
      if (!questionMap.has(normalizedText)) {
        questionMap.set(normalizedText, []);
      }
      
      questionMap.get(normalizedText)!.push(row);
    }
    
    for (const [text, qs] of questionMap.entries()) {
      if (qs.length > 1) {
        duplicates.push({
          text: qs[0].question.question.trim(),
          questions: qs,
        });
      }
    }
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicates found (they may have been fixed already)');
      process.exit(0);
    }
    
    console.log(`Found ${duplicates.length} duplicate sets\n`);
    
    // For each duplicate, we should remove the later occurrences
    // But first, let's see what they look like
    for (const dup of duplicates) {
      console.log(`\nDuplicate: "${dup.text}"`);
      console.log(`Appears ${dup.questions.length} times:`);
      dup.questions.forEach(q => {
        console.log(`  - Question ${q.question.orderIndex} [ID: ${q.question.id}]`);
        if (q.question.question.includes('(Duplicate)')) {
          console.log(`    ⚠️  Already marked as duplicate`);
        }
      });
    }
    
    // Remove the "(Duplicate)" suffix and delete the duplicate questions
    // Keep the first occurrence (lowest orderIndex)
    let deletedCount = 0;
    
    for (const dup of duplicates) {
      const sorted = [...dup.questions].sort((a, b) => a.question.orderIndex - b.question.orderIndex);
      const firstQuestion = sorted[0];
      
      // Remove "(Duplicate)" from first if it has it
      if (firstQuestion.question.question.includes('(Duplicate)')) {
        const cleanText = firstQuestion.question.question.replace(/\s*\(Duplicate\)\s*$/i, '');
        await db
          .update(quizQuestions)
          .set({ question: cleanText })
          .where(eq(quizQuestions.id, firstQuestion.question.id));
        console.log(`\n✅ Cleaned up first occurrence (Question ${firstQuestion.question.orderIndex})`);
      }
      
      // Delete the duplicate occurrences
      for (let i = 1; i < sorted.length; i++) {
        const dupQuestion = sorted[i];
        await db
          .delete(quizQuestions)
          .where(eq(quizQuestions.id, dupQuestion.question.id));
        deletedCount++;
        console.log(`✅ Deleted duplicate Question ${dupQuestion.question.orderIndex} [ID: ${dupQuestion.question.id}]`);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Deleted ${deletedCount} duplicate questions`);
    console.log(`   ✅ Quiz 73 duplicates fixed!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

fixSameQuizDuplicates();




























