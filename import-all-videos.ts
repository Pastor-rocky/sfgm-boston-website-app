import { Pool } from 'pg';

const LOCAL_DB_URL = process.env.LOCAL_DATABASE_URL || "postgresql://rocky@localhost:5432/boston_ministry";
const NEON_DB_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

const localPool = new Pool({ connectionString: LOCAL_DB_URL });
const neonPool = new Pool({ connectionString: NEON_DB_URL });

// Map old course IDs to new database IDs
// Database has: 20=G.R.O.W, 21=Acts, 22=Fire Starter, 23=Jonah, 24=Studying, 25=Deacon, 26=Level Up, 27=Youth
// But videos reference old IDs: 1=Acts, 2=Fire Starter, 3=Jonah, 4=G.R.O.W, 5=Studying, 6=Deacon, 7=Level Up, 8=Youth
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

async function importVideos() {
  try {
    console.log("🔄 Importing all videos from local to Neon...\n");

    const localVideos = await localPool.query(`
      SELECT id, course_id, module_id, title, description, video_url, duration, order_index, 
             is_required, is_published, published_at, created_at, updated_at
      FROM course_videos
      ORDER BY id
    `);

    console.log(`Found ${localVideos.rows.length} videos in local database\n`);

    let imported = 0;
    let skipped = 0;
    let failed = 0;

    for (const video of localVideos.rows) {
      try {
        // Map old course_id to new database course_id
        const newCourseId = COURSE_ID_MAP[video.course_id];
        if (!newCourseId) {
          console.log(`  ⚠️  Skipping video ${video.id} - unknown course_id ${video.course_id}`);
          skipped++;
          continue;
        }

        const result = await neonPool.query(`
          INSERT INTO course_videos (id, course_id, module_id, title, description, video_url, duration, order_index, 
                                     is_required, is_published, published_at, created_at, updated_at)
          VALUES ($1, $2, NULL, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO NOTHING
          RETURNING id
        `, [
          video.id,
          newCourseId, // Use mapped course ID
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

        if (result.rows.length > 0) {
          imported++;
          if (imported % 10 === 0) {
            console.log(`  ✅ Imported ${imported} videos...`);
          }
        } else {
          skipped++;
        }
      } catch (error: any) {
        failed++;
        if (failed <= 5) {
          console.error(`  ❌ Error importing video ${video.id}:`, error.message);
        }
      }
    }

    const neonCount = await neonPool.query('SELECT COUNT(*) as count FROM course_videos');
    console.log(`\n✅ Import complete!`);
    console.log(`   Imported: ${imported}, Skipped: ${skipped}, Failed: ${failed}`);
    console.log(`   Total videos in Neon: ${neonCount.rows[0].count}`);

  } catch (error: any) {
    console.error("❌ Error:", error.message);
  } finally {
    await localPool.end();
    await neonPool.end();
    process.exit(0);
  }
}

importVideos();







