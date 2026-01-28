#!/usr/bin/env node

/**
 * Consolidate All MP3 Files
 * 
 * This script consolidates all MP3 files into one location: public/uploads/textbook-audio/
 * and updates the code to use consistent paths.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target location for all MP3s
const TARGET_DIR = path.join(__dirname, 'public', 'uploads', 'textbook-audio');
const CLIENT_TARGET_DIR = path.join(__dirname, 'client', 'public', 'uploads', 'textbook-audio');

// Files to consolidate and their target names
const filesToMove = [
  // Root public/ files
  { src: 'public/studying-for-service-ch1.mp3', dest: 'studying-for-service-ch1.mp3' },
  { src: 'public/studying-for-service-ch2.mp3', dest: 'studying-for-service-ch2.mp3' },
  { src: 'public/studying-for-service-ch3.mp3', dest: 'studying-for-service-ch3.mp3' },
  { src: 'public/studying-for-service-ch4.mp3', dest: 'studying-for-service-ch4.mp3' },
  { src: 'public/studying-for-service-ch5.mp3', dest: 'studying-for-service-ch5.mp3' },
  { src: 'public/studying-for-service-ch6.mp3', dest: 'studying-for-service-ch6.mp3' },
  { src: 'public/studying-for-service-ch7.mp3', dest: 'studying-for-service-ch7.mp3' },
  { src: 'public/studying-for-service-ch8.mp3', dest: 'studying-for-service-ch8.mp3' },
  { src: 'public/studying-for-service-ch9.mp3', dest: 'studying-for-service-ch9.mp3' },
  { src: 'public/studying-for-service-ch10.mp3', dest: 'studying-for-service-ch10.mp3' },
  { src: 'public/studying-for-service-ch11.mp3', dest: 'studying-for-service-ch11.mp3' },
  { src: 'public/studying-for-service-ch12.mp3', dest: 'studying-for-service-ch12.mp3' },
  { src: 'public/grow-ch1.mp3', dest: 'grow-ch1.mp3' },
  { src: 'public/grow-ch2.mp3', dest: 'grow-ch2.mp3' },
  { src: 'public/grow-ch3.mp3', dest: 'grow-ch3.mp3' },
  { src: 'public/grow-ch4.mp3', dest: 'grow-ch4.mp3' },
  { src: 'public/deacon-course-ch1.mp3', dest: 'deacon-course-ch1.mp3' },
  { src: 'public/deacon-course-ch2.mp3', dest: 'deacon-course-ch2.mp3' },
  { src: 'public/deacon-course-ch3.mp3', dest: 'deacon-course-ch3.mp3' },
  { src: 'public/deacon-course-ch4.mp3', dest: 'deacon-course-ch4.mp3' },
  { src: 'public/deacon-course-ch5.mp3', dest: 'deacon-course-ch5.mp3' },
  { src: 'public/deacon-course-ch6.mp3', dest: 'deacon-course-ch6.mp3' },
];

// Copy files from subdirectories
const directoriesToConsolidate = [
  { src: 'public/uploads/studying-audio', pattern: /studying-for-service-cp(\d+)\.mp3/, destPrefix: 'studying-for-service-ch' },
  { src: 'public/uploads/grow-audio', pattern: /grow-cp(\d+)\.mp3/, destPrefix: 'grow-ch' },
  { src: 'public/uploads/deaconship-audio', pattern: /deaconship-cp(\d+)\.mp3/, destPrefix: 'deacon-course-ch' },
  { src: 'public/uploads/firestarter-audio', pattern: /fire-starter-cp(\d+)\.mp3/, destPrefix: 'fire-starter-cp' },
  { src: 'public/uploads/youth-ministry-audio', pattern: /youth-ministry-section-(\d+)\.mp3/, destPrefix: 'youth-ministry-ch' },
];

async function consolidate() {
  console.log('🔄 Consolidating all MP3 files to public/uploads/textbook-audio/\n');
  
  // Ensure target directories exist
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }
  if (!fs.existsSync(CLIENT_TARGET_DIR)) {
    fs.mkdirSync(CLIENT_TARGET_DIR, { recursive: true });
  }
  
  let moved = 0;
  let skipped = 0;
  
  // Move files from root public/
  for (const file of filesToMove) {
    const srcPath = path.join(__dirname, file.src);
    const destPath = path.join(TARGET_DIR, file.dest);
    const clientDestPath = path.join(CLIENT_TARGET_DIR, file.dest);
    
    if (fs.existsSync(srcPath)) {
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(srcPath, destPath);
        fs.copyFileSync(srcPath, clientDestPath);
        console.log(`✅ Moved: ${file.src} → ${file.dest}`);
        moved++;
      } else {
        console.log(`⏭️  Skipped (exists): ${file.dest}`);
        skipped++;
      }
    }
  }
  
  // Consolidate from subdirectories
  for (const dir of directoriesToConsolidate) {
    const srcDir = path.join(__dirname, dir.src);
    if (!fs.existsSync(srcDir)) continue;
    
    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.mp3'));
    for (const file of files) {
      const match = file.match(dir.pattern);
      if (match) {
        const number = match[1];
        const destName = `${dir.destPrefix}${number}.mp3`;
        const srcPath = path.join(srcDir, file);
        const destPath = path.join(TARGET_DIR, destName);
        const clientDestPath = path.join(CLIENT_TARGET_DIR, destName);
        
        if (!fs.existsSync(destPath)) {
          fs.copyFileSync(srcPath, destPath);
          fs.copyFileSync(srcPath, clientDestPath);
          console.log(`✅ Moved: ${dir.src}/${file} → ${destName}`);
          moved++;
        } else {
          console.log(`⏭️  Skipped (exists): ${destName}`);
          skipped++;
        }
      }
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`  Files moved: ${moved}`);
  console.log(`  Files skipped (already exist): ${skipped}`);
  console.log(`\n✅ Consolidation complete!`);
  console.log(`\n⚠️  Next steps:`);
  console.log(`  1. Update code to use /uploads/textbook-audio/ for all MP3s`);
  console.log(`  2. Remove duplicate files from other locations`);
  console.log(`  3. Remove empty directories`);
}

if (import.meta.url === new URL(import.meta.url).href) {
  consolidate().catch(console.error);
}






