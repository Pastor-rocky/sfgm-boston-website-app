#!/usr/bin/env node

/**
 * Reduce Course 2 Weekly Quizzes to 10 Questions Each
 * and Create 50-Question Final Exam
 * 
 * Course 2: Becoming a Fire Starter
 * Quiz IDs: 48-57 (Week 1-10), 58 (Final Exam)
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { db } from './server/db';
import { quizzes, quizQuestions } from './shared/schema';
import { eq, asc, and, inArray } from 'drizzle-orm';

async function reduceCourse2Quizzes() {
  try {
    console.log('📚 Course 2: Becoming a Fire Starter');
    console.log('='.repeat(100));
    console.log('Reducing weekly quizzes to 10 questions each...\n');
    
    const weeklyQuizIds = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57];
    const finalExamId = 58;
    
    // Process each weekly quiz
    for (const quizId of weeklyQuizIds) {
      const [quiz] = await db
        .select()
        .from(quizzes)
        .where(eq(quizzes.id, quizId))
        .limit(1);
      
      if (!quiz) {
        console.log(`⚠️  Quiz ${quizId} not found, skipping...`);
        continue;
      }
      
      const weekNumber = quizId - 47; // 48 = Week 1, 49 = Week 2, etc.
      console.log(`\n📋 Week ${weekNumber} Quiz (ID: ${quizId}): ${quiz.title}`);
      
      // Get all questions for this quiz
      const allQuestions = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, quizId))
        .orderBy(asc(quizQuestions.orderIndex));
      
      console.log(`   Current: ${allQuestions.length} questions`);
      
      if (allQuestions.length <= 10) {
        console.log(`   ✅ Already has ${allQuestions.length} questions (no reduction needed)`);
        continue;
      }
      
      // Keep first 10 questions (they're already in order)
      const questionsToKeep = allQuestions.slice(0, 10);
      const questionsToDelete = allQuestions.slice(10);
      
      // Delete questions beyond the first 10
      if (questionsToDelete.length > 0) {
        const idsToDelete = questionsToDelete.map(q => q.id);
        await db
          .delete(quizQuestions)
          .where(inArray(quizQuestions.id, idsToDelete));
        
        console.log(`   ✅ Reduced to 10 questions (deleted ${questionsToDelete.length} questions)`);
      }
    }
    
    console.log('\n' + '='.repeat(100));
    console.log('Creating 50-Question Final Exam...\n');
    
    // Get questions from all weekly quizzes (now 10 each = 100 total)
    const allWeeklyQuestions: any[] = [];
    
    for (const quizId of weeklyQuizIds) {
      const questions = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, quizId))
        .orderBy(asc(quizQuestions.orderIndex));
      
      questions.forEach(q => {
        allWeeklyQuestions.push({
          ...q,
          sourceQuiz: quizId,
          weekNumber: quizId - 47,
        });
      });
    }
    
    console.log(`Found ${allWeeklyQuestions.length} questions from weekly quizzes\n`);
    
    // Select 50 questions - 5 from each week
    const selectedQuestions: any[] = [];
    const questionsPerWeek = 5;
    
    for (let week = 1; week <= 10; week++) {
      const quizId = 47 + week;
      const weekQuestions = allWeeklyQuestions.filter(q => q.sourceQuiz === quizId);
      const toTake = Math.min(questionsPerWeek, weekQuestions.length);
      selectedQuestions.push(...weekQuestions.slice(0, toTake));
    }
    
    // If we don't have 50 yet, fill from remaining
    if (selectedQuestions.length < 50) {
      const remaining = allWeeklyQuestions.filter(q => 
        !selectedQuestions.some(sq => sq.id === q.id)
      );
      selectedQuestions.push(...remaining.slice(0, 50 - selectedQuestions.length));
    }
    
    const finalQuestions = selectedQuestions.slice(0, 50);
    
    console.log(`Selected ${finalQuestions.length} questions for final exam\n`);
    
    // Delete existing final exam questions
    await db
      .delete(quizQuestions)
      .where(eq(quizQuestions.quizId, finalExamId));
    
    console.log('🗑️  Removed old final exam questions\n');
    
    // Create new final exam questions
    const newQuestions = [];
    for (let i = 0; i < finalQuestions.length; i++) {
      const sourceQuestion = finalQuestions[i];
      
      const newQuestion = {
        quizId: finalExamId,
        question: sourceQuestion.question,
        type: sourceQuestion.type,
        options: sourceQuestion.options,
        correctAnswer: sourceQuestion.correctAnswer,
        points: sourceQuestion.points || 1,
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
        weekNumber: sourceQuestion.weekNumber,
      });
    }
    
    // Update final exam settings
    await db
      .update(quizzes)
      .set({
        timeLimit: 75, // 75 minutes for 50 questions
        passingScore: 60,
        isFinalExam: true,
        isPublished: true,
      })
      .where(eq(quizzes.id, finalExamId));
    
    console.log(`✅ Created ${newQuestions.length} questions for final exam`);
    console.log(`✅ Updated final exam settings (75 minutes, 60% passing score)\n`);
    
    // Display final exam questions
    console.log('='.repeat(100));
    console.log('📋 FINAL EXAM: ALL 50 QUESTIONS WITH ANSWERS');
    console.log('='.repeat(100) + '\n');
    
    for (let i = 0; i < newQuestions.length; i++) {
      const q = newQuestions[i];
      const questionNum = i + 1;
      
      // Get correct answer letter
      let correctAnswerLetter = '';
      if (q.options && Array.isArray(q.options)) {
        const normalizedAnswer = q.correctAnswer?.trim() || '';
        q.options.forEach((opt: string, idx: number) => {
          const normalizedOpt = opt.trim();
          const isCorrect = 
            normalizedOpt === normalizedAnswer ||
            normalizedOpt.toLowerCase() === normalizedAnswer.toLowerCase() ||
            normalizedOpt.replace(/^[A-D][.)]\s*/i, '').trim() === normalizedAnswer.replace(/^[A-D][.)]\s*/i, '').trim();
          
          if (isCorrect) {
            correctAnswerLetter = String.fromCharCode(65 + idx);
          }
        });
      }
      
      console.log(`${questionNum}. ${q.question}`);
      console.log(`   Answer: ${correctAnswerLetter}`);
      console.log('');
    }
    
    // Summary
    console.log('='.repeat(100));
    console.log('📊 SUMMARY');
    console.log('='.repeat(100));
    console.log(`✅ Reduced all weekly quizzes to 10 questions each`);
    console.log(`✅ Created 50-question final exam`);
    console.log(`✅ Final exam questions distributed: 5 from each week`);
    console.log(`\n🎉 Course 2 updates complete!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

reduceCourse2Quizzes();




























