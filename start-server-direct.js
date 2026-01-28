#!/usr/bin/env node
/**
 * Direct server starter - bypasses npm path issues
 * Starts server directly using node and tsx
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname);

// Change to project directory
process.chdir(projectRoot);

console.log('🚀 Starting server directly...');
console.log(`📁 Working directory: ${projectRoot}`);
console.log('');

// Start server using node with tsx directly
const server = spawn('node', [
  '--env-file=.env',
  'node_modules/.bin/tsx',
  'server/index.ts'
], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '56000'
  }
});

server.on('error', (err) => {
  console.error('❌ Failed to start:', err.message);
  if (err.message.includes('ENOENT')) {
    console.error('💡 Try running: npm install');
  }
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping server...');
  server.kill();
  process.exit(0);
});
