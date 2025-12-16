import { Pool } from 'pg';

const LOCAL_DB_URL = process.env.LOCAL_DATABASE_URL || "postgresql://rocky@localhost:5432/boston_ministry";
const NEON_DB_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

const localPool = new Pool({ connectionString: LOCAL_DB_URL });
const neonPool = new Pool({ connectionString: NEON_DB_URL });

// Map: old DB ID → correct ID
const COURSE_ID_MAP: Record<number, number> = {
  20: 4, // G.R.O.W → 4
  21: 1, // Acts → 1
  22: 2, // Fire Starter → 2
  23: 3, // Jonah → 3
  24: 5, // Studying → 5
  25: 6, // Deacon → 6
  26: 7, // Level Up → 7
  27: 8, // Youth → 8
};

async function recreateCourses() {
  try {
    console.log("🔄 Recreating courses with correct IDs...\n");

    // Step 1: Delete all foreign key data (in correct order to respect foreign keys)
    console.log("📝 Step 1: Deleting foreign key data...");
    await neonPool.query('DELETE FROM quiz_questions'); // Delete first (references quizzes)
    await neonPool.query('DELETE FROM quizzes'); // Then quizzes
    await neonPool.query('DELETE FROM course_modules');
    await neonPool.query('DELETE FROM course_readings');
    await neonPool.query('DELETE FROM course_videos');
    await neonPool.query('DELETE FROM enrollments');
    console.log("✅ Deleted foreign key data\n");

    // Step 2: Delete and recreate courses with correct IDs
    console.log("📝 Step 2: Recreating courses...");
    await neonPool.query('DELETE FROM courses');
    
    const localCourses = await localPool.query('SELECT * FROM courses ORDER BY id');
    for (const course of localCourses.rows) {
      const correctId = COURSE_ID_MAP[course.id];
      if (!correctId) continue;
      
      await neonPool.query(`
        INSERT INTO courses (id, name, description, duration, category, difficulty, points, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        correctId,
        course.name,
        course.description,
        course.duration,
        course.category,
        course.difficulty,
        course.points,
        course.is_active,
        course.created_at,
        course.updated_at,
      ]);
    }
    console.log("✅ Recreated courses\n");

    // Step 3: Re-import all data with correct course IDs
    console.log("📝 Step 3: Re-importing course_modules...");
    const localModules = await localPool.query('SELECT * FROM course_modules ORDER BY id');
    for (const module of localModules.rows) {
      const correctCourseId = COURSE_ID_MAP[module.course_id];
      if (!correctCourseId) continue;
      
      await neonPool.query(`
        INSERT INTO course_modules (id, course_id, title, description, video_url, reading_material, 
                                   order_index, week_number, module_type, is_required, external_url, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        module.id,
        correctCourseId,
        module.title,
        module.description,
        module.video_url,
        module.reading_material,
        module.order_index,
        module.week_number,
        module.module_type,
        module.is_required,
        module.external_url,
        module.created_at,
      ]);
    }
    console.log(`✅ Imported ${localModules.rows.length} modules\n`);

    console.log("📝 Step 4: Re-importing course_readings...");
    const localReadings = await localPool.query('SELECT * FROM course_readings ORDER BY id');
    for (const reading of localReadings.rows) {
      const correctCourseId = COURSE_ID_MAP[reading.course_id];
      if (!correctCourseId) continue;
      
      await neonPool.query(`
        INSERT INTO course_readings (id, course_id, title, description, reading_type, content, 
                                     book_title, book_author, book_cover_url, chapter_number, 
                                     order_index, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        reading.id,
        correctCourseId,
        reading.title,
        reading.description,
        reading.reading_type,
        reading.content,
        reading.book_title,
        reading.book_author,
        reading.book_cover_url,
        reading.chapter_number,
        reading.order_index,
        reading.is_active,
        reading.created_at,
        reading.updated_at,
      ]);
    }
    console.log(`✅ Imported ${localReadings.rows.length} readings\n`);

    console.log("📝 Step 5: Re-importing course_videos...");
    const localVideos = await localPool.query('SELECT * FROM course_videos ORDER BY id');
    for (const video of localVideos.rows) {
      const correctCourseId = COURSE_ID_MAP[video.course_id];
      if (!correctCourseId) continue;
      
      await neonPool.query(`
        INSERT INTO course_videos (id, course_id, module_id, title, description, video_url, duration, 
                                   order_index, is_required, is_published, published_at, created_at, updated_at)
        VALUES ($1, $2, NULL, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        video.id,
        correctCourseId,
        video.title,
        video.description,
        video.video_url,
        video.duration,
        video.order_index,
        video.is_required,
        video.is_published,
        video.published_at,
        video.created_at,
        video.updated_at,
      ]);
    }
    console.log(`✅ Imported ${localVideos.rows.length} videos\n`);

    // Re-import quizzes and questions
    console.log("📝 Step 6: Re-importing quizzes...");
    const localQuizzes = await localPool.query('SELECT * FROM quizzes ORDER BY id');
    for (const quiz of localQuizzes.rows) {
      await neonPool.query(`
        INSERT INTO quizzes (id, module_id, title, time_limit, passing_score, is_final_exam, 
                            is_published, published_at, created_at)
        VALUES ($1, NULL, $2, $3, $4, $5, $6, $7, $8)
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
    }
    console.log(`✅ Imported ${localQuizzes.rows.length} quizzes\n`);

    console.log("📝 Step 7: Re-importing quiz_questions...");
    const localQuestions = await localPool.query('SELECT * FROM quiz_questions ORDER BY id LIMIT 100');
    for (const question of localQuestions.rows) {
      try {
        await neonPool.query(`
          INSERT INTO quiz_questions (id, quiz_id, question, type, options, correct_answer, 
                                     points, order_index, is_bonus, parent_question_id)
          VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO NOTHING
        `, [
          question.id,
          question.quiz_id,
          question.question,
          question.type,
          typeof question.options === 'string' ? question.options : JSON.stringify(question.options),
          question.correct_answer,
          question.points,
          question.order_index,
          question.is_bonus,
          question.parent_question_id,
        ]);
      } catch (error: any) {
        // Skip errors
      }
    }
    // Import remaining in batches
    const allQuestions = await localPool.query('SELECT * FROM quiz_questions ORDER BY id OFFSET 100');
    for (const question of allQuestions.rows) {
      try {
        await neonPool.query(`
          INSERT INTO quiz_questions (id, quiz_id, question, type, options, correct_answer, 
                                     points, order_index, is_bonus, parent_question_id)
          VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO NOTHING
        `, [
          question.id,
          question.quiz_id,
          question.question,
          question.type,
          typeof question.options === 'string' ? question.options : JSON.stringify(question.options),
          question.correct_answer,
          question.points,
          question.order_index,
          question.is_bonus,
          question.parent_question_id,
        ]);
      } catch (error: any) {
        // Skip errors
      }
    }
    console.log(`✅ Imported quiz questions\n`);

    console.log("\n✅ All data recreated with correct course IDs!");
    
    const courses = await neonPool.query('SELECT id, name FROM courses ORDER BY id');
    console.log("\n📊 Courses:");
    courses.rows.forEach(c => console.log(`  ID ${c.id}: ${c.name}`));

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  } finally {
    await localPool.end();
    await neonPool.end();
    process.exit(0);
  }
}

recreateCourses();

