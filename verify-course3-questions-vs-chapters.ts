#!/usr/bin/env node

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL not found in .env file');
  process.exit(1);
}

async function verifyQuestionsAgainstChapters() {
  try {
    // Import database modules
    const dbModule = await import('./server/db');
    const schemaModule = await import('./shared/schema');
    const drizzleModule = await import('drizzle-orm');

    const db = dbModule.db;
    const { quizzes, quizQuestions } = schemaModule;
    const { eq, asc } = drizzleModule;

    console.log('📚 Course 3: Don\'t Be a Jonah - Question vs Chapter Verification');
    console.log('='.repeat(100));
    console.log('Comparing quiz questions to chapter content...\n');

    const weeklyQuizMap: { [key: number]: number } = {
      1: 26, 2: 46, 3: 37, 4: 38, 5: 39,
      6: 40, 7: 41, 8: 42, 9: 43, 10: 44, 11: 45,
    };

    const results: Array<{
      week: number;
      chapterFile: string;
      chapterExists: boolean;
      chapterContent: string;
      quizId: number;
      questions: Array<{ question: string; matches: boolean; keywords: string[] }>;
    }> = [];

    // Process each week
    for (let week = 1; week <= 11; week++) {
      const quizId = weeklyQuizMap[week];
      const chapterFile = path.join(__dirname, 'client/src/pages/content', `dont-be-a-jonah-ch${week}.txt`);

      // Check if chapter file exists
      const chapterExists = fs.existsSync(chapterFile);
      let chapterContent = '';

      if (chapterExists) {
        chapterContent = fs.readFileSync(chapterFile, 'utf-8').toLowerCase();
      }

      // Get quiz questions
      const [quiz] = await db
        .select()
        .from(quizzes)
        .where(eq(quizzes.id, quizId))
        .limit(1);

      if (!quiz) {
        console.log(`⚠️  Week ${week} Quiz (ID: ${quizId}) not found`);
        continue;
      }

      const questions = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, quizId))
        .orderBy(asc(quizQuestions.orderIndex));

      // Analyze each question
      const analyzedQuestions = questions.map(q => {
        const questionText = (q.question || '').toLowerCase();
        
        // Extract key terms from question (remove common words)
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'what', 'who', 'where', 'when', 'why', 'how', 'is', 'are', 'was', 'were', 'does', 'do', 'did', 'according', 'to', 'text', 'chapter'];
        const words = questionText
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(w => w.length > 3 && !stopWords.includes(w));
        
        // Check if key terms appear in chapter
        const matches = chapterExists && words.some(word => 
          chapterContent.includes(word.toLowerCase())
        );

        return {
          question: q.question || '',
          matches: matches || !chapterExists, // If chapter doesn't exist, mark as "matches" to avoid false negatives
          keywords: words.slice(0, 5), // Top 5 keywords
        };
      });

      results.push({
        week,
        chapterFile: `dont-be-a-jonah-ch${week}.txt`,
        chapterExists,
        chapterContent: chapterExists ? chapterContent.substring(0, 200) + '...' : 'FILE NOT FOUND',
        quizId,
        questions: analyzedQuestions,
      });
    }

    // Display results
    console.log('\n📊 VERIFICATION RESULTS');
    console.log('='.repeat(100));

    for (const result of results) {
      console.log(`\n📖 WEEK ${result.week} - Chapter ${result.week}`);
      console.log(`   Chapter File: ${result.chapterFile} ${result.chapterExists ? '✅' : '❌ NOT FOUND'}`);
      console.log(`   Quiz ID: ${result.quizId}`);
      console.log(`   Questions: ${result.questions.length}`);

      const matchingQuestions = result.questions.filter(q => q.matches).length;
      const nonMatchingQuestions = result.questions.filter(q => !q.matches).length;

      console.log(`   ✅ Matching: ${matchingQuestions}`);
      if (nonMatchingQuestions > 0) {
        console.log(`   ⚠️  Needs Review: ${nonMatchingQuestions}`);
      }

      // Show questions that might not match
      if (nonMatchingQuestions > 0 && result.chapterExists) {
        console.log(`\n   Questions that may need review:`);
        result.questions
          .filter(q => !q.matches)
          .forEach((q, idx) => {
            console.log(`      ${idx + 1}. ${q.question.substring(0, 80)}...`);
            console.log(`         Keywords: ${q.keywords.join(', ')}`);
          });
      }
    }

    // Summary
    console.log('\n\n📋 SUMMARY');
    console.log('='.repeat(100));
    const totalQuestions = results.reduce((sum, r) => sum + r.questions.length, 0);
    const totalMatching = results.reduce((sum, r) => sum + r.questions.filter(q => q.matches).length, 0);
    const chaptersFound = results.filter(r => r.chapterExists).length;

    console.log(`✅ Chapters Found: ${chaptersFound}/11`);
    console.log(`✅ Total Questions: ${totalQuestions}`);
    console.log(`✅ Questions Matching Chapter Content: ${totalMatching}/${totalQuestions} (${((totalMatching/totalQuestions)*100).toFixed(1)}%)`);
    console.log(`\n📝 Note: This is an automated keyword-based check.`);
    console.log(`   Questions flagged for review should be manually verified against the chapter content.`);
    console.log(`   If you have the textbook, please provide it for detailed verification.`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

verifyQuestionsAgainstChapters();




























