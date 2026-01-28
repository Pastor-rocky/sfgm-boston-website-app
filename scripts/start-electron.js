#!/usr/bin/env node
/**
 * Electron App Launcher
 * Starts the Electron desktop app
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

console.log('🚀 Starting SFGM Boston Desktop App...');
console.log(`📁 Project: ${projectRoot}`);
console.log('');

// Check if electron is installed
const electronPath = resolve(projectRoot, 'node_modules', '.bin', 'electron');
if (!existsSync(electronPath)) {
  console.error('❌ Electron is not installed');
  console.error('   Please run: npm install');
  process.exit(1);
}

// Start Electron - pass path as separate argument to avoid shell interpretation issues
console.log('Starting Electron...');
const electron = spawn(electronPath, [projectRoot], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: false, // Don't use shell to avoid path splitting issues
  env: {
    ...process.env,
    NODE_ENV: 'development',
  },
});

electron.on('error', (err) => {
  console.error('❌ Failed to start Electron:', err.message);
  console.error('   Path:', electronPath);
  console.error('   Project:', projectRoot);
  process.exit(1);
});

electron.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`⚠️  Electron exited with code ${code}`);
  }
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Closing Electron app...');
  electron.kill();
  process.exit(0);
});
