#!/usr/bin/env node

/**
 * Add missing date_of_birth column to users table
 */

import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function addDateOfBirthColumn() {
  console.log('🔧 Checking for date_of_birth column...\n');
  
  try {
    // Check if column exists
    const check = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'date_of_birth'
    `);
    
    if (check.rows.length === 0) {
      console.log('Adding date_of_birth column...');
      await db.execute(sql`
        ALTER TABLE users ADD COLUMN date_of_birth VARCHAR(255)
      `);
      console.log('✅ Column added successfully!');
    } else {
      console.log('✅ Column already exists!');
    }
    
    console.log('\n✅ Database schema is now up to date!');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

addDateOfBirthColumn().catch(error => {
  console.error('❌ Fix failed:', error);
  process.exit(1);
});


