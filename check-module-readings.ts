import { Pool } from 'pg';

const LOCAL_DB_URL = process.env.LOCAL_DATABASE_URL || "postgresql://rocky@localhost:5432/boston_ministry";
const localPool = new Pool({ connectionString: LOCAL_DB_URL });

async function checkModuleReadings() {
  const modules = await localPool.query(`
    SELECT course_id, module_type, COUNT(*) as count 
    FROM course_modules 
    GROUP BY course_id, module_type 
    ORDER BY course_id, module_type
  `);
  
  console.log('Course modules by type:');
  modules.rows.forEach(m => {
    console.log(`  Course ${m.course_id}, Type "${m.module_type || 'NULL'}": ${m.count} modules`);
  });
  
  const readingModules = await localPool.query(`
    SELECT course_id, COUNT(*) as count 
    FROM course_modules 
    WHERE module_type = 'reading'
    GROUP BY course_id 
    ORDER BY course_id
  `);
  
  console.log('\nModules with module_type = "reading":');
  if (readingModules.rows.length === 0) {
    console.log('  None found');
  } else {
    readingModules.rows.forEach(r => {
      console.log(`  Course ${r.course_id}: ${r.count} reading modules`);
    });
  }
  
  await localPool.end();
  process.exit(0);
}

checkModuleReadings();




