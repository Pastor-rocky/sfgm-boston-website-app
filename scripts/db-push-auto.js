// Runs DB schema sync during deployment/build.
// Safe default: only runs in production.
import { spawnSync } from 'node:child_process';

if (process.env.NODE_ENV !== 'production') {
  console.log('[db-push-auto] Skipping (NODE_ENV not production)');
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  console.error('[db-push-auto] DATABASE_URL missing; cannot run migrations');
  process.exit(1);
}

console.log('[db-push-auto] Running drizzle-kit push against production database…');

const result = spawnSync(
  'node_modules/.bin/drizzle-kit',
  ['push', '--config', 'drizzle.config.ts'],
  {
    stdio: 'inherit',
    env: process.env,
  },
);

process.exit(result.status ?? 1);
