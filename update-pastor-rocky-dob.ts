#!/usr/bin/env node

/**
 * Update PastorRocky Date of Birth
 */

import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function updateDateOfBirth() {
  console.log('🔧 Updating PastorRocky Date of Birth...\n');
  
  try {
    const dateOfBirth = '1978-02-12'; // February 12, 1978
    
    await db.execute(sql`
      UPDATE users 
      SET date_of_birth = ${dateOfBirth}, updated_at = NOW()
      WHERE id = 'pastor-rocky';
    `);
    
    console.log('✅ Date of birth updated successfully!');
    console.log(`   Date of Birth: February 12, 1978 (${dateOfBirth})`);
    
    // Verify the update
    const user = await db.execute(sql`
      SELECT id, username, email, date_of_birth
      FROM users 
      WHERE id = 'pastor-rocky';
    `);
    
    if (user.rows.length > 0) {
      const updatedUser = user.rows[0];
      console.log('\n👤 Updated User Details:');
      console.log(`   ID: ${updatedUser.id}`);
      console.log(`   Username: ${updatedUser.username}`);
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   Date of Birth: ${updatedUser.date_of_birth || 'Not set'}`);
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

updateDateOfBirth().catch(error => {
  console.error('❌ Update failed:', error);
  process.exit(1);
});


