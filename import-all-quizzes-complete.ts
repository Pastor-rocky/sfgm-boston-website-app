import { Pool } from 'pg';

const LOCAL_DB_URL = process.env.LOCAL_DATABASE_URL || "postgresql://rocky@localhost:5432/boston_ministry";
const NEON_DB_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!NEON_DB_URL) {
  console.error("❌ NEON_DATABASE_URL or DATABASE_URL must be set!");
  process.exit(1);
}

const localPool = new Pool({ connectionString: LOCAL_DB_URL });
const neonPool = new Pool({ connectionString: NEON_DB_URL });

async function importAll() {
  try {
    console.log("🔄 Importing ALL quizzes and questions from local to Neon...\n");

    // Step 1: Import ALL quizzes (using ON CONFLICT DO NOTHING)
    console.log("📤 Step 1: Importing all quizzes...");
    const quizResult = await localPool.query('SELECT id, module_id, title, time_limit, passing_score, is_final_exam, is_published, published_at, created_at FROM quizzes ORDER BY id');
    const allQuizzes = quizResult.rows;
    console.log(`Found ${allQuizzes.length} quizzes in local database`);

    let importedQuizzes = 0;
    let skippedQuizzes = 0;
    let failedQuizzes = 0;
    
    for (const quiz of allQuizzes) {
      try {
        // Set module_id to NULL since course_modules don't exist in Neon yet
        // Quizzes are referenced by ID directly in the code, so this is fine
        const result = await neonPool.query(`
          INSERT INTO quizzes (id, module_id, title, time_limit, passing_score, is_final_exam, is_published, published_at, created_at)
          VALUES ($1, NULL, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO NOTHING
          RETURNING id
        `, [
          quiz.id,
          quiz.title,
          quiz.time_limit,
          quiz.passing_score,
          quiz.is_final_exam,
          quiz.is_published,
          quiz.published_at,
          quiz.created_at,
        ]);
        
        // If result.rows.length > 0, it was inserted. Otherwise it was skipped (conflict)
        if (result.rows.length > 0) {
          importedQuizzes++;
          if (importedQuizzes % 20 === 0) {
            console.log(`  ✅ Imported ${importedQuizzes} quizzes...`);
          }
        } else {
          skippedQuizzes++;
        }
      } catch (error: any) {
        failedQuizzes++;
        if (failedQuizzes <= 10) {
          console.error(`  ❌ Error importing quiz ${quiz.id} (${quiz.title}):`, error.message);
        }
      }
    }
    
    console.log(`✅ Imported ${importedQuizzes} new quizzes, ${skippedQuizzes} already existed, ${failedQuizzes} failed\n`);
    console.log(`✅ Imported ${importedQuizzes} new quizzes\n`);

    // Step 2: Import ALL questions
    console.log("📤 Step 2: Importing all quiz questions...");
    const questionResult = await localPool.query(`
      SELECT id, quiz_id, question, type, options, correct_answer, points, order_index, is_bonus, parent_question_id 
      FROM quiz_questions 
      ORDER BY id
    `);
    const allQuestions = questionResult.rows;
    console.log(`Found ${allQuestions.length} questions in local database`);

    let importedQuestions = 0;
    let skippedQuestions = 0;
    let failedQuestions = 0;

    for (let i = 0; i < allQuestions.length; i++) {
      const q = allQuestions[i];
      if (i % 500 === 0 && i > 0) {
        console.log(`  Processing questions ${i + 1}-${Math.min(i + 500, allQuestions.length)}...`);
      }

      try {
        // Handle options - ensure it's valid JSON
        let optionsJson = null;
        if (q.options) {
          if (typeof q.options === 'string') {
            try {
              // Try to parse and re-stringify to ensure valid JSON
              optionsJson = JSON.stringify(JSON.parse(q.options));
            } catch {
              optionsJson = q.options; // If already valid JSON string, use as-is
            }
          } else {
            optionsJson = JSON.stringify(q.options);
          }
        }

        await neonPool.query(`
          INSERT INTO quiz_questions (id, quiz_id, question, type, options, correct_answer, points, order_index, is_bonus, parent_question_id)
          VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO NOTHING
        `, [
          q.id,
          q.quiz_id,
          q.question,
          q.type,
          optionsJson,
          q.correct_answer,
          q.points,
          q.order_index,
          q.is_bonus,
          q.parent_question_id,
        ]);

        // Check if it was inserted
        const check = await neonPool.query('SELECT id FROM quiz_questions WHERE id = $1', [q.id]);
        if (check.rows.length > 0) {
          importedQuestions++;
        } else {
          skippedQuestions++;
        }
      } catch (error: any) {
        if (error.message?.includes('foreign key')) {
          failedQuestions++;
          if (failedQuestions <= 5) {
            console.log(`  ⚠️  Question ${q.id} references missing quiz ${q.quiz_id}`);
          }
        } else if (!error.message?.includes('duplicate') && !error.message?.includes('unique')) {
          console.error(`  ❌ Error importing question ${q.id}:`, error.message);
          failedQuestions++;
        } else {
          skippedQuestions++;
        }
      }
    }

    console.log(`✅ Imported ${importedQuestions} new questions, ${skippedQuestions} skipped, ${failedQuestions} failed\n`);

    // Final summary
    const neonQuizCount = await neonPool.query('SELECT COUNT(*) as count FROM quizzes');
    const neonQuestionCount = await neonPool.query('SELECT COUNT(*) as count FROM quiz_questions');

    console.log("📊 Final Summary:");
    console.log(`   Quizzes in Neon: ${neonQuizCount.rows[0].count}`);
    console.log(`   Questions in Neon: ${neonQuestionCount.rows[0].count}`);
    console.log(`   ✅ Import complete!`);

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    await localPool.end();
    await neonPool.end();
    process.exit(0);
  }
}

importAll();

