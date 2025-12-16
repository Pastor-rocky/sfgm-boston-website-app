import { Pool } from 'pg';

const LOCAL_DB_URL = process.env.LOCAL_DATABASE_URL || "postgresql://rocky@localhost:5432/boston_ministry";
const NEON_DB_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

const localPool = new Pool({ connectionString: LOCAL_DB_URL });
const neonPool = new Pool({ connectionString: NEON_DB_URL });

async function checkContent() {
  try {
    // Check courses
    const localCourses = await localPool.query('SELECT COUNT(*) as count FROM courses');
    const neonCourses = await neonPool.query('SELECT COUNT(*) as count FROM courses');
    console.log(`Courses: Local=${localCourses.rows[0].count}, Neon=${neonCourses.rows[0].count}`);
    
    // Check videos
    const localVideos = await localPool.query('SELECT COUNT(*) as count FROM course_videos');
    const neonVideos = await neonPool.query('SELECT COUNT(*) as count FROM course_videos');
    console.log(`Videos: Local=${localVideos.rows[0].count}, Neon=${neonVideos.rows[0].count}`);
    
    // Check quizzes
    const localQuizzes = await localPool.query('SELECT COUNT(*) as count FROM quizzes');
    const neonQuizzes = await neonPool.query('SELECT COUNT(*) as count FROM quizzes');
    console.log(`Quizzes: Local=${localQuizzes.rows[0].count}, Neon=${neonQuizzes.rows[0].count}`);
    
    // Check questions
    const localQuestions = await localPool.query('SELECT COUNT(*) as count FROM quiz_questions');
    const neonQuestions = await neonPool.query('SELECT COUNT(*) as count FROM quiz_questions');
    console.log(`Questions: Local=${localQuestions.rows[0].count}, Neon=${neonQuestions.rows[0].count}`);
    
    // Get course IDs from Neon
    const neonCourseIds = await neonPool.query('SELECT id, name FROM courses ORDER BY id');
    console.log(`\nNeon courses:`);
    neonCourseIds.rows.forEach(c => {
      console.log(`  ID ${c.id}: ${c.name}`);
    });
    
  } catch (error: any) {
    console.error("Error:", error.message);
  } finally {
    await localPool.end();
    await neonPool.end();
    process.exit(0);
  }
}

checkContent();

