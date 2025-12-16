import { Pool } from 'pg';

const LOCAL_DB_URL = process.env.LOCAL_DATABASE_URL || "postgresql://rocky@localhost:5432/boston_ministry";
const localPool = new Pool({ connectionString: LOCAL_DB_URL });

async function checkReadings() {
  const readings = await localPool.query('SELECT * FROM course_readings ORDER BY course_id, order_index');
  console.log(`Found ${readings.rows.length} course_readings:\n`);
  readings.rows.forEach((r, i) => {
    console.log(`${i + 1}. Course ${r.course_id}: ${r.title}`);
    console.log(`   Type: ${r.reading_type}, Chapter: ${r.chapter_number || 'N/A'}`);
    console.log(`   Content length: ${r.content ? r.content.length : 0} chars\n`);
  });
  await localPool.end();
  process.exit(0);
}

checkReadings();


