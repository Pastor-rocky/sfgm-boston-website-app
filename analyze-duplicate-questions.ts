#!/usr/bin/env node

/**
 * Analyze Duplicate Questions by Category
 * 
 * This script categorizes duplicate questions to help determine:
 * 1. Which are intentional (same question in different contexts)
 * 2. Which are problematic (same question with different answers)
 * 3. Which need to be made unique
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { db } from './server/db';
import { quizQuestions, quizzes, courseModules } from './shared/schema';
import { eq, asc } from 'drizzle-orm';

interface QuestionInfo {
  id: number;
  quizId: number;
  quizTitle: string;
  courseId: number | null;
  orderIndex: number;
  questionText: string;
  type: string;
  correctAnswer: string;
}

interface DuplicateSet {
  text: string;
  questions: QuestionInfo[];
  hasDifferentAnswers: boolean;
  category: string;
}

async function analyzeDuplicates() {
  try {
    console.log('🔍 Analyzing duplicate questions by category...\n');
    
    // Get all questions with quiz and course info
    const allQuestions = await db
      .select({
        question: quizQuestions,
        quizTitle: quizzes.title,
        courseId: courseModules.courseId,
      })
      .from(quizQuestions)
      .leftJoin(quizzes, eq(quizQuestions.quizId, quizzes.id))
      .leftJoin(courseModules, eq(quizzes.moduleId, courseModules.id))
      .orderBy(asc(quizQuestions.quizId), asc(quizQuestions.orderIndex));
    
    // Group questions by text
    const questionMap = new Map<string, QuestionInfo[]>();
    
    for (const row of allQuestions) {
      const question = row.question;
      if (!question.question) continue;
      
      const normalizedText = question.question.trim().toLowerCase();
      
      if (!questionMap.has(normalizedText)) {
        questionMap.set(normalizedText, []);
      }
      
      questionMap.get(normalizedText)!.push({
        id: question.id,
        quizId: question.quizId,
        quizTitle: row.quizTitle || 'Unknown',
        courseId: row.courseId,
        orderIndex: question.orderIndex,
        questionText: question.question.trim(),
        type: question.type,
        correctAnswer: question.correctAnswer || '',
      });
    }
    
    // Find duplicates
    const duplicates: DuplicateSet[] = [];
    
    for (const [normalizedText, questions] of questionMap.entries()) {
      if (questions.length > 1) {
        const firstAnswer = questions[0].correctAnswer;
        const hasDifferentAnswers = !questions.every(q => q.correctAnswer === firstAnswer);
        
        // Categorize
        let category = 'Unknown';
        const courseIds = new Set(questions.map(q => q.courseId).filter(id => id !== null));
        const quizIds = questions.map(q => q.quizId);
        
        if (hasDifferentAnswers) {
          category = 'CRITICAL: Different Answers';
        } else if (courseIds.size > 1) {
          category = 'Cross-Course Duplicate';
        } else if (questions.some(q => q.quizTitle?.toLowerCase().includes('final'))) {
          category = 'Weekly + Final Exam';
        } else {
          category = 'Same Course, Different Quiz';
        }
        
        duplicates.push({
          text: questions[0].questionText,
          questions: questions,
          hasDifferentAnswers: hasDifferentAnswers,
          category: category,
        });
      }
    }
    
    // Sort by category and severity
    duplicates.sort((a, b) => {
      if (a.hasDifferentAnswers && !b.hasDifferentAnswers) return -1;
      if (!a.hasDifferentAnswers && b.hasDifferentAnswers) return 1;
      return a.category.localeCompare(b.category);
    });
    
    // Group by category
    const byCategory: { [category: string]: DuplicateSet[] } = {};
    duplicates.forEach(dup => {
      if (!byCategory[dup.category]) {
        byCategory[dup.category] = [];
      }
      byCategory[dup.category].push(dup);
    });
    
    console.log('='.repeat(100));
    console.log('📊 DUPLICATE QUESTIONS ANALYSIS BY CATEGORY');
    console.log('='.repeat(100) + '\n');
    
    // Report by category
    for (const category of Object.keys(byCategory).sort()) {
      const sets = byCategory[category];
      const totalQuestions = sets.reduce((sum, s) => sum + s.questions.length, 0);
      const criticalCount = sets.filter(s => s.hasDifferentAnswers).length;
      
      console.log(`\n📁 ${category}`);
      console.log(`   Sets: ${sets.length} | Total Questions: ${totalQuestions}`);
      if (criticalCount > 0) {
        console.log(`   ⚠️  ${criticalCount} sets have DIFFERENT correct answers!`);
      }
      console.log('-'.repeat(100));
      
      // Show first 5 examples
      sets.slice(0, 5).forEach((dup, idx) => {
        console.log(`\n   Example ${idx + 1}: "${dup.text.substring(0, 80)}${dup.text.length > 80 ? '...' : ''}"`);
        console.log(`   Appears ${dup.questions.length} times:`);
        dup.questions.forEach(q => {
          console.log(`     - Quiz ${q.quizId} (${q.quizTitle}), Q${q.orderIndex} [Course: ${q.courseId || 'Unknown'}]`);
        });
        if (dup.hasDifferentAnswers) {
          console.log(`   ⚠️  DIFFERENT ANSWERS:`);
          dup.questions.forEach(q => {
            console.log(`      Quiz ${q.quizId}, Q${q.orderIndex}: "${q.correctAnswer}"`);
          });
        }
      });
      
      if (sets.length > 5) {
        console.log(`\n   ... and ${sets.length - 5} more sets in this category`);
      }
    }
    
    // Overall summary
    console.log('\n' + '='.repeat(100));
    console.log('📈 OVERALL SUMMARY');
    console.log('='.repeat(100));
    console.log(`Total duplicate sets: ${duplicates.length}`);
    console.log(`Total duplicate questions: ${duplicates.reduce((sum, d) => sum + d.questions.length, 0)}`);
    console.log(`\n⚠️  CRITICAL: ${duplicates.filter(d => d.hasDifferentAnswers).length} sets have different correct answers`);
    console.log(`   These MUST be fixed - same question cannot have different correct answers!`);
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('   1. Fix all questions with different answers (CRITICAL)');
    console.log('   2. Review cross-course duplicates - may need to make unique');
    console.log('   3. Weekly + Final Exam duplicates may be intentional');
    console.log('   4. Same course duplicates may be intentional or need review');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

analyzeDuplicates();




























