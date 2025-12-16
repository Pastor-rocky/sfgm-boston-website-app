#!/usr/bin/env node

/**
 * Detailed Audit for Course 1: Acts in Action
 * 
 * This script provides a comprehensive, detailed audit of all quizzes
 * in Course 1 to verify accuracy and functionality.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { db } from './server/db';
import { quizzes, quizQuestions, courseModules } from './shared/schema';
import { eq, and, asc } from 'drizzle-orm';

interface QuizDetail {
  quizId: number;
  title: string;
  timeLimit: number;
  passingScore: number;
  isFinalExam: boolean;
  questionsCount: number;
  questions: Array<{
    orderIndex: number;
    question: string;
    type: string;
    options: string[];
    correctAnswer: string;
    points: number;
    isValid: boolean;
    issues: string[];
  }>;
  errors: string[];
  warnings: string[];
}

async function auditCourse1() {
  try {
    console.log('='.repeat(100));
    console.log('📚 DETAILED AUDIT: Course 1 - Acts in Action');
    console.log('='.repeat(100) + '\n');
    
    // Course 1 quiz IDs: 13-23 (Week 1-10 + Final Exam)
    const course1QuizIds = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    
    const quizDetails: QuizDetail[] = [];
    
    for (const quizId of course1QuizIds) {
      console.log(`\n${'='.repeat(100)}`);
      console.log(`📋 Quiz ${quizId}`);
      console.log('='.repeat(100));
      
      // Get quiz info
      const [quizData] = await db
        .select({
          quiz: quizzes,
          courseId: courseModules.courseId,
        })
        .from(quizzes)
        .leftJoin(courseModules, eq(quizzes.moduleId, courseModules.id))
        .where(eq(quizzes.id, quizId))
        .limit(1);
      
      if (!quizData) {
        console.log(`❌ Quiz ${quizId} not found`);
        continue;
      }
      
      const quiz = quizData.quiz;
      const detail: QuizDetail = {
        quizId,
        title: quiz.title,
        timeLimit: quiz.timeLimit || 0,
        passingScore: quiz.passingScore || 60,
        isFinalExam: quiz.isFinalExam || false,
        questionsCount: 0,
        questions: [],
        errors: [],
        warnings: [],
      };
      
      console.log(`Title: ${detail.title}`);
      console.log(`Time Limit: ${detail.timeLimit} minutes`);
      console.log(`Passing Score: ${detail.passingScore}%`);
      console.log(`Final Exam: ${detail.isFinalExam ? 'Yes' : 'No'}`);
      
      // Get questions
      const questions = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, quizId))
        .orderBy(asc(quizQuestions.orderIndex));
      
      detail.questionsCount = questions.length;
      console.log(`\nQuestions: ${detail.questionsCount}`);
      console.log('-'.repeat(100));
      
      // Audit each question
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const questionNum = i + 1;
        
        const qDetail: QuizDetail['questions'][0] = {
          orderIndex: question.orderIndex,
          question: question.question.trim(),
          type: question.type,
          options: [],
          correctAnswer: question.correctAnswer || '',
          points: question.points || 1,
          isValid: true,
          issues: [],
        };
        
        // Check question text
        if (!question.question || question.question.trim().length < 10) {
          qDetail.isValid = false;
          qDetail.issues.push('Question text is too short or empty');
          detail.errors.push(`Question ${questionNum}: Question text is too short`);
        }
        
        // Check question type
        const validTypes = ['multiple_choice', 'true_false', 'fill_blank', 'yes_no_with_text', 'essay', 'text_with_voice', 'subjective'];
        if (!validTypes.includes(question.type)) {
          qDetail.isValid = false;
          qDetail.issues.push(`Invalid question type: ${question.type}`);
          detail.errors.push(`Question ${questionNum}: Invalid question type`);
        }
        
        // For multiple choice, check options and answer
        if (question.type === 'multiple_choice') {
          if (!question.options || !Array.isArray(question.options)) {
            qDetail.isValid = false;
            qDetail.issues.push('Missing or invalid options array');
            detail.errors.push(`Question ${questionNum}: Missing options`);
          } else {
            qDetail.options = question.options.map((opt: string) => opt.trim());
            
            if (qDetail.options.length < 2) {
              qDetail.isValid = false;
              qDetail.issues.push(`Need at least 2 options (got ${qDetail.options.length})`);
              detail.errors.push(`Question ${questionNum}: Insufficient options`);
            }
            
            // Check correct answer
            if (!question.correctAnswer || question.correctAnswer.trim() === '') {
              qDetail.isValid = false;
              qDetail.issues.push('Missing correct answer');
              detail.errors.push(`Question ${questionNum}: Missing correct answer`);
            } else {
              const normalizedAnswer = question.correctAnswer.trim();
              const normalizedOptions = qDetail.options;
              
              // Check if answer is in options
              const exactMatch = normalizedOptions.includes(normalizedAnswer);
              const caseInsensitiveMatch = normalizedOptions.some(opt => 
                opt.toLowerCase() === normalizedAnswer.toLowerCase()
              );
              
              // Check content match (without prefixes)
              const answerContent = normalizedAnswer.replace(/^[A-D][.)]\s*/i, '').trim();
              const contentMatch = normalizedOptions.some(opt => {
                const optContent = opt.replace(/^[A-D][.)]\s*/i, '').trim();
                return optContent === answerContent || 
                       optContent.toLowerCase() === answerContent.toLowerCase();
              });
              
              if (!exactMatch && !caseInsensitiveMatch && !contentMatch) {
                qDetail.isValid = false;
                qDetail.issues.push(`Correct answer not found in options`);
                qDetail.issues.push(`  Answer: "${normalizedAnswer}"`);
                qDetail.issues.push(`  Options: ${normalizedOptions.join(', ')}`);
                detail.errors.push(`Question ${questionNum}: Correct answer '${normalizedAnswer}' not found in options`);
              }
            }
          }
        }
        
        // Display question details
        console.log(`\n  Question ${questionNum} (Order: ${question.orderIndex}):`);
        console.log(`    "${qDetail.question}"`);
        console.log(`    Type: ${qDetail.type}`);
        
        if (qDetail.options.length > 0) {
          console.log(`    Options:`);
          qDetail.options.forEach((opt, idx) => {
            const isCorrect = qDetail.correctAnswer && (
              opt === qDetail.correctAnswer ||
              opt.toLowerCase() === qDetail.correctAnswer.toLowerCase() ||
              opt.replace(/^[A-D][.)]\s*/i, '').trim() === qDetail.correctAnswer.replace(/^[A-D][.)]\s*/i, '').trim()
            );
            const marker = isCorrect ? '✓' : ' ';
            console.log(`      ${marker} ${String.fromCharCode(65 + idx)}) ${opt}`);
          });
          console.log(`    Correct Answer: "${qDetail.correctAnswer}"`);
        } else {
          console.log(`    Correct Answer: "${qDetail.correctAnswer}"`);
        }
        
        if (qDetail.issues.length > 0) {
          console.log(`    ⚠️  Issues:`);
          qDetail.issues.forEach(issue => console.log(`      - ${issue}`));
        } else {
          console.log(`    ✅ Valid`);
        }
        
        detail.questions.push(qDetail);
      }
      
      // Quiz summary
      console.log(`\n${'-'.repeat(100)}`);
      console.log(`📊 Quiz ${quizId} Summary:`);
      console.log(`   Questions: ${detail.questionsCount}`);
      console.log(`   Valid Questions: ${detail.questions.filter(q => q.isValid).length}`);
      console.log(`   Errors: ${detail.errors.length}`);
      console.log(`   Warnings: ${detail.warnings.length}`);
      
      if (detail.errors.length === 0) {
        console.log(`   ✅ Status: PASSED`);
      } else {
        console.log(`   ❌ Status: FAILED`);
        console.log(`   Errors:`);
        detail.errors.forEach(error => console.log(`     - ${error}`));
      }
      
      quizDetails.push(detail);
    }
    
    // Overall summary
    console.log(`\n${'='.repeat(100)}`);
    console.log('📈 COURSE 1 OVERALL SUMMARY');
    console.log('='.repeat(100));
    
    const totalQuizzes = quizDetails.length;
    const passedQuizzes = quizDetails.filter(q => q.errors.length === 0).length;
    const totalQuestions = quizDetails.reduce((sum, q) => sum + q.questionsCount, 0);
    const totalErrors = quizDetails.reduce((sum, q) => sum + q.errors.length, 0);
    const totalWarnings = quizDetails.reduce((sum, q) => sum + q.warnings.length, 0);
    
    console.log(`\nTotal Quizzes: ${totalQuizzes}`);
    console.log(`✅ Passed: ${passedQuizzes} (${Math.round(passedQuizzes/totalQuizzes*100)}%)`);
    console.log(`❌ Failed: ${totalQuizzes - passedQuizzes}`);
    console.log(`Total Questions: ${totalQuestions}`);
    console.log(`Total Errors: ${totalErrors}`);
    console.log(`Total Warnings: ${totalWarnings}`);
    
    if (totalErrors === 0) {
      console.log(`\n🎉 ALL QUIZZES IN COURSE 1 PASSED!`);
      console.log(`Course 1 (Acts in Action) is ready for use.`);
    } else {
      console.log(`\n⚠️  Some quizzes have errors that need to be fixed.`);
    }
    
    // List quizzes
    console.log(`\n📋 Quiz List:`);
    quizDetails.forEach(q => {
      const status = q.errors.length === 0 ? '✅' : '❌';
      console.log(`   ${status} Quiz ${q.quizId}: ${q.title} (${q.questionsCount} questions)`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

auditCourse1();




























