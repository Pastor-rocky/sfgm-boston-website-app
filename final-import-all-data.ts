import { Pool } from 'pg';

const LOCAL_DB_URL = process.env.LOCAL_DATABASE_URL || "postgresql://rocky@localhost:5432/boston_ministry";
const NEON_DB_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

const localPool = new Pool({ connectionString: LOCAL_DB_URL });
const neonPool = new Pool({ connectionString: NEON_DB_URL });

// Map: local course ID → Neon course ID (should be same: 1-8)
async function importAllData() {
  try {
    console.log("🚀 FINAL IMPORT: Copying ALL data from local to Neon...\n");

    // Step 1: Import courses (IDs 1-8)
    console.log("📚 Step 1: Importing courses...");
    const localCourses = await localPool.query('SELECT * FROM courses ORDER BY id');
    console.log(`Found ${localCourses.rows.length} courses in local database`);
    
    for (const course of localCourses.rows) {
      try {
        await neonPool.query(`
          INSERT INTO courses (id, name, description, duration, category, difficulty, points, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            duration = EXCLUDED.duration,
            category = EXCLUDED.category,
            difficulty = EXCLUDED.difficulty,
            points = EXCLUDED.points,
            is_active = EXCLUDED.is_active
        `, [
          course.id,
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
        console.log(`  ✅ Course ${course.id}: ${course.name}`);
      } catch (error: any) {
        console.error(`  ❌ Error importing course ${course.id}:`, error.message);
      }
    }
    console.log("✅ Courses imported\n");

    // Step 2: Import course_modules
    console.log("📝 Step 2: Importing course_modules...");
    const localModules = await localPool.query('SELECT * FROM course_modules ORDER BY id');
    console.log(`Found ${localModules.rows.length} modules`);
    
    for (const module of localModules.rows) {
      try {
        await neonPool.query(`
          INSERT INTO course_modules (id, course_id, title, description, video_url, reading_material, 
                                     order_index, week_number, module_type, is_required, external_url, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO NOTHING
        `, [
          module.id,
          module.course_id,
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
      } catch (error: any) {
        console.error(`  ❌ Error importing module ${module.id}:`, error.message);
      }
    }
    const neonModules = await neonPool.query('SELECT COUNT(*) as count FROM course_modules');
    console.log(`✅ Imported ${neonModules.rows[0].count} modules\n`);

    // Step 3: Import course_readings
    console.log("📖 Step 3: Importing course_readings...");
    const localReadings = await localPool.query('SELECT * FROM course_readings ORDER BY id');
    for (const reading of localReadings.rows) {
      try {
        await neonPool.query(`
          INSERT INTO course_readings (id, course_id, title, description, reading_type, content, 
                                     book_title, book_author, book_cover_url, chapter_number, 
                                     order_index, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (id) DO NOTHING
        `, [
          reading.id, reading.course_id, reading.title, reading.description, reading.reading_type,
          reading.content, reading.book_title, reading.book_author, reading.book_cover_url,
          reading.chapter_number, reading.order_index, reading.is_active, reading.created_at, reading.updated_at,
        ]);
      } catch (error: any) {
        console.error(`  ❌ Error importing reading ${reading.id}:`, error.message);
      }
    }
    const neonReadings = await neonPool.query('SELECT COUNT(*) as count FROM course_readings');
    console.log(`✅ Imported ${neonReadings.rows[0].count} readings\n`);

    // Step 4: Import course_videos
    console.log("🎥 Step 4: Importing course_videos...");
    const localVideos = await localPool.query('SELECT * FROM course_videos ORDER BY id');
    for (const video of localVideos.rows) {
      try {
        await neonPool.query(`
          INSERT INTO course_videos (id, course_id, module_id, title, description, video_url, duration, 
                                   order_index, is_required, is_published, published_at, created_at, updated_at)
          VALUES ($1, $2, NULL, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO NOTHING
        `, [
          video.id, video.course_id, video.title, video.description, video.video_url,
          video.duration, video.order_index, video.is_required, video.is_published,
          video.published_at, video.created_at, video.updated_at,
        ]);
      } catch (error: any) {
        console.error(`  ❌ Error importing video ${video.id}:`, error.message);
      }
    }
    const neonVideos = await neonPool.query('SELECT COUNT(*) as count FROM course_videos');
    console.log(`✅ Imported ${neonVideos.rows[0].count} videos\n`);

    // Step 5: Import quizzes (already done, but verify)
    const neonQuizzes = await neonPool.query('SELECT COUNT(*) as count FROM quizzes');
    const neonQuestions = await neonPool.query('SELECT COUNT(*) as count FROM quiz_questions');
    console.log(`📊 Quizzes: ${neonQuizzes.rows[0].count}, Questions: ${neonQuestions.rows[0].count}\n`);

    // Final summary
    const courses = await neonPool.query('SELECT id, name FROM courses ORDER BY id');
    console.log("📊 Final Summary:");
    console.log(`   Courses: ${courses.rows.length}`);
    courses.rows.forEach(c => console.log(`     ID ${c.id}: ${c.name}`));
    console.log(`   Modules: ${neonModules.rows[0].count}`);
    console.log(`   Readings: ${neonReadings.rows[0].count}`);
    console.log(`   Videos: ${neonVideos.rows[0].count}`);
    console.log(`   Quizzes: ${neonQuizzes.rows[0].count}`);
    console.log(`   Questions: ${neonQuestions.rows[0].count}`);
    console.log("\n✅ Import complete!");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  } finally {
    await localPool.end();
    await neonPool.end();
    process.exit(0);
  }
}

importAllData();







