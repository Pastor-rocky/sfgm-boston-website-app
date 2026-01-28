import { Pool } from 'pg';

const NEON_DB_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
const neonPool = new Pool({ connectionString: NEON_DB_URL });

async function generateDetailedReport() {
  try {
    console.log("📚 DETAILED COURSE CONTENT REPORT\n");
    console.log("=" .repeat(80) + "\n");

    // Get all courses
    const courses = await neonPool.query('SELECT id, name, duration FROM courses ORDER BY id');
    
    for (const course of courses.rows) {
      const courseId = course.id;
      const courseName = course.name;
      const courseDuration = course.duration;
      
      console.log(`\n${"=".repeat(80)}`);
      console.log(`COURSE ${courseId}: ${courseName.toUpperCase()}`);
      console.log(`Duration: ${courseDuration} weeks`);
      console.log(`${"=".repeat(80)}\n`);

      // Get videos
      const videos = await neonPool.query(`
        SELECT id, title, description, video_url, duration, order_index, is_published
        FROM course_videos
        WHERE course_id = $1
        ORDER BY order_index
      `, [courseId]);
      
      console.log(`📹 VIDEOS (${videos.rows.length} total):`);
      if (videos.rows.length === 0) {
        console.log("   None\n");
      } else {
        videos.rows.forEach((video, idx) => {
          console.log(`   ${idx + 1}. ${video.title}`);
          if (video.description) console.log(`      Description: ${video.description.substring(0, 100)}${video.description.length > 100 ? '...' : ''}`);
          if (video.video_url) console.log(`      URL: ${video.video_url.substring(0, 60)}${video.video_url.length > 60 ? '...' : ''}`);
          if (video.duration) console.log(`      Duration: ${video.duration} minutes`);
          console.log(`      Order: ${video.order_index}, Published: ${video.is_published ? 'Yes' : 'No'}`);
          console.log("");
        });
      }

      // Get readings
      const readings = await neonPool.query(`
        SELECT id, title, description, reading_type, content, book_title, book_author, 
               chapter_number, order_index, is_active
        FROM course_readings
        WHERE course_id = $1
        ORDER BY order_index
      `, [courseId]);
      
      console.log(`📖 READINGS (${readings.rows.length} total):`);
      if (readings.rows.length === 0) {
        console.log("   None\n");
      } else {
        readings.rows.forEach((reading, idx) => {
          console.log(`   ${idx + 1}. ${reading.title}`);
          if (reading.description) console.log(`      Description: ${reading.description.substring(0, 100)}${reading.description.length > 100 ? '...' : ''}`);
          if (reading.reading_type) console.log(`      Type: ${reading.reading_type}`);
          if (reading.book_title) console.log(`      Book: ${reading.book_title}`);
          if (reading.book_author) console.log(`      Author: ${reading.book_author}`);
          if (reading.chapter_number) console.log(`      Chapter: ${reading.chapter_number}`);
          if (reading.content) console.log(`      Content length: ${reading.content.length} characters`);
          console.log(`      Order: ${reading.order_index}, Active: ${reading.is_active ? 'Yes' : 'No'}`);
          console.log("");
        });
      }

      // Get quizzes
      const quizzes = await neonPool.query(`
        SELECT q.id, q.title, q.time_limit, q.passing_score, q.is_final_exam, 
               q.is_published, COUNT(qq.id) as question_count
        FROM quizzes q
        LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
        WHERE q.id IN (
          SELECT DISTINCT quiz_id 
          FROM quiz_questions 
          WHERE quiz_id IN (
            SELECT id FROM quizzes WHERE module_id IS NULL
          )
        )
        OR q.id IN (
          SELECT DISTINCT quiz_id 
          FROM quiz_questions 
          WHERE quiz_id BETWEEN 13 AND 23
        )
        OR q.id IN (
          SELECT DISTINCT quiz_id 
          FROM quiz_questions 
          WHERE quiz_id BETWEEN 48 AND 58
        )
        OR q.id IN (
          SELECT DISTINCT quiz_id 
          FROM quiz_questions 
          WHERE quiz_id IN (26, 46, 37, 38, 39, 40, 41, 42, 43, 44, 45, 47)
        )
        OR q.id IN (
          SELECT DISTINCT quiz_id 
          FROM quiz_questions 
          WHERE quiz_id BETWEEN 59 AND 70
        )
        OR q.id IN (
          SELECT DISTINCT quiz_id 
          FROM quiz_questions 
          WHERE quiz_id IN (76, 77, 78, 79, 80, 82)
        )
        OR q.id IN (
          SELECT DISTINCT quiz_id 
          FROM quiz_questions 
          WHERE quiz_id BETWEEN 200 AND 206
        )
        OR q.id IN (
          SELECT DISTINCT quiz_id 
          FROM quiz_questions 
          WHERE quiz_id BETWEEN 207 AND 212
        )
        GROUP BY q.id
        ORDER BY q.id
      `);
      
      // Better approach: Get quizzes based on course progress config
      const courseQuizIds: Record<number, number[]> = {
        1: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], // Acts in Action
        2: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58], // Fire Starter
        3: [26, 46, 37, 38, 39, 40, 41, 42, 43, 44, 45, 47], // Don't Be a Jonah
        4: [71, 72, 73, 74, 75], // G.R.O.W
        5: [59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70], // Studying for Service
        6: [76, 77, 78, 79, 80, 82], // Deacon Course
        7: [200, 201, 202, 203, 204, 206], // Level Up Leadership
        8: [207, 208, 209, 210, 211, 212], // Youth Ministry
      };

      const quizIds = courseQuizIds[courseId] || [];
      const courseQuizzes = await neonPool.query(`
        SELECT q.id, q.title, q.time_limit, q.passing_score, q.is_final_exam, 
               q.is_published, COUNT(qq.id) as question_count
        FROM quizzes q
        LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
        WHERE q.id = ANY($1)
        GROUP BY q.id
        ORDER BY q.id
      `, [quizIds]);
      
      console.log(`📝 QUIZZES (${courseQuizzes.rows.length} total):`);
      if (courseQuizzes.rows.length === 0) {
        console.log("   None\n");
      } else {
        courseQuizzes.rows.forEach((quiz, idx) => {
          console.log(`   ${idx + 1}. ${quiz.title} (ID: ${quiz.id})`);
          if (quiz.time_limit) console.log(`      Time Limit: ${quiz.time_limit} minutes`);
          console.log(`      Passing Score: ${quiz.passing_score}%`);
          console.log(`      Questions: ${quiz.question_count}`);
          console.log(`      Final Exam: ${quiz.is_final_exam ? 'Yes' : 'No'}`);
          console.log(`      Published: ${quiz.is_published ? 'Yes' : 'No'}`);
          console.log("");
        });
      }

      // Get course modules
      const modules = await neonPool.query(`
        SELECT id, title, description, module_type, week_number, order_index, 
               external_url, is_required
        FROM course_modules
        WHERE course_id = $1
        ORDER BY order_index
      `, [courseId]);
      
      console.log(`📑 COURSE MODULES (${modules.rows.length} total):`);
      if (modules.rows.length === 0) {
        console.log("   None\n");
      } else {
        modules.rows.forEach((module, idx) => {
          console.log(`   ${idx + 1}. ${module.title}`);
          if (module.description) console.log(`      Description: ${module.description.substring(0, 100)}${module.description.length > 100 ? '...' : ''}`);
          if (module.module_type) console.log(`      Type: ${module.module_type}`);
          if (module.week_number) console.log(`      Week: ${module.week_number}`);
          if (module.external_url) console.log(`      External URL: ${module.external_url.substring(0, 60)}${module.external_url.length > 60 ? '...' : ''}`);
          console.log(`      Order: ${module.order_index}, Required: ${module.is_required ? 'Yes' : 'No'}`);
          console.log("");
        });
      }

      console.log("\n");
    }

    // Summary
    console.log(`${"=".repeat(80)}`);
    console.log("SUMMARY");
    console.log(`${"=".repeat(80)}\n`);
    
    const totalVideos = await neonPool.query('SELECT COUNT(*) as count FROM course_videos');
    const totalReadings = await neonPool.query('SELECT COUNT(*) as count FROM course_readings');
    const totalQuizzes = await neonPool.query('SELECT COUNT(*) as count FROM quizzes');
    const totalQuestions = await neonPool.query('SELECT COUNT(*) as count FROM quiz_questions');
    const totalModules = await neonPool.query('SELECT COUNT(*) as count FROM course_modules');
    
    console.log(`Total Courses: ${courses.rows.length}`);
    console.log(`Total Videos: ${totalVideos.rows[0].count}`);
    console.log(`Total Readings: ${totalReadings.rows[0].count}`);
    console.log(`Total Quizzes: ${totalQuizzes.rows[0].count}`);
    console.log(`Total Quiz Questions: ${totalQuestions.rows[0].count}`);
    console.log(`Total Course Modules: ${totalModules.rows[0].count}`);

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  } finally {
    await neonPool.end();
    process.exit(0);
  }
}

generateDetailedReport();







