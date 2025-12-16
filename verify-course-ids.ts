import { Pool } from 'pg';

const NEON_DB_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
const neonPool = new Pool({ connectionString: NEON_DB_URL });

async function verify() {
  const courses = await neonPool.query('SELECT id, name FROM courses ORDER BY id');
  console.log('Courses:');
  courses.rows.forEach(c => console.log(`  ID ${c.id}: ${c.name}`));
  
  const modules = await neonPool.query('SELECT COUNT(*) as count, course_id FROM course_modules GROUP BY course_id ORDER BY course_id');
  console.log('\nCourse Modules:');
  modules.rows.forEach(m => console.log(`  Course ${m.course_id}: ${m.count} modules`));
  
  const readings = await neonPool.query('SELECT COUNT(*) as count, course_id FROM course_readings GROUP BY course_id ORDER BY course_id');
  console.log('\nCourse Readings:');
  readings.rows.forEach(r => console.log(`  Course ${r.course_id}: ${r.count} readings`));
  
  const videos = await neonPool.query('SELECT COUNT(*) as count, course_id FROM course_videos GROUP BY course_id ORDER BY course_id');
  console.log('\nCourse Videos:');
  videos.rows.forEach(v => console.log(`  Course ${v.course_id}: ${v.count} videos`));
  
  await neonPool.end();
  process.exit(0);
}

verify();


