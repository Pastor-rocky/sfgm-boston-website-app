#!/usr/bin/env node

/**
 * Reduce Course 3 Weekly Quizzes to 10 Questions Each
 * and Create 50-Question Final Exam
 * 
 * Course 3: Don't Be a Jonah
 * Quiz IDs: 26 (Week 1), 46 (Week 2), 37-45 (Week 3-11), 47 (Final Exam)
 */

// Load environment variables FIRST using require (synchronous)
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('dotenv').config();

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not found in environment variables');
  console.error('   Please ensure .env file exists and contains DATABASE_URL');
  process.exit(1);
}

async function reduceCourse3Quizzes() {
  // Dynamically import after env is loaded
  const { db } = await import('./server/db');
  const { quizzes, quizQuestions } = await import('./shared/schema');
  const { eq, asc, inArray } = await import('drizzle-orm');
  
  try {
    console.log('📚 Course 3: Don\'t Be a Jonah');
    console.log('='.repeat(100));
    console.log('Reducing weekly quizzes to 10 questions each...\n');
    
    // Course 3 quiz IDs mapped to week numbers
    const weeklyQuizMap: { [week: number]: number } = {
      1: 26,
      2: 46,
      3: 37,
      4: 38,
      5: 39,
      6: 40,
      7: 41,
      8: 42,
      9: 43,
      10: 44,
      11: 45,
    };
    
    const weeklyQuizIds = Object.values(weeklyQuizMap);
    const finalExamId = 47;
    
    // Process each weekly quiz
    for (let week = 1; week <= 11; week++) {
      const quizId = weeklyQuizMap[week];
      
      const [quiz] = await db
        .select()
        .from(quizzes)
        .where(eq(quizzes.id, quizId))
        .limit(1);
      
      if (!quiz) {
        console.log(`⚠️  Week ${week} Quiz (ID: ${quizId}) not found, skipping...`);
        continue;
      }
      
      console.log(`\n📋 Week ${week} Quiz (ID: ${quizId}): ${quiz.title}`);
      
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
    
    // Get questions from all weekly quizzes (now 10 each = 110 total)
    const allWeeklyQuestions: any[] = [];
    
    for (let week = 1; week <= 11; week++) {
      const quizId = weeklyQuizMap[week];
      const questions = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, quizId))
        .orderBy(asc(quizQuestions.orderIndex));
      
      questions.forEach(q => {
        allWeeklyQuestions.push({
          ...q,
          sourceQuiz: quizId,
          weekNumber: week,
        });
      });
    }
    
    console.log(`Found ${allWeeklyQuestions.length} questions from weekly quizzes\n`);
    
    // Select 50 questions - approximately 4-5 from each week
    // Since we have 11 weeks and need 50 questions, we'll take:
    // - 5 questions from weeks 1-10 (50 questions)
    // Total: 50 questions
    const selectedQuestions: any[] = [];
    const questionsPerWeek = 5;
    const weeksToUse = 10; // Use first 10 weeks for 50 questions (5 each)
    
    for (let week = 1; week <= weeksToUse; week++) {
      const quizId = weeklyQuizMap[week];
      const weekQuestions = allWeeklyQuestions.filter(q => q.sourceQuiz === quizId);
      const toTake = Math.min(questionsPerWeek, weekQuestions.length);
      selectedQuestions.push(...weekQuestions.slice(0, toTake));
    }
    
    // If we don't have 50 yet, fill from week 11
    if (selectedQuestions.length < 50) {
      const week11QuizId = weeklyQuizMap[11];
      const week11Questions = allWeeklyQuestions.filter(q => 
        q.sourceQuiz === week11QuizId && 
        !selectedQuestions.some(sq => sq.id === q.id)
      );
      selectedQuestions.push(...week11Questions.slice(0, 50 - selectedQuestions.length));
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
      console.log(`   Answer: ${correctAnswerLetter} (from Week ${q.weekNumber})`);
      console.log('');
    }
    
    // Summary
    console.log('='.repeat(100));
    console.log('📊 SUMMARY');
    console.log('='.repeat(100));
    console.log(`✅ Reduced all 11 weekly quizzes to 10 questions each`);
    console.log(`✅ Created 50-question final exam`);
    console.log(`✅ Final exam questions distributed: 5 from each week (weeks 1-10)`);
    console.log(`\n🎉 Course 3 updates complete!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

reduceCourse3Quizzes();
