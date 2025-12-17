import { Pool } from 'pg';

const LOCAL_DB_URL = process.env.LOCAL_DATABASE_URL || "postgresql://rocky@localhost:5432/boston_ministry";
const NEON_DB_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

const localPool = new Pool({ connectionString: LOCAL_DB_URL });
const neonPool = new Pool({ connectionString: NEON_DB_URL });

// Map old course IDs to new database IDs
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

async function importEverything() {
  try {
    console.log("🚀 Importing ALL data from local database to Neon...\n");

    // 1. Import course_modules (CRITICAL - course content!)
    console.log("📚 Step 1: Importing course_modules...");
    const localModules = await localPool.query(`
      SELECT id, course_id, title, description, video_url, reading_material, order_index, 
             week_number, module_type, is_required, external_url, created_at
      FROM course_modules
      ORDER BY id
    `);
    console.log(`Found ${localModules.rows.length} modules in local database`);

    let importedModules = 0;
    for (const module of localModules.rows) {
      try {
        const newCourseId = COURSE_ID_MAP[module.course_id];
        if (!newCourseId) {
          console.log(`  ⚠️  Skipping module ${module.id} - unknown course_id ${module.course_id}`);
          continue;
        }

        await neonPool.query(`
          INSERT INTO course_modules (id, course_id, title, description, video_url, reading_material, 
                                     order_index, week_number, module_type, is_required, external_url, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO NOTHING
        `, [
          module.id,
          newCourseId,
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

        importedModules++;
        if (importedModules % 20 === 0) {
          console.log(`  ✅ Imported ${importedModules} modules...`);
        }
      } catch (error: any) {
        console.error(`  ❌ Error importing module ${module.id}:`, error.message);
      }
    }
    console.log(`✅ Imported ${importedModules} course_modules\n`);

    // 2. Import course_readings
    console.log("📖 Step 2: Importing course_readings...");
    const localReadings = await localPool.query(`
      SELECT id, course_id, title, description, reading_type, content, book_title, book_author, 
             book_cover_url, chapter_number, order_index, is_active, created_at, updated_at
      FROM course_readings
      ORDER BY id
    `);
    console.log(`Found ${localReadings.rows.length} readings in local database`);

    let importedReadings = 0;
    for (const reading of localReadings.rows) {
      try {
        const newCourseId = COURSE_ID_MAP[reading.course_id];
        if (!newCourseId) {
          console.log(`  ⚠️  Skipping reading ${reading.id} - unknown course_id ${reading.course_id}`);
          continue;
        }

        await neonPool.query(`
          INSERT INTO course_readings (id, course_id, title, description, reading_type, content, 
                                       book_title, book_author, book_cover_url, chapter_number, 
                                       order_index, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (id) DO NOTHING
        `, [
          reading.id,
          newCourseId,
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

        importedReadings++;
      } catch (error: any) {
        console.error(`  ❌ Error importing reading ${reading.id}:`, error.message);
      }
    }
    console.log(`✅ Imported ${importedReadings} course_readings\n`);

    // 3. Import textbook_projects
    console.log("📕 Step 3: Importing textbook_projects...");
    const localProjects = await localPool.query(`
      SELECT id, course_id, title, author, description, cover_url, is_complete, created_at, updated_at
      FROM textbook_projects
      ORDER BY id
    `).catch(() => ({ rows: [] }));
    console.log(`Found ${localProjects.rows.length} textbook projects in local database`);

    let importedProjects = 0;
    for (const project of localProjects.rows) {
      try {
        const newCourseId = COURSE_ID_MAP[project.course_id];
        if (!newCourseId) {
          console.log(`  ⚠️  Skipping project ${project.id} - unknown course_id ${project.course_id}`);
          continue;
        }

        await neonPool.query(`
          INSERT INTO textbook_projects (id, course_id, title, author, description, cover_url, is_complete, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO NOTHING
        `, [
          project.id,
          newCourseId,
          project.title,
          project.author,
          project.description,
          project.cover_url,
          project.is_complete,
          project.created_at,
          project.updated_at,
        ]);

        importedProjects++;
      } catch (error: any) {
        console.error(`  ❌ Error importing project ${project.id}:`, error.message);
      }
    }
    console.log(`✅ Imported ${importedProjects} textbook_projects\n`);

    // 4. Import textbook_chapters
    console.log("📗 Step 4: Importing textbook_chapters...");
    const localChapters = await localPool.query(`
      SELECT id, project_id, chapter_number, title, content, is_introduction, is_conclusion, created_at
      FROM textbook_chapters
      ORDER BY id
    `).catch(() => ({ rows: [] }));
    console.log(`Found ${localChapters.rows.length} textbook chapters in local database`);

    let importedChapters = 0;
    for (const chapter of localChapters.rows) {
      try {
        await neonPool.query(`
          INSERT INTO textbook_chapters (id, project_id, chapter_number, title, content, is_introduction, is_conclusion, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO NOTHING
        `, [
          chapter.id,
          chapter.project_id,
          chapter.chapter_number,
          chapter.title,
          chapter.content,
          chapter.is_introduction,
          chapter.is_conclusion,
          chapter.created_at,
        ]);

        importedChapters++;
        if (importedChapters % 50 === 0) {
          console.log(`  ✅ Imported ${importedChapters} chapters...`);
        }
      } catch (error: any) {
        console.error(`  ❌ Error importing chapter ${chapter.id}:`, error.message);
      }
    }
    console.log(`✅ Imported ${importedChapters} textbook_chapters\n`);

    // 5. Import images
    console.log("🖼️  Step 5: Importing images...");
    const localImages = await localPool.query(`
      SELECT id, url, alt_text, category, created_at
      FROM images
      ORDER BY id
    `).catch(() => ({ rows: [] }));
    console.log(`Found ${localImages.rows.length} images in local database`);

    let importedImages = 0;
    for (const image of localImages.rows) {
      try {
        await neonPool.query(`
          INSERT INTO images (id, url, alt_text, category, created_at)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO NOTHING
        `, [
          image.id,
          image.url,
          image.alt_text,
          image.category,
          image.created_at,
        ]);

        importedImages++;
      } catch (error: any) {
        console.error(`  ❌ Error importing image ${image.id}:`, error.message);
      }
    }
    console.log(`✅ Imported ${importedImages} images\n`);

    // Summary
    const neonModules = await neonPool.query('SELECT COUNT(*) as count FROM course_modules');
    const neonReadings = await neonPool.query('SELECT COUNT(*) as count FROM course_readings');
    const neonProjects = await neonPool.query('SELECT COUNT(*) as count FROM textbook_projects').catch(() => ({ rows: [{ count: 0 }] }));
    const neonChapters = await neonPool.query('SELECT COUNT(*) as count FROM textbook_chapters').catch(() => ({ rows: [{ count: 0 }] }));
    const neonImages = await neonPool.query('SELECT COUNT(*) as count FROM images').catch(() => ({ rows: [{ count: 0 }] }));

    console.log("📊 Final Summary:");
    console.log(`   Course Modules: ${neonModules.rows[0].count}`);
    console.log(`   Course Readings: ${neonReadings.rows[0].count}`);
    console.log(`   Textbook Projects: ${neonProjects.rows[0].count}`);
    console.log(`   Textbook Chapters: ${neonChapters.rows[0].count}`);
    console.log(`   Images: ${neonImages.rows[0].count}`);
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

importEverything();




