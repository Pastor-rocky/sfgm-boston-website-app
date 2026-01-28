import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure pool with better connection settings and error handling
// Pool size is configurable via DB_POOL_SIZE env variable (default: 30 for upgraded Render + Neon)
// Recommended values:
// - Development: 5-10
// - Launch (200-500 students): 20-25
// - Growth (500-1,000 students): 25-30
// - Scale (1,000+ students): 30-40
// Default 30: upgraded capacity (Render Standard/Pro + Neon Launch/Scale)
const poolSize = parseInt(process.env.DB_POOL_SIZE || '30', 10);

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: poolSize, // Configurable pool size (default: 30 for upgraded capacity)
  idleTimeoutMillis: 30000, // 30 seconds
  connectionTimeoutMillis: 10000, // 10 seconds
});

// Log pool configuration on startup
console.log(`📊 Database connection pool configured: ${poolSize} max connections`);

// Add connection error handling
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

// Test connection with retry logic (called during server startup)
export async function testDatabaseConnection(maxRetries = 5): Promise<void> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await pool.query('SELECT 1');
      console.log('✅ Database connection established');
      return;
    } catch (error) {
      if (attempt === maxRetries - 1) {
        console.error('❌ Failed to connect to database after all retries');
        throw error;
      }
      const delay = 2000 * (attempt + 1); // Exponential backoff: 2s, 4s, 6s, 8s
      console.warn(`⚠️  Database connection attempt ${attempt + 1}/${maxRetries} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export const db = drizzle({ client: pool, schema });