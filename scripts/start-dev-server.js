#!/usr/bin/env node
/**
 * Simple dev server starter - works around path issues
 * Usage: node scripts/start-dev-server.js
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

console.log('🚀 Starting development server...');
console.log(`📁 Project root: ${projectRoot}`);
console.log('');

// Check if node_modules exists
if (!existsSync(resolve(projectRoot, 'node_modules'))) {
  console.log('⚠️  node_modules not found. Installing dependencies...');
  console.log('   This may take a few minutes...');
  console.log('');
  
  const install = spawn('npm', ['install'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true
  });
  
  install.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ npm install failed');
      process.exit(1);
    }
    startServer();
  });
} else {
  startServer();
}

function startServer() {
  console.log('✅ Dependencies ready');
  console.log('🌐 Starting server on http://localhost:56000');
  console.log('   Press Ctrl+C to stop');
  console.log('');
  
  const server = spawn('npm', ['run', 'test:local'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      PORT: '56000',
      NODE_ENV: 'development'
    }
  });
  
  server.on('error', (err) => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  });
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping server...');
    server.kill();
    process.exit(0);
  });
}
