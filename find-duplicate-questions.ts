#!/usr/bin/env node

/**
 * Find Duplicate Quiz Questions
 * 
 * This script finds all duplicate questions across quizzes and displays them
 * for review to determine if they should be kept or fixed.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { db } from './server/db';
import { quizQuestions, quizzes } from './shared/schema';
import { eq, asc } from 'drizzle-orm';

interface QuestionInfo {
  id: number;
  quizId: number;
  quizTitle: string;
  orderIndex: number;
  questionText: string;
  type: string;
  correctAnswer: string;
}

async function findDuplicates() {
  try {
    console.log('🔍 Finding duplicate questions across all quizzes...\n');
    
    // Get all questions with quiz info
    const allQuestions = await db
      .select({
        question: quizQuestions,
        quizTitle: quizzes.title,
      })
      .from(quizQuestions)
      .leftJoin(quizzes, eq(quizQuestions.quizId, quizzes.id))
      .orderBy(asc(quizQuestions.quizId), asc(quizQuestions.orderIndex));
    
    // Group questions by text (normalized)
    const questionMap = new Map<string, QuestionInfo[]>();
    
    for (const row of allQuestions) {
      const question = row.question;
      if (!question.question) continue;
      
      // Normalize question text (trim, lowercase for comparison)
      const normalizedText = question.question.trim().toLowerCase();
      
      if (!questionMap.has(normalizedText)) {
        questionMap.set(normalizedText, []);
      }
      
      questionMap.get(normalizedText)!.push({
        id: question.id,
        quizId: question.quizId,
        quizTitle: row.quizTitle || 'Unknown',
        orderIndex: question.orderIndex,
        questionText: question.question.trim(),
        type: question.type,
        correctAnswer: question.correctAnswer || '',
      });
    }
    
    // Find duplicates (groups with more than 1 question)
    const duplicates: Array<{ text: string; questions: QuestionInfo[] }> = [];
    
    for (const [normalizedText, questions] of questionMap.entries()) {
      if (questions.length > 1) {
        duplicates.push({
          text: questions[0].questionText, // Use first question's original text
          questions: questions,
        });
      }
    }
    
    console.log(`Found ${duplicates.length} sets of duplicate questions\n`);
    console.log('='.repeat(100));
    
    // Sort by number of duplicates (most duplicates first)
    duplicates.sort((a, b) => b.questions.length - a.questions.length);
    
    // Display duplicates
    for (let i = 0; i < duplicates.length; i++) {
      const dup = duplicates[i];
      console.log(`\n${i + 1}. Duplicate Question (appears ${dup.questions.length} times):`);
      console.log(`   "${dup.text}"`);
      console.log(`   Type: ${dup.questions[0].type}`);
      console.log(`   Correct Answer: "${dup.questions[0].correctAnswer}"`);
      console.log(`\n   Found in:`);
      
      dup.questions.forEach((q, idx) => {
        console.log(`   ${idx + 1}. Quiz ${q.quizId} (${q.quizTitle}), Question ${q.orderIndex} [ID: ${q.id}]`);
      });
      
      // Check if all have same correct answer
      const allSameAnswer = dup.questions.every(q => 
        q.correctAnswer === dup.questions[0].correctAnswer
      );
      
      if (!allSameAnswer) {
        console.log(`   ⚠️  WARNING: These duplicates have DIFFERENT correct answers!`);
        dup.questions.forEach(q => {
          console.log(`      - Quiz ${q.quizId}, Q${q.orderIndex}: "${q.correctAnswer}"`);
        });
      }
      
      console.log('\n' + '-'.repeat(100));
    }
    
    // Summary
    console.log('\n' + '='.repeat(100));
    console.log('📊 SUMMARY');
    console.log('='.repeat(100));
    console.log(`Total duplicate question sets: ${duplicates.length}`);
    console.log(`Total questions that are duplicates: ${duplicates.reduce((sum, d) => sum + d.questions.length, 0)}`);
    
    // Count questions with different answers
    const withDifferentAnswers = duplicates.filter(d => {
      const firstAnswer = d.questions[0].correctAnswer;
      return !d.questions.every(q => q.correctAnswer === firstAnswer);
    });
    
    if (withDifferentAnswers.length > 0) {
      console.log(`\n⚠️  CRITICAL: ${withDifferentAnswers.length} duplicate sets have DIFFERENT correct answers!`);
      console.log('   These need to be reviewed and fixed immediately.');
    }
    
    console.log('\n💡 Note: Some duplicates may be intentional (same question in different quizzes).');
    console.log('   Review each one to determine if it should be kept or made unique.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

findDuplicates();




























