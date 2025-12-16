import { Pool } from 'pg';

const NEON_DB_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
const neonPool = new Pool({ connectionString: NEON_DB_URL });

// Map current database IDs to correct IDs
// Current: 20=G.R.O.W, 21=Acts, 22=Fire Starter, 23=Jonah, 24=Studying, 25=Deacon, 26=Level Up, 27=Youth
// Should be: 1=Acts, 2=Fire Starter, 3=Jonah, 4=G.R.O.W, 5=Studying, 6=Deacon, 7=Level Up, 8=Youth
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

async function fixCourseIds() {
  try {
    console.log("🔧 Fixing course IDs in database...\n");
    console.log("⚠️  This will update all foreign key references!\n");

    // Step 1: Update foreign keys to temporary values (1000+)
    console.log("📝 Step 1: Moving foreign keys to temporary values...");
    for (const [oldId] of Object.entries(COURSE_ID_MAP)) {
      const tempId = parseInt(oldId) + 1000;
      await neonPool.query(`UPDATE course_modules SET course_id = $1 WHERE course_id = $2`, [tempId, parseInt(oldId)]);
      await neonPool.query(`UPDATE course_readings SET course_id = $1 WHERE course_id = $2`, [tempId, parseInt(oldId)]);
      await neonPool.query(`UPDATE course_videos SET course_id = $1 WHERE course_id = $2`, [tempId, parseInt(oldId)]);
      await neonPool.query(`UPDATE enrollments SET course_id = $1 WHERE course_id = $2`, [tempId, parseInt(oldId)]);
    }
    console.log("✅ Moved foreign keys to temporary values\n");

    // Step 2: Update courses table
    console.log("📝 Step 2: Updating courses table...");
    await neonPool.query(`UPDATE courses SET id = 1 WHERE id = 21`); // Acts
    await neonPool.query(`UPDATE courses SET id = 2 WHERE id = 22`); // Fire Starter
    await neonPool.query(`UPDATE courses SET id = 3 WHERE id = 23`); // Jonah
    await neonPool.query(`UPDATE courses SET id = 4 WHERE id = 20`); // G.R.O.W
    await neonPool.query(`UPDATE courses SET id = 5 WHERE id = 24`); // Studying
    await neonPool.query(`UPDATE courses SET id = 6 WHERE id = 25`); // Deacon
    await neonPool.query(`UPDATE courses SET id = 7 WHERE id = 26`); // Level Up
    await neonPool.query(`UPDATE courses SET id = 8 WHERE id = 27`); // Youth
    console.log("✅ Updated courses table\n");

    // Step 3: Update foreign keys to final values
    console.log("📝 Step 3: Updating foreign keys to final values...");
    for (const [oldId, newId] of Object.entries(COURSE_ID_MAP)) {
      const tempId = parseInt(oldId) + 1000;
      await neonPool.query(`UPDATE course_modules SET course_id = $1 WHERE course_id = $2`, [newId, tempId]);
      await neonPool.query(`UPDATE course_readings SET course_id = $1 WHERE course_id = $2`, [newId, tempId]);
      await neonPool.query(`UPDATE course_videos SET course_id = $1 WHERE course_id = $2`, [newId, tempId]);
      await neonPool.query(`UPDATE enrollments SET course_id = $1 WHERE course_id = $2`, [newId, tempId]);
    }
    console.log("✅ Updated foreign keys to final values\n");

    // Verify
    const courses = await neonPool.query('SELECT id, name FROM courses ORDER BY id');
    console.log("📊 Final course IDs:");
    courses.rows.forEach(c => {
      console.log(`   ID ${c.id}: ${c.name}`);
    });

    console.log("\n✅ Course ID fix complete!");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  } finally {
    await neonPool.end();
    process.exit(0);
  }
}

fixCourseIds();

