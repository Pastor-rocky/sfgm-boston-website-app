import { quizzes, quizQuestions } from "./shared/schema.js";
import { eq } from "drizzle-orm";
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "./shared/schema.js";

// Get database URLs from environment
const LOCAL_DB_URL = process.env.LOCAL_DATABASE_URL || "postgresql://rocky@localhost:5432/boston_ministry";
const NEON_DB_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

if (!NEON_DB_URL) {
  console.error("❌ NEON_DATABASE_URL or DATABASE_URL must be set!");
  console.log("\nUsage:");
  console.log('export LOCAL_DATABASE_URL="postgresql://rocky@localhost:5432/boston_ministry"');
  console.log('export NEON_DATABASE_URL="postgresql://neondb_owner:password@ep-xxx.neon.tech/neondb?sslmode=require"');
  console.log('\nThen run: LOCAL_DATABASE_URL="..." NEON_DATABASE_URL="..." npx tsx export-and-import-all-quizzes.ts');
  process.exit(1);
}

// Local database connection
const localPool = new Pool({ 
  connectionString: LOCAL_DB_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const localDb = drizzle({ client: localPool, schema });

// Neon database connection
const neonPool = new Pool({ 
  connectionString: NEON_DB_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const neonDb = drizzle({ client: neonPool, schema });

async function exportAndImportQuizzes() {
  try {
    console.log("🔄 Exporting quizzes from local database and importing to Neon...\n");
    console.log(`Local DB: ${LOCAL_DB_URL.replace(/:[^:@]+@/, ':****@')}`);
    console.log(`Neon DB: ${NEON_DB_URL.replace(/:[^:@]+@/, ':****@')}\n`);

    // Get all quizzes from local database
    console.log("📥 Fetching all quizzes from local database...");
    const allQuizzes = await localDb.select().from(quizzes);
    console.log(`Found ${allQuizzes.length} quizzes\n`);

    if (allQuizzes.length === 0) {
      console.log("❌ No quizzes found in local database!");
      console.log("Make sure you're connected to the local database with quizzes.");
      process.exit(1);
    }

    // Get all quiz questions
    console.log("📥 Fetching all quiz questions from local database...");
    const allQuestions = await localDb.select().from(quizQuestions);
    console.log(`Found ${allQuestions.length} quiz questions\n`);

    // Now import to Neon
    console.log("📤 Importing to Neon database...\n");

    // Import ALL quizzes first (using ON CONFLICT to handle duplicates)
    console.log("📤 Importing all quizzes (batch import)...\n");
    let importedQuizzes = 0;
    let skippedQuizzes = 0;
    
    // Import in batches to avoid overwhelming the database
    const batchSize = 50;
    for (let i = 0; i < allQuizzes.length; i += batchSize) {
      const batch = allQuizzes.slice(i, i + batchSize);
      console.log(`Importing quizzes ${i + 1}-${Math.min(i + batchSize, allQuizzes.length)} of ${allQuizzes.length}...`);
      
      for (const quiz of batch) {
        try {
          // Use raw SQL with ON CONFLICT to handle duplicates gracefully
          // Note: quizzes table schema: id, module_id, title, time_limit, passing_score, is_final_exam, is_published, published_at, created_at
          await neonPool.query(`
            INSERT INTO quizzes (id, module_id, title, time_limit, passing_score, is_final_exam, is_published, published_at, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (id) DO NOTHING
          `, [
            quiz.id,
            quiz.moduleId,
            quiz.title,
            quiz.timeLimit,
            quiz.passingScore,
            quiz.isFinalExam,
            quiz.isPublished,
            quiz.publishedAt,
            quiz.createdAt,
          ]);

          // Check if it was actually inserted (not a conflict)
          const [check] = await neonDb.select().from(quizzes).where(eq(quizzes.id, quiz.id));
          if (check) {
            importedQuizzes++;
            if (importedQuizzes % 10 === 0) {
              console.log(`  ✅ Imported ${importedQuizzes} quizzes so far...`);
            }
          } else {
            skippedQuizzes++;
          }
        } catch (error: any) {
          console.error(`❌ Error importing quiz ${quiz.id}:`, error.message);
        }
      }
    }
    
    console.log(`\n✅ Quiz import complete: ${importedQuizzes} imported, ${skippedQuizzes} skipped\n`);

    // Import quiz questions (using ON CONFLICT to handle duplicates)
    console.log("📤 Importing quiz questions (batch import)...\n");
    let importedQuestions = 0;
    let skippedQuestions = 0;
    let failedQuestions = 0;

    // Import in batches
    const questionBatchSize = 100;
    for (let i = 0; i < allQuestions.length; i += questionBatchSize) {
      const batch = allQuestions.slice(i, i + questionBatchSize);
      if (i % 500 === 0) {
        console.log(`Importing questions ${i + 1}-${Math.min(i + questionBatchSize, allQuestions.length)} of ${allQuestions.length}...`);
      }
      
      for (const question of batch) {
        try {
          // Use raw SQL with ON CONFLICT to handle duplicates gracefully
          await neonPool.query(`
            INSERT INTO quiz_questions (id, quiz_id, question, type, options, correct_answer, points, order_index, is_bonus, parent_question_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (id) DO NOTHING
          `, [
            question.id,
            question.quizId,
            question.question,
            question.type,
            JSON.stringify(question.options),
            question.correctAnswer,
            question.points,
            question.orderIndex,
            question.isBonus,
            question.parentQuestionId,
          ]);

          // Check if it was actually inserted
          const [check] = await neonDb
            .select()
            .from(quizQuestions)
            .where(eq(quizQuestions.id, question.id));
          
          if (check) {
            importedQuestions++;
          } else {
            skippedQuestions++;
          }
        } catch (error: any) {
          if (error.message?.includes('foreign key')) {
            // Quiz doesn't exist - this is expected for some questions
            failedQuestions++;
            if (failedQuestions <= 10) {
              console.log(`  ⚠️  Question ${question.id} references missing quiz ${question.quizId}`);
            }
          } else if (!error.message?.includes('duplicate') && !error.message?.includes('unique')) {
            console.error(`❌ Error importing question ${question.id}:`, error.message);
            failedQuestions++;
          } else {
            skippedQuestions++;
          }
        }
      }
    }
    
    console.log(`\n✅ Question import complete: ${importedQuestions} imported, ${skippedQuestions} skipped, ${failedQuestions} failed (missing quiz)\n`);

    console.log("\n✅ Import complete!");
    console.log(`\n📊 Summary:`);
    console.log(`   Quizzes: ${importedQuizzes} imported, ${skippedQuizzes} skipped`);
    console.log(`   Questions: ${importedQuestions} imported, ${skippedQuestions} skipped`);
    console.log(`   Total quizzes in Neon: ${allQuizzes.length}`);
    console.log(`   Total questions in Neon: ${allQuestions.length}`);

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    await localPool.end();
    await neonPool.end();
    process.exit(0);
  }
}

exportAndImportQuizzes();

