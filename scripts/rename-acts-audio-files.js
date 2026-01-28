#!/usr/bin/env node
/**
 * Script to rename Acts in Action audio files to URL-safe names
 * Removes emoji and spaces, uses hyphens instead
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const audioDir = path.join(__dirname, '..', 'client', 'public', 'uploads', 'textbook-audio');

// Mapping: old name -> new name
const renameMap = {
  'Act in Action 🎬  Cp1.mp3': 'acts-in-action-cp1.mp3',
  'Act in Action 🎬  Cp2.mp3': 'acts-in-action-cp2.mp3',
  'Act in Action 🎬  Cp3.mp3': 'acts-in-action-cp3.mp3',
  'Act in Action 🎬  Cp4.mp3': 'acts-in-action-cp4.mp3',
  'Act in Action 🎬  Cp5.mp3': 'acts-in-action-cp5.mp3',
  'Act in Action 🎬  Cp6.mp3': 'acts-in-action-cp6.mp3',
  'Act in Action 🎬  Cp7.mp3': 'acts-in-action-cp7.mp3',
  'Act in Action 🎬  Cp8.mp3': 'acts-in-action-cp8.mp3',
  'Act in Action 🎬  Cp9.mp3': 'acts-in-action-cp9.mp3',
  'Act in Action 🎬  Cp10.mp3': 'acts-in-action-cp10.mp3',
};

console.log('🔄 Renaming Acts in Action audio files...\n');

let renamed = 0;
let errors = 0;

for (const [oldName, newName] of Object.entries(renameMap)) {
  const oldPath = path.join(audioDir, oldName);
  const newPath = path.join(audioDir, newName);

  try {
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      console.log(`✅ ${oldName} → ${newName}`);
      renamed++;
    } else {
      console.log(`⚠️  File not found: ${oldName}`);
    }
  } catch (error) {
    console.error(`❌ Error renaming ${oldName}:`, error.message);
    errors++;
  }
}

console.log(`\n📊 Summary: ${renamed} files renamed, ${errors} errors`);
console.log('\n⚠️  Next step: Update code references to use new filenames!');






