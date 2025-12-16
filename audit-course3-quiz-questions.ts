#!/usr/bin/env node

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables synchronously before any other imports
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL not found in .env file');
  console.error(`   Looking for .env at: ${envPath}`);
  process.exit(1);
}

interface QuizInfo {
  week: number;
  quizId: number;
  title: string;
  chapter: number;
  questionCount: number;
  questions: Array<{
    id: number;
    orderIndex: number;
    question: string;
    type: string;
    correctAnswer: string;
    options?: string[];
  }>;
}

async function auditCourse3Quizzes() {
  try {
    // Import after env is loaded (using dynamic import to ensure env is set)
    const dbModule = await import('./server/db');
    const schemaModule = await import('./shared/schema');
    const drizzleModule = await import('drizzle-orm');

    const db = dbModule.db;
    const { quizzes, quizQuestions } = schemaModule;
    const { eq, asc, inArray } = drizzleModule;

    console.log('📚 Course 3: Don\'t Be a Jonah - Quiz Question Audit');
    console.log('='.repeat(100));
    console.log('Checking all quiz questions to ensure they reflect the correct chapter content.\n');

    // Course 3 Quiz IDs: 26, 46, 37, 38, 39, 40, 41, 42, 43, 44, 45 (weekly), 47 (final)
    const weeklyQuizMap: { [key: number]: number } = {
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
    const finalExamId = 47;

    const quizInfos: QuizInfo[] = [];

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

      // Get all questions for this quiz
      const questions = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, quizId))
        .orderBy(asc(quizQuestions.orderIndex));

      quizInfos.push({
        week,
        quizId,
        title: quiz.title || `Week ${week} Quiz`,
        chapter: week, // Each week corresponds to a chapter
        questionCount: questions.length,
        questions: questions.map(q => ({
          id: q.id,
          orderIndex: q.orderIndex,
          question: q.question || '',
          type: q.type || 'multiple_choice',
          correctAnswer: q.correctAnswer || '',
          options: q.options && typeof q.options === 'object' ? (q.options as any) : undefined,
        })),
      });
    }

    // Process final exam
    const [finalExam] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, finalExamId))
      .limit(1);

    if (finalExam) {
      const finalQuestions = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, finalExamId))
        .orderBy(asc(quizQuestions.orderIndex));

      quizInfos.push({
        week: 0, // Final exam
        quizId: finalExamId,
        title: finalExam.title || 'Final Exam',
        chapter: 0, // Final exam covers all chapters
        questionCount: finalQuestions.length,
        questions: finalQuestions.map(q => ({
          id: q.id,
          orderIndex: q.orderIndex,
          question: q.question || '',
          type: q.type || 'multiple_choice',
          correctAnswer: q.correctAnswer || '',
          options: q.options && typeof q.options === 'object' ? (q.options as any) : undefined,
        })),
      });
    }

    // Display results
    console.log('\n📋 QUIZ SUMMARY');
    console.log('='.repeat(100));
    for (const quizInfo of quizInfos) {
      if (quizInfo.week === 0) {
        console.log(`\n🎓 FINAL EXAM (Quiz ID: ${quizInfo.quizId})`);
        console.log(`   Title: ${quizInfo.title}`);
        console.log(`   Questions: ${quizInfo.questionCount}`);
        console.log(`   Covers: All 11 chapters`);
      } else {
        console.log(`\n📖 WEEK ${quizInfo.week} - Chapter ${quizInfo.chapter} (Quiz ID: ${quizInfo.quizId})`);
        console.log(`   Title: ${quizInfo.title}`);
        console.log(`   Questions: ${quizInfo.questionCount}`);
        console.log(`   Should cover: Chapter ${quizInfo.chapter} of "Don't Be a Jonah"`);
      }
    }

    // Display all questions by week
    console.log('\n\n📝 DETAILED QUESTION LIST');
    console.log('='.repeat(100));

    for (const quizInfo of quizInfos) {
      if (quizInfo.week === 0) {
        console.log(`\n\n🎓 FINAL EXAM - ALL ${quizInfo.questionCount} QUESTIONS`);
        console.log('─'.repeat(100));
      } else {
        console.log(`\n\n📖 WEEK ${quizInfo.week} - CHAPTER ${quizInfo.chapter} - ALL ${quizInfo.questionCount} QUESTIONS`);
        console.log('─'.repeat(100));
      }

      for (let i = 0; i < quizInfo.questions.length; i++) {
        const q = quizInfo.questions[i];
        const questionNum = i + 1;

        console.log(`\n${questionNum}. ${q.question}`);
        console.log(`   Type: ${q.type}`);

        if (q.options && Array.isArray(q.options) && q.options.length > 0) {
          console.log(`   Options:`);
          q.options.forEach((opt: string, idx: number) => {
            const letter = String.fromCharCode(65 + idx);
            const isCorrect = opt === q.correctAnswer || 
                             opt.trim() === q.correctAnswer.trim() ||
                             opt.replace(/^[A-D][.)]\s*/i, '').trim() === q.correctAnswer.replace(/^[A-D][.)]\s*/i, '').trim();
            const marker = isCorrect ? ' ✓ (Correct)' : '';
            console.log(`      ${letter}) ${opt}${marker}`);
          });
        } else {
          console.log(`   Correct Answer: ${q.correctAnswer}`);
        }
      }
    }

    // Summary
    console.log('\n\n📊 AUDIT SUMMARY');
    console.log('='.repeat(100));
    console.log(`✅ Total Weekly Quizzes: 11`);
    console.log(`✅ Total Final Exam: 1`);
    console.log(`✅ Total Questions: ${quizInfos.reduce((sum, q) => sum + q.questionCount, 0)}`);
    console.log(`\n📝 Next Steps:`);
    console.log(`   1. Review each week's questions to ensure they match the corresponding chapter`);
    console.log(`   2. Verify that questions accurately reflect chapter content`);
    console.log(`   3. If questions don't match, provide the textbook chapters for review`);
    console.log(`   4. Questions can be updated based on the actual chapter content`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

auditCourse3Quizzes();

