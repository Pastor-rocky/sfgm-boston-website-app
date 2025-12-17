import { Pool } from 'pg';

const LOCAL_DB_URL = process.env.LOCAL_DATABASE_URL || "postgresql://rocky@localhost:5432/boston_ministry";
const NEON_DB_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

const localPool = new Pool({ connectionString: LOCAL_DB_URL });
const neonPool = new Pool({ connectionString: NEON_DB_URL });

async function checkAllTables() {
  try {
    console.log("🔍 Checking all tables in both databases...\n");

    // Get all tables
    const localTables = await localPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log("Tables in local database:");
    for (const table of localTables.rows) {
      const tableName = table.table_name;
      const localCount = await localPool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      const neonCount = await neonPool.query(`SELECT COUNT(*) as count FROM ${tableName}`).catch(() => ({ rows: [{ count: 0 }] }));
      
      const localNum = parseInt(localCount.rows[0].count);
      const neonNum = parseInt(neonCount.rows[0].count || 0);
      
      if (localNum > 0) {
        const status = localNum === neonNum ? "✅" : "⚠️";
        console.log(`  ${status} ${tableName}: Local=${localNum}, Neon=${neonNum}`);
      }
    }

  } catch (error: any) {
    console.error("Error:", error.message);
  } finally {
    await localPool.end();
    await neonPool.end();
    process.exit(0);
  }
}

checkAllTables();




