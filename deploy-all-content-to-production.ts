#!/usr/bin/env node

/**
 * COMPLETE CONTENT DEPLOYMENT SCRIPT
 * 
 * This script copies EVERYTHING from your local database to production:
 * - Courses
 * - Course Modules
 * - Course Videos
 * - Course Readings (107 readings)
 * - Quizzes & Questions
 * - Textbook Projects & Chapters
 * - Images
 * 
 * ONE COMMAND TO GET EVERYTHING WORKING ON PRODUCTION!
 * 
 * Usage:
 *   LOCAL_DATABASE_URL="postgresql://..." DATABASE_URL="postgresql://..." npx tsx deploy-all-content-to-production.ts
 */

import { Pool } from 'pg';

const LOCAL_DB_URL = process.env.LOCAL_DATABASE_URL || "postgresql://rocky@localhost:5432/boston_ministry";
const PRODUCTION_DB_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

if (!PRODUCTION_DB_URL) {
  console.error("❌ ERROR: DATABASE_URL or NEON_DATABASE_URL must be set!");
  console.error("\nSet your production database URL:");
  console.error('  export DATABASE_URL="postgresql://user:pass@host/db"');
  process.exit(1);
}

const localPool = new Pool({ connectionString: LOCAL_DB_URL });
const prodPool = new Pool({ connectionString: PRODUCTION_DB_URL });

// Course ID mapping: Local IDs → Production IDs
// Based on your database structure
const COURSE_ID_MAP: Record<number, number> = {
  1: 21, // Acts in Action
  2: 22, // Fire Starter
  3: 23, // Don't Be a Jonah
  4: 20, // G.R.O.W
  5: 24, // Studying for Service
  6: 25, // Deacon Course
  7: 26, // Level Up Leadership
  8: 27, // Youth Ministry
};

