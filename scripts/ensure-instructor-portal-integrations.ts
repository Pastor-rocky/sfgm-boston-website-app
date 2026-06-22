import { readFileSync } from "fs";
import { join } from "path";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  const migrationPath = join(process.cwd(), "migrations/0009_instructor_portal_integrations.sql");
  const migrationSql = readFileSync(migrationPath, "utf8");
  await db.execute(sql.raw(migrationSql));
  console.log("✅ Instructor portal integrations migration applied");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
