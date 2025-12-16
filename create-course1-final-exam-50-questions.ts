#!/usr/bin/env node

/**
 * Create New 50-Question Final Exam for Course 1 (Acts in Action)
 * 
 * This script creates a comprehensive final exam by selecting questions
 * from all weekly quizzes (Week 1-10) and displays all questions with answers.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { db } from './server/db';
import { quizzes, quizQuestions, courseModules } from './shared/schema';
import { eq, and, asc, inArray } from 'drizzle-orm';

interface Question {
  id: number;
  quizId: number;
  orderIndex: number;
  question: string;
  type: string;
  options: any;
  correctAnswer: string;
  points: number;
  isBonus?: boolean;
  parentQuestionId?: number;
}

async function createFinalExam() {
  try {
    console.log('📚 Creating New 50-Question Final Exam for Course 1 (Acts in Action)\n');
    console.log('='.repeat(100));
    
    // Get all questions from Week 1-10 quizzes (Quiz IDs: 13-22)
    const weeklyQuizIds = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
    
    console.log('📖 Gathering questions from weekly quizzes...\n');
    
    const allWeeklyQuestions: Question[] = [];
    
    for (const quizId of weeklyQuizIds) {
      const questions = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, quizId))
        .orderBy(asc(quizQuestions.orderIndex));
      
      questions.forEach(q => {
        allWeeklyQuestions.push({
          id: q.id,
          quizId: quizId,
          orderIndex: q.orderIndex,
          question: q.question,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer || '',
          points: q.points || 1,
          isBonus: q.isBonus || false,
          parentQuestionId: q.parentQuestionId || undefined,
        });
      });
    }
    
    console.log(`Found ${allWeeklyQuestions.length} questions from weekly quizzes\n`);
    
    // Select 50 questions - try to get 5 from each week
    const selectedQuestions: Question[] = [];
    const questionsPerWeek = 5;
    
    for (const quizId of weeklyQuizIds) {
      const weekQuestions = allWeeklyQuestions.filter(q => q.quizId === quizId);
      // Take up to 5 questions from each week
      const toTake = Math.min(questionsPerWeek, weekQuestions.length);
      selectedQuestions.push(...weekQuestions.slice(0, toTake));
    }
    
    // If we don't have 50 yet, fill from remaining questions
    if (selectedQuestions.length < 50) {
      const remaining = allWeeklyQuestions.filter(q => 
        !selectedQuestions.some(sq => sq.id === q.id)
      );
      selectedQuestions.push(...remaining.slice(0, 50 - selectedQuestions.length));
    }
    
    // Limit to exactly 50
    const finalQuestions = selectedQuestions.slice(0, 50);
    
    console.log(`Selected ${finalQuestions.length} questions for final exam\n`);
    
    // Get the final exam quiz (Quiz 23)
    const [finalExamQuiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, 23))
      .limit(1);
    
    if (!finalExamQuiz) {
      console.error('❌ Final exam quiz (ID: 23) not found');
      process.exit(1);
    }
    
    // Delete existing questions from final exam
    console.log('🗑️  Removing old final exam questions...\n');
    await db
      .delete(quizQuestions)
      .where(eq(quizQuestions.quizId, 23));
    
    // Create new questions for final exam
    console.log('✨ Creating new 50-question final exam...\n');
    
    const newQuestions = [];
    for (let i = 0; i < finalQuestions.length; i++) {
      const sourceQuestion = finalQuestions[i];
      
      const newQuestion = {
        quizId: 23,
        question: sourceQuestion.question,
        type: sourceQuestion.type,
        options: sourceQuestion.options,
        correctAnswer: sourceQuestion.correctAnswer,
        points: sourceQuestion.points,
        orderIndex: i + 1,
        isBonus: sourceQuestion.isBonus || false,
        parentQuestionId: sourceQuestion.parentQuestionId || null,
      };
      
      const [inserted] = await db
        .insert(quizQuestions)
        .values(newQuestion)
        .returning();
      
      newQuestions.push({
        ...inserted,
        sourceQuiz: sourceQuestion.quizId,
      });
    }
    
    console.log(`✅ Created ${newQuestions.length} questions for final exam\n`);
    
    // Display all 50 questions with answers
    console.log('='.repeat(100));
    console.log('📋 FINAL EXAM QUESTIONS (50 Total)');
    console.log('='.repeat(100) + '\n');
    
    for (let i = 0; i < newQuestions.length; i++) {
      const q = newQuestions[i];
      const questionNum = i + 1;
      
      console.log(`\n${questionNum}. ${q.question}`);
      console.log(`   (Source: Week ${q.sourceQuiz - 12} Quiz)`);
      
      if (q.options && Array.isArray(q.options)) {
        q.options.forEach((opt: string, idx: number) => {
          const isCorrect = q.correctAnswer && (
            opt === q.correctAnswer ||
            opt.toLowerCase() === q.correctAnswer.toLowerCase() ||
            opt.replace(/^[A-D][.)]\s*/i, '').trim() === q.correctAnswer.replace(/^[A-D][.)]\s*/i, '').trim()
          );
          const marker = isCorrect ? '✓' : ' ';
          console.log(`   ${marker} ${String.fromCharCode(65 + idx)}) ${opt}`);
        });
      }
      
      console.log(`   ✅ Correct Answer: ${q.correctAnswer}`);
    }
    
    // Summary
    console.log('\n' + '='.repeat(100));
    console.log('📊 FINAL EXAM SUMMARY');
    console.log('='.repeat(100));
    console.log(`Total Questions: ${newQuestions.length}`);
    console.log(`Questions per Week:`);
    
    const weekCounts: { [week: number]: number } = {};
    newQuestions.forEach(q => {
      const week = q.sourceQuiz - 12;
      weekCounts[week] = (weekCounts[week] || 0) + 1;
    });
    
    Object.keys(weekCounts).sort((a, b) => parseInt(a) - parseInt(b)).forEach(week => {
      console.log(`   Week ${week}: ${weekCounts[parseInt(week)]} questions`);
    });
    
    console.log(`\n✅ Final exam successfully created with 50 questions!`);
    console.log(`   Quiz ID: 23`);
    console.log(`   Title: ${finalExamQuiz.title}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createFinalExam();




























