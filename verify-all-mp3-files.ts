#!/usr/bin/env node

/**
 * Verify All MP3 Files
 * 
 * This script checks if all MP3 files referenced in the codebase actually exist
 * and are in the correct locations for deployment.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// All MP3 files referenced in the codebase
const expectedFiles = [
  // Acts in Action
  { path: '/uploads/textbook-audio/acts-in-action-intro.mp3', location: 'public/uploads/textbook-audio/acts-in-action-intro.mp3' },
  { path: '/uploads/textbook-audio/acts-in-action-cp1.mp3', location: 'public/uploads/textbook-audio/acts-in-action-cp1.mp3' },
  { path: '/uploads/textbook-audio/acts-in-action-cp2.mp3', location: 'public/uploads/textbook-audio/acts-in-action-cp2.mp3' },
  { path: '/uploads/textbook-audio/acts-in-action-cp3.mp3', location: 'public/uploads/textbook-audio/acts-in-action-cp3.mp3' },
  { path: '/uploads/textbook-audio/acts-in-action-cp4.mp3', location: 'public/uploads/textbook-audio/acts-in-action-cp4.mp3' },
  { path: '/uploads/textbook-audio/acts-in-action-cp5.mp3', location: 'public/uploads/textbook-audio/acts-in-action-cp5.mp3' },
  { path: '/uploads/textbook-audio/acts-in-action-cp6.mp3', location: 'public/uploads/textbook-audio/acts-in-action-cp6.mp3' },
  { path: '/uploads/textbook-audio/acts-in-action-cp7.mp3', location: 'public/uploads/textbook-audio/acts-in-action-cp7.mp3' },
  { path: '/uploads/textbook-audio/acts-in-action-cp8.mp3', location: 'public/uploads/textbook-audio/acts-in-action-cp8.mp3' },
  { path: '/uploads/textbook-audio/acts-in-action-cp9.mp3', location: 'public/uploads/textbook-audio/acts-in-action-cp9.mp3' },
  { path: '/uploads/textbook-audio/acts-in-action-cp10.mp3', location: 'public/uploads/textbook-audio/acts-in-action-cp10.mp3' },
  
  // Becoming a Fire Starter
  { path: '/uploads/firestarter-audio/fire-starter-cp1.mp3', location: 'public/uploads/firestarter-audio/fire-starter-cp1.mp3' },
  { path: '/uploads/firestarter-audio/fire-starter-cp2.mp3', location: 'public/uploads/firestarter-audio/fire-starter-cp2.mp3' },
  { path: '/uploads/firestarter-audio/fire-starter-cp3.mp3', location: 'public/uploads/firestarter-audio/fire-starter-cp3.mp3' },
  { path: '/uploads/firestarter-audio/fire-starter-cp4.mp3', location: 'public/uploads/firestarter-audio/fire-starter-cp4.mp3' },
  { path: '/uploads/firestarter-audio/fire-starter-cp5.mp3', location: 'public/uploads/firestarter-audio/fire-starter-cp5.mp3' },
  { path: '/uploads/firestarter-audio/fire-starter-cp6.mp3', location: 'public/uploads/firestarter-audio/fire-starter-cp6.mp3' },
  { path: '/uploads/firestarter-audio/fire-starter-cp7.mp3', location: 'public/uploads/firestarter-audio/fire-starter-cp7.mp3' },
  { path: '/uploads/firestarter-audio/fire-starter-cp8.mp3', location: 'public/uploads/firestarter-audio/fire-starter-cp8.mp3' },
  { path: '/uploads/firestarter-audio/fire-starter-cp9.mp3', location: 'public/uploads/firestarter-audio/fire-starter-cp9.mp3' },
  { path: '/uploads/firestarter-audio/fire-starter-cp10.mp3', location: 'public/uploads/firestarter-audio/fire-starter-cp10.mp3' },
  
  // Don't Be a Jonah
  { path: '/uploads/textbook-audio/dont-be-a-jonah-ch1.mp3', location: 'public/uploads/textbook-audio/dont-be-a-jonah-ch1.mp3' },
  { path: '/uploads/textbook-audio/dont-be-a-jonah-ch2.mp3', location: 'public/uploads/textbook-audio/dont-be-a-jonah-ch2.mp3' },
  { path: '/uploads/textbook-audio/dont-be-a-jonah-ch3.mp3', location: 'public/uploads/textbook-audio/dont-be-a-jonah-ch3.mp3' },
  { path: '/uploads/textbook-audio/dont-be-a-jonah-ch4.mp3', location: 'public/uploads/textbook-audio/dont-be-a-jonah-ch4.mp3' },
  { path: '/uploads/textbook-audio/dont-be-a-jonah-ch5.mp3', location: 'public/uploads/textbook-audio/dont-be-a-jonah-ch5.mp3' },
  { path: '/uploads/textbook-audio/dont-be-a-jonah-ch6.mp3', location: 'public/uploads/textbook-audio/dont-be-a-jonah-ch6.mp3' },
  { path: '/uploads/textbook-audio/dont-be-a-jonah-ch7.mp3', location: 'public/uploads/textbook-audio/dont-be-a-jonah-ch7.mp3' },
  { path: '/uploads/textbook-audio/dont-be-a-jonah-ch8.mp3', location: 'public/uploads/textbook-audio/dont-be-a-jonah-ch8.mp3' },
  { path: '/uploads/textbook-audio/dont-be-a-jonah-ch9.mp3', location: 'public/uploads/textbook-audio/dont-be-a-jonah-ch9.mp3' },
  { path: '/uploads/textbook-audio/dont-be-a-jonah-ch10.mp3', location: 'public/uploads/textbook-audio/dont-be-a-jonah-ch10.mp3' },
  { path: '/uploads/textbook-audio/dont-be-a-jonah-ch11.mp3', location: 'public/uploads/textbook-audio/dont-be-a-jonah-ch11.mp3' },
  
  // Studying for Service
  { path: '/studying-for-service-ch1.mp3', location: 'public/studying-for-service-ch1.mp3' },
  { path: '/studying-for-service-ch2.mp3', location: 'public/studying-for-service-ch2.mp3' },
  { path: '/studying-for-service-ch3.mp3', location: 'public/studying-for-service-ch3.mp3' },
  { path: '/studying-for-service-ch4.mp3', location: 'public/studying-for-service-ch4.mp3' },
  { path: '/studying-for-service-ch5.mp3', location: 'public/studying-for-service-ch5.mp3' },
  { path: '/studying-for-service-ch6.mp3', location: 'public/studying-for-service-ch6.mp3' },
  { path: '/studying-for-service-ch7.mp3', location: 'public/studying-for-service-ch7.mp3' },
  { path: '/studying-for-service-ch8.mp3', location: 'public/studying-for-service-ch8.mp3' },
  { path: '/studying-for-service-ch9.mp3', location: 'public/studying-for-service-ch9.mp3' },
  { path: '/studying-for-service-ch10.mp3', location: 'public/studying-for-service-ch10.mp3' },
  { path: '/studying-for-service-ch11.mp3', location: 'public/studying-for-service-ch11.mp3' },
  { path: '/studying-for-service-ch12.mp3', location: 'public/studying-for-service-ch12.mp3' },
  
  // G.R.O.W.
  { path: '/grow-ch1.mp3', location: 'public/grow-ch1.mp3' },
  { path: '/grow-ch2.mp3', location: 'public/grow-ch2.mp3' },
  { path: '/grow-ch3.mp3', location: 'public/grow-ch3.mp3' },
  { path: '/grow-ch4.mp3', location: 'public/grow-ch4.mp3' },
  
  // Deacon Course
  { path: '/deacon-course-ch1.mp3', location: 'public/deacon-course-ch1.mp3' },
  { path: '/deacon-course-ch2.mp3', location: 'public/deacon-course-ch2.mp3' },
  { path: '/deacon-course-ch3.mp3', location: 'public/deacon-course-ch3.mp3' },
  { path: '/deacon-course-ch4.mp3', location: 'public/deacon-course-ch4.mp3' },
  { path: '/deacon-course-ch5.mp3', location: 'public/deacon-course-ch5.mp3' },
  
  // Youth Ministry
  { path: '/uploads/textbook-audio/youth-ministry-ch1.mp3', location: 'public/uploads/textbook-audio/youth-ministry-ch1.mp3' },
  { path: '/uploads/textbook-audio/youth-ministry-ch2.mp3', location: 'public/uploads/textbook-audio/youth-ministry-ch2.mp3' },
  { path: '/uploads/textbook-audio/youth-ministry-ch3.mp3', location: 'public/uploads/textbook-audio/youth-ministry-ch3.mp3' },
  { path: '/uploads/textbook-audio/youth-ministry-ch4.mp3', location: 'public/uploads/textbook-audio/youth-ministry-ch4.mp3' },
  { path: '/uploads/textbook-audio/youth-ministry-ch5.mp3', location: 'public/uploads/textbook-audio/youth-ministry-ch5.mp3' },
];

async function main() {
  console.log('🔍 Verifying all MP3 files referenced in codebase...\n');
  
  const results: Array<{ path: string; location: string; exists: boolean; size?: number; inGit?: boolean }> = [];
  
  for (const file of expectedFiles) {
    const fullPath = path.join(__dirname, file.location);
    const exists = fs.existsSync(fullPath);
    let size: number | undefined;
    let inGit = false;
    
    if (exists) {
      const stats = fs.statSync(fullPath);
      size = stats.size;
      
      // Check if file is tracked by Git
      try {
        const { execSync } = await import('child_process');
        execSync(`git ls-files --error-unmatch "${file.location}"`, { stdio: 'ignore' });
        inGit = true;
      } catch {
        inGit = false;
      }
    }
    
    results.push({
      path: file.path,
      location: file.location,
      exists,
      size,
      inGit
    });
  }
  
  const existing = results.filter(r => r.exists);
  const missing = results.filter(r => !r.exists);
  const notInGit = results.filter(r => r.exists && !r.inGit);
  
  console.log('✅ FILES THAT EXIST:\n');
  existing.forEach(r => {
    const sizeMB = r.size ? (r.size / (1024 * 1024)).toFixed(2) : '?';
    const gitStatus = r.inGit ? '✅ In Git' : '⚠️  NOT in Git';
    console.log(`  ✓ ${r.path}`);
    console.log(`    Location: ${r.location}`);
    console.log(`    Size: ${sizeMB} MB`);
    console.log(`    ${gitStatus}\n`);
  });
  
  if (missing.length > 0) {
    console.log('\n❌ FILES THAT ARE MISSING:\n');
    missing.forEach(r => {
      console.log(`  ✗ ${r.path}`);
      console.log(`    Expected: ${r.location}\n`);
    });
  }
  
  if (notInGit.length > 0) {
    console.log('\n⚠️  FILES NOT TRACKED BY GIT (will not be deployed):\n');
    notInGit.forEach(r => {
      console.log(`  ⚠️  ${r.path}`);
      console.log(`    Location: ${r.location}\n`);
    });
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`  Total files needed: ${expectedFiles.length}`);
  console.log(`  Files found: ${existing.length} ✅`);
  console.log(`  Files missing: ${missing.length} ${missing.length > 0 ? '❌' : ''}`);
  console.log(`  Files not in Git: ${notInGit.length} ${notInGit.length > 0 ? '⚠️' : ''}`);
  
  if (missing.length === 0 && notInGit.length === 0) {
    console.log('\n🎉 All files are present and ready for deployment!');
  } else {
    console.log('\n⚠️  Action needed: Some files are missing or not tracked by Git.');
  }
  
  process.exit(0);
}

if (import.meta.url === new URL(import.meta.url).href) {
  main().catch(console.error);
}



