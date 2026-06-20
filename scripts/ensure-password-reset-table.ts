#!/usr/bin/env node
import { readFileSync } from "fs";
import { join } from "path";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  const migrationPath = join(process.cwd(), "migrations/0008_add_password_reset_tokens.sql");
  const migrationSql = readFileSync(migrationPath, "utf8");
  await db.execute(sql.raw(migrationSql));
  console.log("✅ password_reset_tokens table ready");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Failed:", err);
    process.exit(1);
  });
