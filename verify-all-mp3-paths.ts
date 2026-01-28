#!/usr/bin/env node

/**
 * Verify All MP3 Paths
 * 
 * Checks if all MP3 files referenced in e-book pages actually exist
 */

import * as fs from 'fs';
import * as path from 'path';

const ebooks = [
  {
    name: 'Acts in Action',
    file: 'client/src/pages/acts-in-action-ebook.tsx',
    paths: [
      '/uploads/textbook-audio/acts-in-action-cp1.mp3',
      '/uploads/textbook-audio/acts-in-action-cp2.mp3',
      '/uploads/textbook-audio/acts-in-action-cp3.mp3',
      '/uploads/textbook-audio/acts-in-action-cp4.mp3',
      '/uploads/textbook-audio/acts-in-action-cp5.mp3',
      '/uploads/textbook-audio/acts-in-action-cp6.mp3',
      '/uploads/textbook-audio/acts-in-action-cp7.mp3',
      '/uploads/textbook-audio/acts-in-action-cp8.mp3',
      '/uploads/textbook-audio/acts-in-action-cp9.mp3',
      '/uploads/textbook-audio/acts-in-action-cp10.mp3',
    ]
  },
  {
    name: 'Fire Starter',
    file: 'client/src/pages/becoming-a-firestarter-complete-ebook.tsx',
    paths: [
      '/uploads/firestarter-audio/fire-starter-cp1.mp3',
      '/uploads/firestarter-audio/fire-starter-cp2.mp3',
      '/uploads/firestarter-audio/fire-starter-cp3.mp3',
      '/uploads/firestarter-audio/fire-starter-cp4.mp3',
      '/uploads/firestarter-audio/fire-starter-cp5.mp3',
      '/uploads/firestarter-audio/fire-starter-cp6.mp3',
      '/uploads/firestarter-audio/fire-starter-cp7.mp3',
      '/uploads/firestarter-audio/fire-starter-cp8.mp3',
      '/uploads/firestarter-audio/fire-starter-cp9.mp3',
      '/uploads/firestarter-audio/fire-starter-cp10.mp3',
    ]
  },
  {
    name: "Don't Be a Jonah",
    file: 'client/src/pages/dont-be-a-jonah-complete-book.tsx',
    paths: [
      '/uploads/textbook-audio/dont-be-a-jonah-ch1.mp3',
      '/uploads/textbook-audio/dont-be-a-jonah-ch2.mp3',
      '/uploads/textbook-audio/dont-be-a-jonah-ch3.mp3',
      '/uploads/textbook-audio/dont-be-a-jonah-ch4.mp3',
      '/uploads/textbook-audio/dont-be-a-jonah-ch5.mp3',
      '/uploads/textbook-audio/dont-be-a-jonah-ch6.mp3',
      '/uploads/textbook-audio/dont-be-a-jonah-ch7.mp3',
      '/uploads/textbook-audio/dont-be-a-jonah-ch8.mp3',
      '/uploads/textbook-audio/dont-be-a-jonah-ch9.mp3',
      '/uploads/textbook-audio/dont-be-a-jonah-ch10.mp3',
      '/uploads/textbook-audio/dont-be-a-jonah-ch11.mp3',
    ]
  },
  {
    name: 'Studying for Service',
    file: 'client/src/pages/studying-for-service-complete-ebook.tsx',
    paths: [
      '/studying-for-service-ch1.mp3',
      '/studying-for-service-ch2.mp3',
      '/studying-for-service-ch3.mp3',
      '/studying-for-service-ch4.mp3',
      '/studying-for-service-ch5.mp3',
      '/studying-for-service-ch6.mp3',
      '/studying-for-service-ch7.mp3',
      '/studying-for-service-ch8.mp3',
      '/studying-for-service-ch9.mp3',
      '/studying-for-service-ch10.mp3',
      '/studying-for-service-ch11.mp3',
      '/studying-for-service-ch12.mp3',
    ]
  },
  {
    name: 'G.R.O.W',
    file: 'client/src/pages/grow-complete-ebook.tsx',
    paths: [
      '/grow-ch1.mp3',
      '/grow-ch2.mp3',
      '/grow-ch3.mp3',
      '/grow-ch4.mp3',
    ]
  },
  {
    name: 'Deacon Course',
    file: 'client/src/pages/deacon-course-complete-ebook.tsx',
    paths: [
      '/deacon-course-ch1.mp3',
      '/deacon-course-ch2.mp3',
      '/deacon-course-ch3.mp3',
      '/deacon-course-ch4.mp3',
      '/deacon-course-ch5.mp3',
    ]
  },
  {
    name: 'Youth Ministry',
    file: 'client/src/pages/youth-ministry-complete-ebook.tsx',
    paths: [
      '/uploads/textbook-audio/youth-ministry-ch1.mp3',
      '/uploads/textbook-audio/youth-ministry-ch2.mp3',
      '/uploads/textbook-audio/youth-ministry-ch3.mp3',
      '/uploads/textbook-audio/youth-ministry-ch4.mp3',
      '/uploads/textbook-audio/youth-ministry-ch5.mp3',
    ]
  },
];

console.log('🔍 Verifying All MP3 Paths...\n');
console.log('='.repeat(80));

let totalIssues = 0;

ebooks.forEach(ebook => {
  console.log(`\n📚 ${ebook.name}:`);
  let issues = 0;
  
  ebook.paths.forEach(audioPath => {
    const filePath = path.join('public', audioPath);
    const exists = fs.existsSync(filePath);
    
    if (exists) {
      console.log(`  ✅ ${audioPath}`);
    } else {
      console.log(`  ❌ ${audioPath} - FILE NOT FOUND`);
      issues++;
      totalIssues++;
    }
  });
  
  if (issues === 0) {
    console.log(`  ✅ All ${ebook.paths.length} files found!`);
  } else {
    console.log(`  ⚠️  ${issues} file(s) missing`);
  }
});

console.log('\n' + '='.repeat(80));
if (totalIssues === 0) {
  console.log('✅ All MP3 files verified!');
} else {
  console.log(`⚠️  Found ${totalIssues} missing file(s)`);
}

process.exit(totalIssues > 0 ? 1 : 0);






