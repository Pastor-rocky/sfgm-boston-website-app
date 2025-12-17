import { Pool } from 'pg';

const LOCAL_DB_URL = process.env.LOCAL_DATABASE_URL || "postgresql://rocky@localhost:5432/boston_ministry";
const NEON_DB_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

const localPool = new Pool({ connectionString: LOCAL_DB_URL });
const neonPool = new Pool({ connectionString: NEON_DB_URL });

async function checkStatus() {
  try {
    const localQuizzes = await localPool.query('SELECT id, title FROM quizzes ORDER BY id');
    const neonQuizzes = await neonPool.query('SELECT id, title FROM quizzes ORDER BY id');
    
    const localIds = new Set(localQuizzes.rows.map(r => r.id));
    const neonIds = new Set(neonQuizzes.rows.map(r => r.id));
    const missing = [...localIds].filter(id => !neonIds.has(id));
    
    console.log(`Local database: ${localQuizzes.rows.length} quizzes`);
    console.log(`Neon database: ${neonQuizzes.rows.length} quizzes`);
    console.log(`Missing quizzes: ${missing.length}`);
    
    if (missing.length > 0) {
      console.log(`\nFirst 20 missing quiz IDs: ${missing.slice(0, 20).join(', ')}`);
    }
    
    // Check questions
    const localQuestions = await localPool.query('SELECT COUNT(*) as count FROM quiz_questions');
    const neonQuestions = await neonPool.query('SELECT COUNT(*) as count FROM quiz_questions');
    
    console.log(`\nLocal questions: ${localQuestions.rows[0].count}`);
    console.log(`Neon questions: ${neonQuestions.rows[0].count}`);
    
  } catch (error: any) {
    console.error("Error:", error.message);
  } finally {
    await localPool.end();
    await neonPool.end();
    process.exit(0);
  }
}

checkStatus();




