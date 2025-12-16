#!/usr/bin/env node

/**
 * Verify Test User Creation
 */

import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function verifyTestUser() {
  console.log('🔍 Verifying Test User Creation...\n');
  
  try {
    const users = await db.execute(sql`
      SELECT id, username, gender, created_at
      FROM users 
      WHERE username LIKE 'testuser%'
      ORDER BY created_at DESC
      LIMIT 5;
    `);
    
    console.log('👥 Recent Test Users:');
    users.rows.forEach((user: any, index: number) => {
      console.log(`   ${index + 1}. Username: ${user.username}`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Gender: ${user.gender || 'NULL (Optional)'}`);
      console.log(`      Created: ${user.created_at}`);
      console.log('');
    });
    
    console.log('✅ Verification complete!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

verifyTestUser().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
