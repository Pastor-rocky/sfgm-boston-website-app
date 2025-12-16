import { Pool } from 'pg';

const LOCAL_DB_URL = process.env.LOCAL_DATABASE_URL || "postgresql://rocky@localhost:5432/boston_ministry";
const NEON_DB_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

const localPool = new Pool({ connectionString: LOCAL_DB_URL });
const neonPool = new Pool({ connectionString: NEON_DB_URL });

async function checkReadings() {
  try {
    console.log("🔍 Checking all reading-related data...\n");

    // Check course_readings
    const localReadings = await localPool.query('SELECT COUNT(*) as count FROM course_readings');
    const neonReadings = await neonPool.query('SELECT COUNT(*) as count FROM course_readings');
    console.log(`course_readings: Local=${localReadings.rows[0].count}, Neon=${neonReadings.rows[0].count}`);

    // Check course_modules (might contain reading material)
    const localModules = await localPool.query(`
      SELECT COUNT(*) as count, 
             COUNT(CASE WHEN reading_material IS NOT NULL AND reading_material != '' THEN 1 END) as with_reading
      FROM course_modules
    `);
    const neonModules = await neonPool.query(`
      SELECT COUNT(*) as count,
             COUNT(CASE WHEN reading_material IS NOT NULL AND reading_material != '' THEN 1 END) as with_reading
      FROM course_modules
    `);
    console.log(`course_modules: Local=${localModules.rows[0].count} (${localModules.rows[0].with_reading} with reading_material), Neon=${neonModules.rows[0].count} (${neonModules.rows[0].with_reading} with reading_material)`);

    // Check textbook_chapters
    const localChapters = await localPool.query('SELECT COUNT(*) as count FROM textbook_chapters').catch(() => ({ rows: [{ count: 0 }] }));
    const neonChapters = await neonPool.query('SELECT COUNT(*) as count FROM textbook_chapters').catch(() => ({ rows: [{ count: 0 }] }));
    console.log(`textbook_chapters: Local=${localChapters.rows[0].count}, Neon=${neonChapters.rows[0].count}`);

    // Check textbook_projects
    const localProjects = await localPool.query('SELECT COUNT(*) as count FROM textbook_projects').catch(() => ({ rows: [{ count: 0 }] }));
    const neonProjects = await neonPool.query('SELECT COUNT(*) as count FROM textbook_projects').catch(() => ({ rows: [{ count: 0 }] }));
    console.log(`textbook_projects: Local=${localProjects.rows[0].count}, Neon=${neonProjects.rows[0].count}`);

    // Show sample course_readings by course
    console.log("\n📚 Course readings by course (local):");
    const readingsByCourse = await localPool.query(`
      SELECT course_id, COUNT(*) as count 
      FROM course_readings 
      GROUP BY course_id 
      ORDER BY course_id
    `);
    readingsByCourse.rows.forEach(r => {
      console.log(`  Course ${r.course_id}: ${r.count} readings`);
    });

    // Show sample course_modules with reading_material by course
    console.log("\n📝 Course modules with reading_material by course (local):");
    const modulesByCourse = await localPool.query(`
      SELECT course_id, COUNT(*) as total,
             COUNT(CASE WHEN reading_material IS NOT NULL AND reading_material != '' THEN 1 END) as with_reading
      FROM course_modules 
      GROUP BY course_id 
      ORDER BY course_id
    `);
    modulesByCourse.rows.forEach(r => {
      console.log(`  Course ${r.course_id}: ${r.total} modules (${r.with_reading} with reading material)`);
    });

    // Check if there are any other reading-related tables
    console.log("\n🔍 Checking for other reading-related tables...");
    const allTables = await localPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND (table_name LIKE '%read%' OR table_name LIKE '%chapter%' OR table_name LIKE '%textbook%' OR table_name LIKE '%content%')
      ORDER BY table_name
    `);
    console.log("Reading-related tables:");
    allTables.rows.forEach(t => console.log(`  - ${t.table_name}`));

  } catch (error: any) {
    console.error("Error:", error.message);
  } finally {
    await localPool.end();
    await neonPool.end();
    process.exit(0);
  }
}

checkReadings();