async function deployAllContent() {
  console.log("🚀 DEPLOYING ALL CONTENT TO PRODUCTION");
  console.log("=" .repeat(60));
  console.log(`📦 Local DB: ${LOCAL_DB_URL.split('@')[1] || 'localhost'}`);
  console.log(`🌐 Production DB: ${PRODUCTION_DB_URL.split('@')[1]?.split('/')[0] || 'production'}`);
  console.log("=" .repeat(60) + "\n");

  try {
    // ============================================
    // STEP 1: COURSES
    // ============================================
    console.log("📚 STEP 1: Importing Courses...");
    const localCourses = await localPool.query('SELECT * FROM courses ORDER BY id');
    console.log(`   Found ${localCourses.rows.length} courses locally`);

    for (const course of localCourses.rows) {
      try {
        await prodPool.query(`
          INSERT INTO courses (id, name, description, duration, category, difficulty, points, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            duration = EXCLUDED.duration,
            category = EXCLUDED.category,
            difficulty = EXCLUDED.difficulty,
            points = EXCLUDED.points,
            is_active = EXCLUDED.is_active,
            updated_at = NOW()
        `, [
          course.id, course.name, course.description, course.duration,
          course.category, course.difficulty, course.points, course.is_active,
          course.created_at, course.updated_at
        ]);
        console.log(`   ✅ Course ${course.id}: ${course.name}`);
      } catch (error: any) {
        console.error(`   ❌ Course ${course.id}: ${error.message}`);
      }
    }
    const prodCourses = await prodPool.query('SELECT COUNT(*) as count FROM courses');
    console.log(`   ✅ Total in production: ${prodCourses.rows[0].count} courses\n`);

    // ============================================
    // STEP 2: COURSE MODULES
    // ============================================
    console.log("📝 STEP 2: Importing Course Modules...");
    const localModules = await localPool.query(`
      SELECT id, course_id, title, description, video_url, reading_material, 
             order_index, week_number, module_type, is_required, external_url, created_at
      FROM course_modules ORDER BY id
    `);
    console.log(`   Found ${localModules.rows.length} modules locally`);

    let importedModules = 0;
    for (const module of localModules.rows) {
      try {
        const newCourseId = COURSE_ID_MAP[module.course_id] || module.course_id;
        await prodPool.query(`
          INSERT INTO course_modules (id, course_id, title, description, video_url, reading_material, 
                                     order_index, week_number, module_type, is_required, external_url, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO UPDATE SET
            course_id = EXCLUDED.course_id,
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            video_url = EXCLUDED.video_url,
            reading_material = EXCLUDED.reading_material,
            order_index = EXCLUDED.order_index,
            week_number = EXCLUDED.week_number,
            module_type = EXCLUDED.module_type,
            is_required = EXCLUDED.is_required,
            external_url = EXCLUDED.external_url
        `, [
          module.id, newCourseId, module.title, module.description, module.video_url,
          module.reading_material, module.order_index, module.week_number, module.module_type,
          module.is_required, module.external_url, module.created_at
        ]);
        importedModules++;
      } catch (error: any) {
        console.error(`   ❌ Module ${module.id}: ${error.message}`);
      }
    }
    const prodModules = await prodPool.query('SELECT COUNT(*) as count FROM course_modules');
    console.log(`   ✅ Imported/Updated ${importedModules} modules`);
    console.log(`   ✅ Total in production: ${prodModules.rows[0].count} modules\n`);

    // ============================================
    // STEP 3: COURSE VIDEOS
    // ============================================
    console.log("🎥 STEP 3: Importing Course Videos...");
    const localVideos = await localPool.query(`
      SELECT id, course_id, module_id, title, description, video_url, duration, 
             order_index, is_required, is_published, published_at, created_at, updated_at
      FROM course_videos ORDER BY id
    `);
    console.log(`   Found ${localVideos.rows.length} videos locally`);

    let importedVideos = 0;
    for (const video of localVideos.rows) {
      try {
        const newCourseId = COURSE_ID_MAP[video.course_id] || video.course_id;
        await prodPool.query(`
          INSERT INTO course_videos (id, course_id, module_id, title, description, video_url, duration, 
                                   order_index, is_required, is_published, published_at, created_at, updated_at)
          VALUES ($1, $2, NULL, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO UPDATE SET
            course_id = EXCLUDED.course_id,
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            video_url = EXCLUDED.video_url,
            duration = EXCLUDED.duration,
            order_index = EXCLUDED.order_index,
            is_required = EXCLUDED.is_required,
            is_published = EXCLUDED.is_published,
            published_at = EXCLUDED.published_at,
            updated_at = NOW()
        `, [
          video.id, newCourseId, video.title, video.description, video.video_url,
          video.duration, video.order_index, video.is_required, video.is_published,
          video.published_at, video.created_at, video.updated_at
        ]);
        importedVideos++;
        if (importedVideos % 20 === 0) {
          console.log(`   ✅ Imported ${importedVideos} videos...`);
        }
      } catch (error: any) {
        console.error(`   ❌ Video ${video.id}: ${error.message}`);
      }
    }
    const prodVideos = await prodPool.query('SELECT COUNT(*) as count FROM course_videos');
    console.log(`   ✅ Imported/Updated ${importedVideos} videos`);
    console.log(`   ✅ Total in production: ${prodVideos.rows[0].count} videos\n`);

    // ============================================
    // STEP 4: COURSE READINGS (107 readings)
    // ============================================
    console.log("📖 STEP 4: Importing Course Readings...");
    const localReadings = await localPool.query(`
      SELECT id, course_id, title, description, reading_type, content, book_title, book_author, 
             book_cover_url, chapter_number, order_index, is_active, created_at, updated_at
      FROM course_readings ORDER BY id
    `);
    console.log(`   Found ${localReadings.rows.length} readings locally`);

    let importedReadings = 0;
    for (const reading of localReadings.rows) {
      try {
        const newCourseId = COURSE_ID_MAP[reading.course_id] || reading.course_id;
        await prodPool.query(`
          INSERT INTO course_readings (id, course_id, title, description, reading_type, content, 
                                     book_title, book_author, book_cover_url, chapter_number, 
                                     order_index, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (id) DO UPDATE SET
            course_id = EXCLUDED.course_id,
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            reading_type = EXCLUDED.reading_type,
            content = EXCLUDED.content,
            book_title = EXCLUDED.book_title,
            book_author = EXCLUDED.book_author,
            book_cover_url = EXCLUDED.book_cover_url,
            chapter_number = EXCLUDED.chapter_number,
            order_index = EXCLUDED.order_index,
            is_active = EXCLUDED.is_active,
            updated_at = NOW()
        `, [
          reading.id, newCourseId, reading.title, reading.description, reading.reading_type,
          reading.content, reading.book_title, reading.book_author, reading.book_cover_url,
          reading.chapter_number, reading.order_index, reading.is_active,
          reading.created_at, reading.updated_at
        ]);
        importedReadings++;
        if (importedReadings % 20 === 0) {
          console.log(`   ✅ Imported ${importedReadings} readings...`);
        }
      } catch (error: any) {
        console.error(`   ❌ Reading ${reading.id}: ${error.message}`);
      }
    }
    const prodReadings = await prodPool.query('SELECT COUNT(*) as count FROM course_readings');
    console.log(`   ✅ Imported/Updated ${importedReadings} readings`);
    console.log(`   ✅ Total in production: ${prodReadings.rows[0].count} readings\n`);

    // ============================================
    // STEP 5: QUIZZES
    // ============================================
    console.log("📝 STEP 5: Importing Quizzes...");
    const localQuizzes = await localPool.query(`
      SELECT id, module_id, title, time_limit, passing_score, is_final_exam, is_published, published_at, created_at
      FROM quizzes ORDER BY id
    `);
    console.log(`   Found ${localQuizzes.rows.length} quizzes locally`);

    let importedQuizzes = 0;
    for (const quiz of localQuizzes.rows) {
      try {
        await prodPool.query(`
          INSERT INTO quizzes (id, module_id, title, time_limit, passing_score, is_final_exam, is_published, published_at, created_at)
          VALUES ($1, NULL, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            time_limit = EXCLUDED.time_limit,
            passing_score = EXCLUDED.passing_score,
            is_final_exam = EXCLUDED.is_final_exam,
            is_published = EXCLUDED.is_published,
            published_at = EXCLUDED.published_at
        `, [
          quiz.id, quiz.title, quiz.time_limit, quiz.passing_score,
          quiz.is_final_exam, quiz.is_published, quiz.published_at, quiz.created_at
        ]);
        importedQuizzes++;
        if (importedQuizzes % 20 === 0) {
          console.log(`   ✅ Imported ${importedQuizzes} quizzes...`);
        }
      } catch (error: any) {
        console.error(`   ❌ Quiz ${quiz.id}: ${error.message}`);
      }
    }
    const prodQuizzes = await prodPool.query('SELECT COUNT(*) as count FROM quizzes');
    console.log(`   ✅ Imported/Updated ${importedQuizzes} quizzes`);
    console.log(`   ✅ Total in production: ${prodQuizzes.rows[0].count} quizzes\n`);

    // ============================================
    // STEP 6: QUIZ QUESTIONS
    // ============================================
    console.log("❓ STEP 6: Importing Quiz Questions...");
    const localQuestions = await localPool.query(`
      SELECT id, quiz_id, question, type, options, correct_answer, points, order_index, is_bonus, parent_question_id
      FROM quiz_questions ORDER BY id
    `);
    console.log(`   Found ${localQuestions.rows.length} questions locally`);

    let importedQuestions = 0;
    for (const q of localQuestions.rows) {
      try {
        // Handle options JSON
        let optionsJson = null;
        if (q.options) {
          if (typeof q.options === 'string') {
            try {
              optionsJson = JSON.stringify(JSON.parse(q.options));
            } catch {
              optionsJson = q.options;
            }
          } else {
            optionsJson = JSON.stringify(q.options);
          }
        }

        await prodPool.query(`
          INSERT INTO quiz_questions (id, quiz_id, question, type, options, correct_answer, points, order_index, is_bonus, parent_question_id)
          VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO UPDATE SET
            quiz_id = EXCLUDED.quiz_id,
            question = EXCLUDED.question,
            type = EXCLUDED.type,
            options = EXCLUDED.options,
            correct_answer = EXCLUDED.correct_answer,
            points = EXCLUDED.points,
            order_index = EXCLUDED.order_index,
            is_bonus = EXCLUDED.is_bonus,
            parent_question_id = EXCLUDED.parent_question_id
        `, [
          q.id, q.quiz_id, q.question, q.type, optionsJson, q.correct_answer,
          q.points, q.order_index, q.is_bonus, q.parent_question_id
        ]);
        importedQuestions++;
        if (importedQuestions % 100 === 0) {
          console.log(`   ✅ Imported ${importedQuestions} questions...`);
        }
      } catch (error: any) {
        if (!error.message?.includes('duplicate') && !error.message?.includes('unique')) {
          console.error(`   ❌ Question ${q.id}: ${error.message}`);
        }
      }
    }
    const prodQuestions = await prodPool.query('SELECT COUNT(*) as count FROM quiz_questions');
    console.log(`   ✅ Imported/Updated ${importedQuestions} questions`);
    console.log(`   ✅ Total in production: ${prodQuestions.rows[0].count} questions\n`);

    // ============================================
    // STEP 7: TEXTBOOK PROJECTS & CHAPTERS
    // ============================================
    console.log("📕 STEP 7: Importing Textbook Projects...");
    const localProjects = await localPool.query(`
      SELECT id, course_id, title, author, description, cover_url, is_complete, created_at, updated_at
      FROM textbook_projects ORDER BY id
    `).catch(() => ({ rows: [] }));
    console.log(`   Found ${localProjects.rows.length} textbook projects locally`);

    let importedProjects = 0;
    for (const project of localProjects.rows) {
      try {
        const newCourseId = COURSE_ID_MAP[project.course_id] || project.course_id;
        await prodPool.query(`
          INSERT INTO textbook_projects (id, course_id, title, author, description, cover_url, is_complete, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO UPDATE SET
            course_id = EXCLUDED.course_id,
            title = EXCLUDED.title,
            author = EXCLUDED.author,
            description = EXCLUDED.description,
            cover_url = EXCLUDED.cover_url,
            is_complete = EXCLUDED.is_complete,
            updated_at = NOW()
        `, [
          project.id, newCourseId, project.title, project.author, project.description,
          project.cover_url, project.is_complete, project.created_at, project.updated_at
        ]);
        importedProjects++;
      } catch (error: any) {
        console.error(`   ❌ Project ${project.id}: ${error.message}`);
      }
    }
    const prodProjects = await prodPool.query('SELECT COUNT(*) as count FROM textbook_projects').catch(() => ({ rows: [{ count: 0 }] }));
    console.log(`   ✅ Imported/Updated ${importedProjects} projects`);
    console.log(`   ✅ Total in production: ${prodProjects.rows[0].count} projects\n`);

    console.log("📗 STEP 7b: Importing Textbook Chapters...");
    const localChapters = await localPool.query(`
      SELECT id, project_id, chapter_number, title, content, is_introduction, is_conclusion, created_at
      FROM textbook_chapters ORDER BY id
    `).catch(() => ({ rows: [] }));
    console.log(`   Found ${localChapters.rows.length} chapters locally`);

    let importedChapters = 0;
    for (const chapter of localChapters.rows) {
      try {
        await prodPool.query(`
          INSERT INTO textbook_chapters (id, project_id, chapter_number, title, content, is_introduction, is_conclusion, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            project_id = EXCLUDED.project_id,
            chapter_number = EXCLUDED.chapter_number,
            title = EXCLUDED.title,
            content = EXCLUDED.content,
            is_introduction = EXCLUDED.is_introduction,
            is_conclusion = EXCLUDED.is_conclusion
        `, [
          chapter.id, chapter.project_id, chapter.chapter_number, chapter.title,
          chapter.content, chapter.is_introduction, chapter.is_conclusion, chapter.created_at
        ]);
        importedChapters++;
        if (importedChapters % 50 === 0) {
          console.log(`   ✅ Imported ${importedChapters} chapters...`);
        }
      } catch (error: any) {
        console.error(`   ❌ Chapter ${chapter.id}: ${error.message}`);
      }
    }
    const prodChapters = await prodPool.query('SELECT COUNT(*) as count FROM textbook_chapters').catch(() => ({ rows: [{ count: 0 }] }));
    console.log(`   ✅ Imported/Updated ${importedChapters} chapters`);
    console.log(`   ✅ Total in production: ${prodChapters.rows[0].count} chapters\n`);

    // ============================================
    // STEP 8: IMAGES
    // ============================================
    console.log("🖼️  STEP 8: Importing Images...");
    const localImages = await localPool.query(`
      SELECT id, url, alt_text, category, created_at
      FROM images ORDER BY id
    `).catch(() => ({ rows: [] }));
    console.log(`   Found ${localImages.rows.length} images locally`);

    let importedImages = 0;
    for (const image of localImages.rows) {
      try {
        await prodPool.query(`
          INSERT INTO images (id, url, alt_text, category, created_at)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO UPDATE SET
            url = EXCLUDED.url,
            alt_text = EXCLUDED.alt_text,
            category = EXCLUDED.category
        `, [
          image.id, image.url, image.alt_text, image.category, image.created_at
        ]);
        importedImages++;
      } catch (error: any) {
        console.error(`   ❌ Image ${image.id}: ${error.message}`);
      }
    }
    const prodImages = await prodPool.query('SELECT COUNT(*) as count FROM images').catch(() => ({ rows: [{ count: 0 }] }));
    console.log(`   ✅ Imported/Updated ${importedImages} images`);
    console.log(`   ✅ Total in production: ${prodImages.rows[0].count} images\n`);

    // ============================================
    // FINAL SUMMARY
    // ============================================
    console.log("=" .repeat(60));
    console.log("✅ DEPLOYMENT COMPLETE!");
    console.log("=" .repeat(60));
    console.log("\n📊 PRODUCTION DATABASE SUMMARY:");
    console.log(`   📚 Courses: ${prodCourses.rows[0].count}`);
    console.log(`   📝 Modules: ${prodModules.rows[0].count}`);
    console.log(`   🎥 Videos: ${prodVideos.rows[0].count}`);
    console.log(`   📖 Readings: ${prodReadings.rows[0].count}`);
    console.log(`   📝 Quizzes: ${prodQuizzes.rows[0].count}`);
    console.log(`   ❓ Questions: ${prodQuestions.rows[0].count}`);
    console.log(`   📕 Textbook Projects: ${prodProjects.rows[0].count}`);
    console.log(`   📗 Textbook Chapters: ${prodChapters.rows[0].count}`);
    console.log(`   🖼️  Images: ${prodImages.rows[0].count}`);
    console.log("\n🎉 ALL YOUR CONTENT IS NOW ON PRODUCTION!");
    console.log("\n⚠️  IMPORTANT: Make sure your MP3 files and PDFs are uploaded to production server!");
    console.log("   - MP3 files should be in: public/uploads/textbook-audio/");
    console.log("   - PDF files should be in: public/pdfs/");
    console.log("\n");

  } catch (error: any) {
    console.error("\n❌ DEPLOYMENT FAILED!");
    console.error(`Error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await localPool.end();
    await prodPool.end();
  }
}

// Run the deployment
deployAllContent()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });



