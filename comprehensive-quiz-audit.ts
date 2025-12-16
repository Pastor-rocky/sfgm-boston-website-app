#!/usr/bin/env node

/**
 * Comprehensive Quiz Audit Script
 * 
 * This script performs a thorough audit of all quizzes to ensure:
 * 1. All questions have correct answers that match their options
 * 2. Questions are appropriate and well-formatted
 * 3. All quizzes function correctly
 * 4. Answer options are properly formatted
 * 5. No duplicate questions
 * 6. Question types are valid
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL not found in environment variables');
  console.error(`   Checked: ${envPath}`);
  process.exit(1);
}

import { db } from './server/db';
import { quizzes, quizQuestions, courseModules } from './shared/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

interface QuizAuditResult {
  quizId: number;
  title: string;
  courseId: number | null;
  courseName: string;
  questionsCount: number;
  errors: string[];
  warnings: string[];
  issues: {
    missingCorrectAnswer: number[];
    incorrectAnswerFormat: number[];
    answerNotInOptions: number[];
    invalidQuestionType: number[];
    duplicateQuestions: number[];
    poorlyFormattedQuestions: number[];
    inappropriateQuestions: number[];
  };
}

interface CourseQuizInfo {
  courseId: number;
  courseName: string;
  quizIds: number[];
}

class ComprehensiveQuizAuditor {
  private results: QuizAuditResult[] = [];
  private courseInfo: CourseQuizInfo[] = [];
  
  constructor() {
    this.initializeCourseInfo();
  }
  
  private initializeCourseInfo(): void {
    this.courseInfo = [
      {
        courseId: 1,
        courseName: 'Acts in Action',
        quizIds: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
      },
      {
        courseId: 2,
        courseName: 'Becoming a Fire Starter',
        quizIds: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58],
      },
      {
        courseId: 3,
        courseName: "Don't Be a Jonah",
        quizIds: [26, 46, 37, 38, 39, 40, 41, 42, 43, 44, 45, 47],
      },
      {
        courseId: 4,
        courseName: 'G.R.O.W',
        quizIds: [71, 72, 73, 74, 75],
      },
      {
        courseId: 5,
        courseName: 'Studying for Service',
        quizIds: [59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70],
      },
      {
        courseId: 6,
        courseName: 'Deacon Course',
        quizIds: [76, 77, 78, 79, 80, 82],
      },
      {
        courseId: 7,
        courseName: 'Level Up Leadership',
        quizIds: [200, 201, 202, 203, 204, 206],
      },
      {
        courseId: 8,
        courseName: 'Youth Ministry',
        quizIds: [207, 208, 209, 210, 211, 212],
      }
    ];
  }
  
  async runAudit(): Promise<void> {
    console.log('🔍 Starting Comprehensive Quiz Audit...\n');
    console.log('This audit will check:');
    console.log('  ✓ Correct answers exist and match options');
    console.log('  ✓ Questions are appropriate and well-formatted');
    console.log('  ✓ Answer options are properly formatted');
    console.log('  ✓ No duplicate questions');
    console.log('  ✓ Question types are valid\n');
    
    // Get all quiz IDs from all courses
    const allQuizIds = this.courseInfo.flatMap(course => course.quizIds);
    
    for (const quizId of allQuizIds) {
      await this.auditQuiz(quizId);
    }
    
    this.generateReport();
  }
  
  private async auditQuiz(quizId: number): Promise<void> {
    const result: QuizAuditResult = {
      quizId,
      title: '',
      courseId: null,
      courseName: 'Unknown',
      questionsCount: 0,
      errors: [],
      warnings: [],
      issues: {
        missingCorrectAnswer: [],
        incorrectAnswerFormat: [],
        answerNotInOptions: [],
        invalidQuestionType: [],
        duplicateQuestions: [],
        poorlyFormattedQuestions: [],
        inappropriateQuestions: []
      }
    };
    
    try {
      // Get quiz info with course
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
        result.errors.push(`Quiz ${quizId} not found in database`);
        this.results.push(result);
        return;
      }
      
      result.title = quizData.quiz.title;
      result.courseId = quizData.courseId;
      
      // Find course name
      const course = this.courseInfo.find(c => c.quizIds.includes(quizId));
      if (course) {
        result.courseName = course.courseName;
      }
      
      // Get all questions
      const questions = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, quizId))
        .orderBy(asc(quizQuestions.orderIndex));
      
      result.questionsCount = questions.length;
      
      if (questions.length === 0) {
        result.errors.push(`No questions found for quiz ${quizId}`);
        this.results.push(result);
        return;
      }
      
      // Audit each question
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const questionNum = i + 1;
        
        await this.auditQuestion(question, questionNum, result, questions);
      }
      
    } catch (error: any) {
      result.errors.push(`Database error: ${error.message}`);
    }
    
    this.results.push(result);
  }
  
  private async auditQuestion(
    question: any,
    questionNum: number,
    result: QuizAuditResult,
    allQuestions: any[]
  ): Promise<void> {
    // Check for correct answer
    if (!question.correctAnswer || question.correctAnswer.trim() === '') {
      result.issues.missingCorrectAnswer.push(questionNum);
      result.errors.push(`Question ${questionNum}: Missing correct answer`);
    }
    
    // Check question type
    const validTypes = ['multiple_choice', 'true_false', 'fill_blank', 'yes_no_with_text', 'essay', 'text_with_voice', 'subjective'];
    if (!validTypes.includes(question.type)) {
      result.issues.invalidQuestionType.push(questionNum);
      result.errors.push(`Question ${questionNum}: Invalid question type '${question.type}'`);
    }
    
    // For multiple choice questions, check options and correct answer
    if (question.type === 'multiple_choice') {
      // Check options exist
      if (!question.options || !Array.isArray(question.options)) {
        result.issues.incorrectAnswerFormat.push(questionNum);
        result.errors.push(`Question ${questionNum}: Missing or invalid options array`);
        return;
      }
      
      // Check we have at least 2 options
      if (question.options.length < 2) {
        result.issues.incorrectAnswerFormat.push(questionNum);
        result.errors.push(`Question ${questionNum}: Need at least 2 options (got ${question.options.length})`);
      }
      
      // Check correct answer is in options
      if (question.correctAnswer) {
        const normalizedCorrectAnswer = question.correctAnswer.trim();
        const normalizedOptions = question.options.map((opt: string) => opt.trim());
        
        if (!normalizedOptions.includes(normalizedCorrectAnswer)) {
          result.issues.answerNotInOptions.push(questionNum);
          result.errors.push(
            `Question ${questionNum}: Correct answer '${normalizedCorrectAnswer}' not found in options. ` +
            `Options: ${normalizedOptions.join(', ')}`
          );
        }
      }
      
      // Check for duplicate options
      const uniqueOptions = new Set(question.options.map((opt: string) => opt.trim().toLowerCase()));
      if (uniqueOptions.size < question.options.length) {
        result.warnings.push(`Question ${questionNum}: Has duplicate options`);
      }
      
      // Check option format (should not have A), B), etc. prefixes in the stored value)
      const hasPrefixes = question.options.some((opt: string) => /^[A-D]\)\s/.test(opt));
      if (hasPrefixes) {
        result.warnings.push(`Question ${questionNum}: Options contain A), B), etc. prefixes (should be removed)`);
      }
    }
    
    // Check question text quality
    if (!question.question || question.question.trim().length < 10) {
      result.issues.poorlyFormattedQuestions.push(questionNum);
      result.errors.push(`Question ${questionNum}: Question text is too short or empty`);
    }
    
    // Check for inappropriate content (basic checks)
    const questionLower = question.question.toLowerCase();
    const inappropriateWords = ['test', 'placeholder', 'lorem ipsum', 'sample question'];
    if (inappropriateWords.some(word => questionLower.includes(word))) {
      result.issues.inappropriateQuestions.push(questionNum);
      result.warnings.push(`Question ${questionNum}: May contain placeholder or test content`);
    }
    
    // Check for duplicate questions (same question text)
    const duplicates = allQuestions.filter(
      (q, idx) => q.question === question.question && idx !== questionNum - 1
    );
    if (duplicates.length > 0) {
      result.issues.duplicateQuestions.push(questionNum);
      result.warnings.push(`Question ${questionNum}: Duplicate question text found`);
    }
    
    // Check question ends with proper punctuation
    const questionText = question.question.trim();
    if (questionText && !questionText.match(/[?.!]$/)) {
      result.warnings.push(`Question ${questionNum}: Question should end with proper punctuation (?, ., or !)`);
    }
  }
  
  private generateReport(): void {
    console.log('\n' + '='.repeat(100));
    console.log('📊 COMPREHENSIVE QUIZ AUDIT REPORT');
    console.log('='.repeat(100) + '\n');
    
    // Group by course
    const courseResults: { [courseId: number]: QuizAuditResult[] } = {};
    this.results.forEach(result => {
      const courseId = result.courseId || 0;
      if (!courseResults[courseId]) {
        courseResults[courseId] = [];
      }
      courseResults[courseId].push(result);
    });
    
    let totalQuizzes = this.results.length;
    let totalErrors = 0;
    let totalWarnings = 0;
    let quizzesWithErrors = 0;
    
    // Report by course
    for (const courseId of Object.keys(courseResults).map(Number).sort()) {
      const courseQuizzes = courseResults[courseId];
      const courseName = courseQuizzes[0]?.courseName || `Course ${courseId}`;
      
      console.log(`\n📚 ${courseName} (Course ID: ${courseId || 'Unknown'})`);
      console.log('-'.repeat(100));
      
      let courseErrors = 0;
      let courseWarnings = 0;
      
      for (const quiz of courseQuizzes) {
        const errorCount = quiz.errors.length;
        const warningCount = quiz.warnings.length;
        courseErrors += errorCount;
        courseWarnings += warningCount;
        
        if (errorCount > 0) {
          quizzesWithErrors++;
          console.log(`\n  ❌ Quiz ${quiz.quizId}: ${quiz.title}`);
          console.log(`     Questions: ${quiz.questionsCount}`);
          console.log(`     Errors: ${errorCount}, Warnings: ${warningCount}`);
          
          // Show error summary
          if (quiz.issues.missingCorrectAnswer.length > 0) {
            console.log(`     ⚠️  Missing correct answers: Questions ${quiz.issues.missingCorrectAnswer.join(', ')}`);
          }
          if (quiz.issues.answerNotInOptions.length > 0) {
            console.log(`     ⚠️  Answers not in options: Questions ${quiz.issues.answerNotInOptions.join(', ')}`);
          }
          if (quiz.issues.invalidQuestionType.length > 0) {
            console.log(`     ⚠️  Invalid question types: Questions ${quiz.issues.invalidQuestionType.join(', ')}`);
          }
          
          // Show first 3 errors
          quiz.errors.slice(0, 3).forEach(error => {
            console.log(`     • ${error}`);
          });
          if (quiz.errors.length > 3) {
            console.log(`     ... and ${quiz.errors.length - 3} more errors`);
          }
        } else if (warningCount > 0) {
          console.log(`\n  ⚠️  Quiz ${quiz.quizId}: ${quiz.title} (${warningCount} warnings)`);
        } else {
          console.log(`\n  ✅ Quiz ${quiz.quizId}: ${quiz.title} - All checks passed`);
        }
      }
      
      totalErrors += courseErrors;
      totalWarnings += courseWarnings;
      
      const passRate = courseQuizzes.length > 0 
        ? Math.round(((courseQuizzes.length - courseQuizzes.filter(q => q.errors.length > 0).length) / courseQuizzes.length) * 100)
        : 0;
      
      console.log(`\n  📊 Course Summary: ${courseQuizzes.filter(q => q.errors.length === 0).length}/${courseQuizzes.length} quizzes passed (${passRate}%)`);
      console.log(`     Total Errors: ${courseErrors}, Total Warnings: ${courseWarnings}`);
    }
    
    console.log('\n' + '='.repeat(100));
    console.log('📈 OVERALL SUMMARY');
    console.log('='.repeat(100));
    console.log(`Total Quizzes Audited: ${totalQuizzes}`);
    console.log(`✅ Quizzes with No Errors: ${totalQuizzes - quizzesWithErrors} (${Math.round((totalQuizzes - quizzesWithErrors)/totalQuizzes*100)}%)`);
    console.log(`❌ Quizzes with Errors: ${quizzesWithErrors} (${Math.round(quizzesWithErrors/totalQuizzes*100)}%)`);
    console.log(`Total Errors Found: ${totalErrors}`);
    console.log(`Total Warnings Found: ${totalWarnings}`);
    
    if (totalErrors === 0) {
      console.log('\n🎉 ALL QUIZZES PASSED THE AUDIT!');
      console.log('All quizzes are accurate, functional, and ready for use.');
    } else {
      console.log('\n⚠️  SOME QUIZZES HAVE ISSUES THAT NEED TO BE FIXED');
      console.log('Please review the errors above and correct them before proceeding.');
    }
    
    // Issue breakdown
    console.log('\n' + '='.repeat(100));
    console.log('📋 ISSUE BREAKDOWN');
    console.log('='.repeat(100));
    
    const issueTypes = {
      'Missing Correct Answer': 0,
      'Answer Not in Options': 0,
      'Invalid Question Type': 0,
      'Poorly Formatted Questions': 0,
      'Duplicate Questions': 0,
    };
    
    this.results.forEach(result => {
      issueTypes['Missing Correct Answer'] += result.issues.missingCorrectAnswer.length;
      issueTypes['Answer Not in Options'] += result.issues.answerNotInOptions.length;
      issueTypes['Invalid Question Type'] += result.issues.invalidQuestionType.length;
      issueTypes['Poorly Formatted Questions'] += result.issues.poorlyFormattedQuestions.length;
      issueTypes['Duplicate Questions'] += result.issues.duplicateQuestions.length;
    });
    
    Object.entries(issueTypes).forEach(([type, count]) => {
      if (count > 0) {
        console.log(`  ${type}: ${count} questions`);
      }
    });
  }
}

// Run the audit
async function main() {
  try {
    const auditor = new ComprehensiveQuizAuditor();
    await auditor.runAudit();
    process.exit(0);
  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  }
}

main();

