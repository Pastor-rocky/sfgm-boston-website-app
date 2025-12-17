import { Pool } from 'pg';

const LOCAL_DB_URL = process.env.LOCAL_DATABASE_URL || "postgresql://rocky@localhost:5432/boston_ministry";
const NEON_DB_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

const localPool = new Pool({ connectionString: LOCAL_DB_URL });
const neonPool = new Pool({ connectionString: NEON_DB_URL });

async function checkTextbookData() {
  try {
    console.log("🔍 Checking textbook data...\n");

    // Check textbook_projects
    const localProjects = await localPool.query('SELECT * FROM textbook_projects ORDER BY id').catch(() => ({ rows: [] }));
    const neonProjects = await neonPool.query('SELECT * FROM textbook_projects ORDER BY id').catch(() => ({ rows: [] }));
    
    console.log(`textbook_projects: Local=${localProjects.rows.length}, Neon=${neonProjects.rows.length}`);
    if (localProjects.rows.length > 0) {
      console.log("\nLocal textbook_projects:");
      localProjects.rows.forEach(p => {
        console.log(`  ID ${p.id}: ${p.title} (Course ${p.course_id})`);
      });
    }

    // Check textbook_chapters
    const localChapters = await localPool.query('SELECT COUNT(*) as count, project_id FROM textbook_chapters GROUP BY project_id ORDER BY project_id').catch(() => ({ rows: [] }));
    const neonChapters = await neonPool.query('SELECT COUNT(*) as count, project_id FROM textbook_chapters GROUP BY project_id ORDER BY project_id').catch(() => ({ rows: [] }));
    
    console.log(`\ntextbook_chapters: Local=${localChapters.rows.reduce((sum, r) => sum + parseInt(r.count), 0)}, Neon=${neonChapters.rows.reduce((sum, r) => sum + parseInt(r.count), 0)}`);
    if (localChapters.rows.length > 0) {
      console.log("\nLocal textbook_chapters by project:");
      localChapters.rows.forEach(c => {
        console.log(`  Project ${c.project_id}: ${c.count} chapters`);
      });
    }

    // Check book_chapters (another table?)
    const localBookChapters = await localPool.query('SELECT COUNT(*) as count FROM book_chapters').catch(() => ({ rows: [{ count: 0 }] }));
    const neonBookChapters = await neonPool.query('SELECT COUNT(*) as count FROM book_chapters').catch(() => ({ rows: [{ count: 0 }] }));
    console.log(`\nbook_chapters: Local=${localBookChapters.rows[0].count}, Neon=${neonBookChapters.rows[0].count}`);

    // Get full count of textbook_chapters
    const localChaptersTotal = await localPool.query('SELECT COUNT(*) as count FROM textbook_chapters').catch(() => ({ rows: [{ count: 0 }] }));
    const neonChaptersTotal = await neonPool.query('SELECT COUNT(*) as count FROM textbook_chapters').catch(() => ({ rows: [{ count: 0 }] }));
    console.log(`\nTotal textbook_chapters: Local=${localChaptersTotal.rows[0].count}, Neon=${neonChaptersTotal.rows[0].count}`);

    // Show sample chapters
    if (parseInt(localChaptersTotal.rows[0].count) > 0) {
      const sample = await localPool.query('SELECT id, project_id, chapter_number, title FROM textbook_chapters ORDER BY project_id, chapter_number LIMIT 10');
      console.log("\nSample textbook_chapters:");
      sample.rows.forEach(c => {
        console.log(`  Project ${c.project_id}, Chapter ${c.chapter_number}: ${c.title}`);
      });
    }

  } catch (error: any) {
    console.error("Error:", error.message);
    console.error(error.stack);
  } finally {
    await localPool.end();
    await neonPool.end();
    process.exit(0);
  }
}

checkTextbookData();




