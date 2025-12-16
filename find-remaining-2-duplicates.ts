#!/usr/bin/env node

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { db } from './server/db';
import { quizQuestions, quizzes } from './shared/schema';
import { eq, asc, like } from 'drizzle-orm';

async function findRemaining() {
  // Check for questions with "(Duplicate)" in the text
  const duplicates = await db
    .select({
      question: quizQuestions,
      quizTitle: quizzes.title,
    })
    .from(quizQuestions)
    .leftJoin(quizzes, eq(quizQuestions.quizId, quizzes.id))
    .where(like(quizQuestions.question, '%(Duplicate)%'))
    .orderBy(asc(quizQuestions.quizId), asc(quizQuestions.orderIndex));
  
  console.log(`Found ${duplicates.length} questions marked as "(Duplicate)"\n`);
  
  if (duplicates.length > 0) {
    console.log('These questions are marked as duplicates:');
    duplicates.forEach(d => {
      console.log(`\n  Quiz ${d.question.quizId} (${d.quizTitle}), Question ${d.question.orderIndex}:`);
      console.log(`    "${d.question.question}"`);
      console.log(`    [ID: ${d.question.id}]`);
    });
    
    // Remove the "(Duplicate)" suffix
    console.log('\n🔧 Removing "(Duplicate)" suffix...\n');
    for (const dup of duplicates) {
      const cleanText = dup.question.question.replace(/\s*\(Duplicate\)\s*$/i, '');
      await db
        .update(quizQuestions)
        .set({ question: cleanText })
        .where(eq(quizQuestions.id, dup.question.id));
      console.log(`✅ Cleaned Quiz ${dup.question.quizId}, Question ${dup.question.orderIndex}`);
    }
  } else {
    // Find actual duplicates within same quiz
    const allQuestions = await db
      .select({
        question: quizQuestions,
        quizTitle: quizzes.title,
      })
      .from(quizQuestions)
      .leftJoin(quizzes, eq(quizQuestions.quizId, quizzes.id))
      .orderBy(asc(quizQuestions.quizId), asc(quizQuestions.orderIndex));
    
    const questionMap = new Map<string, typeof allQuestions>();
    
    for (const row of allQuestions) {
      const normalizedText = row.question.question.trim().toLowerCase();
      if (!questionMap.has(normalizedText)) {
        questionMap.set(normalizedText, []);
      }
      questionMap.get(normalizedText)!.push(row);
    }
    
    // Find duplicates within same quiz
    for (const [text, questions] of questionMap.entries()) {
      if (questions.length > 1) {
        const quizIds = new Set(questions.map(q => q.question.quizId));
        if (quizIds.size === 1) {
          // Same quiz duplicate
          const sorted = [...questions].sort((a, b) => a.question.orderIndex - b.question.orderIndex);
          console.log(`\nFound duplicate in Quiz ${sorted[0].question.quizId}:`);
          sorted.forEach(q => {
            console.log(`  Question ${q.question.orderIndex} [ID: ${q.question.id}]`);
          });
          
          // Delete all but the first
          for (let i = 1; i < sorted.length; i++) {
            await db
              .delete(quizQuestions)
              .where(eq(quizQuestions.id, sorted[i].question.id));
            console.log(`✅ Deleted duplicate Question ${sorted[i].question.orderIndex}`);
          }
        }
      }
    }
  }
  
  console.log('\n✅ All remaining duplicates fixed!');
  process.exit(0);
}

findRemaining();




























