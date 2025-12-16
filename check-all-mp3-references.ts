#!/usr/bin/env node

/**
 * Check All MP3 References
 * 
 * This script finds all MP3 file references in the codebase and checks if the files exist
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find all MP3 references in client/src
function findMP3References(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findMP3References(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const mp3Matches = content.match(/['"`]([^'"`]*\.mp3[^'"`]*)['"`]/g);
      if (mp3Matches) {
        mp3Matches.forEach(match => {
          const mp3Path = match.replace(/['"`]/g, '');
          if (!fileList.includes(mp3Path)) {
            fileList.push(mp3Path);
          }
        });
      }
    }
  });
  
  return fileList;
}

// Check if file exists
function checkFileExists(mp3Path: string): { exists: boolean; location: string } {
  // Remove leading slash for path resolution
  const cleanPath = mp3Path.startsWith('/') ? mp3Path.slice(1) : mp3Path;
  
  // Check in public directory
  const publicPath = path.join(__dirname, 'public', cleanPath);
  if (fs.existsSync(publicPath)) {
    return { exists: true, location: `public/${cleanPath}` };
  }
  
  // Check in root uploads
  const uploadsPath = path.join(__dirname, 'uploads', cleanPath.replace('uploads/', ''));
  if (fs.existsSync(uploadsPath)) {
    return { exists: true, location: `uploads/${cleanPath.replace('uploads/', '')}` };
  }
  
  return { exists: false, location: 'NOT FOUND' };
}

async function main() {
  console.log('🔍 Scanning codebase for MP3 references...\n');
  
  const clientSrcPath = path.join(__dirname, 'client', 'src');
  const mp3References = findMP3References(clientSrcPath);
  
  console.log(`📊 Found ${mp3References.length} unique MP3 file references:\n`);
  
  const results: Array<{ path: string; exists: boolean; location: string }> = [];
  
  mp3References.forEach(mp3Path => {
    const check = checkFileExists(mp3Path);
    results.push({
      path: mp3Path,
      exists: check.exists,
      location: check.location
    });
  });
  
  // Group by status
  const existing = results.filter(r => r.exists);
  const missing = results.filter(r => !r.exists);
  
  console.log('✅ FILES THAT EXIST:\n');
  existing.forEach(r => {
    console.log(`  ✓ ${r.path}`);
    console.log(`    Location: ${r.location}\n`);
  });
  
  console.log('\n❌ FILES THAT ARE MISSING:\n');
  missing.forEach(r => {
    console.log(`  ✗ ${r.path}`);
    console.log(`    Status: ${r.location}\n`);
  });
  
  console.log(`\n📈 Summary:`);
  console.log(`  Total references: ${results.length}`);
  console.log(`  Files found: ${existing.length}`);
  console.log(`  Files missing: ${missing.length}`);
  
  // List all files in public/uploads/textbook-audio
  console.log('\n📁 Files actually in public/uploads/textbook-audio/:');
  const textbookAudioPath = path.join(__dirname, 'public', 'uploads', 'textbook-audio');
  if (fs.existsSync(textbookAudioPath)) {
    const files = fs.readdirSync(textbookAudioPath).filter(f => f.endsWith('.mp3'));
    files.forEach(file => {
      console.log(`  - ${file}`);
    });
  } else {
    console.log('  Directory does not exist');
  }
  
  process.exit(0);
}

if (import.meta.url === new URL(import.meta.url).href) {
  main().catch(console.error);
}

