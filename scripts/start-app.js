#!/usr/bin/env node
/**
 * Reliable App Starter - Handles all the complexity
 * Usage: node scripts/start-app.js
 * Or double-click the desktop shortcut
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Verify we're in the right place
if (!existsSync(resolve(projectRoot, 'package.json'))) {
  console.error('❌ Error: Could not find package.json');
  console.error(`   Looked in: ${projectRoot}`);
  console.error('');
  console.error('Please make sure you run this from the project directory.');
  process.exit(1);
}

console.log('🚀 SFGM Boston Website - Starting...');
console.log(`📁 Project: ${projectRoot}`);
console.log('');

// Check if node_modules exists
if (!existsSync(resolve(projectRoot, 'node_modules'))) {
  console.log('📦 Installing dependencies (first time setup)...');
  console.log('   This may take 2-5 minutes. Please wait...');
  console.log('');
  
  const install = spawn('npm', ['install'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true
  });
  
  install.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Failed to install dependencies');
      console.error('   Please run: npm install');
      process.exit(1);
    }
    console.log('');
    console.log('✅ Dependencies installed successfully!');
    console.log('');
    startServer();
  });
} else {
  startServer();
}

function startServer() {
  console.log('🌐 Starting server on http://localhost:56000');
  console.log('   The page will open automatically in your browser');
  console.log('   Press Ctrl+C to stop the server');
  console.log('');
  
  let server;
  let restartCount = 0;
  const MAX_RESTARTS = 5;
  
  function spawnServer() {
    server = spawn('npm', ['run', 'dev'], {
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
      console.error('❌ Failed to start server:', err.message);
      console.error('');
      console.error('Troubleshooting:');
      console.error('1. Make sure Node.js is installed');
      console.error('2. Check that port 56000 is not in use');
      console.error('3. Verify your .env file exists');
      process.exit(1);
    });
    
    server.on('exit', (code, signal) => {
      if (code !== 0 && code !== null) {
        restartCount++;
        if (restartCount <= MAX_RESTARTS) {
          console.log('');
          console.log(`⚠️  Server exited unexpectedly (code: ${code}). Restarting... (${restartCount}/${MAX_RESTARTS})`);
          console.log('');
          setTimeout(() => {
            spawnServer();
          }, 2000);
        } else {
          console.error('');
          console.error('❌ Server crashed too many times. Please check for errors.');
          process.exit(1);
        }
      }
    });
    
    // Wait a bit, then open browser (only on first start)
    if (restartCount === 0) {
      setTimeout(() => {
        const openBrowser = spawn('open', ['http://localhost:56000'], {
          shell: true,
          stdio: 'ignore'
        });
        openBrowser.on('error', () => {
          // Browser open failed, that's okay
        });
      }, 5000);
    }
  }
  
  spawnServer();
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping server...');
    if (server) {
      server.kill();
    }
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    if (server) {
      server.kill();
    }
    process.exit(0);
  });
}
