#!/usr/bin/env node

/**
 * Fix PastorRocky Password
 */

import { db } from './server/db';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function fixPastorRockyPassword() {
  console.log('🔧 Fixing PastorRocky Password...\n');
  
  try {
    // Hash the password properly
    const password = 'rocky123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('🔐 Password hashing:');
    console.log(`   Plain text: ${password}`);
    console.log(`   Hashed: ${hashedPassword}`);
    
    // Update PastorRocky password
    await db.execute(sql`
      UPDATE users 
      SET password = ${hashedPassword}, updated_at = NOW()
      WHERE id = 'pastor-rocky';
    `);
    
    console.log('✅ PastorRocky password updated!');
    
    // Verify the update
    const pastorRocky = await db.execute(sql`
      SELECT id, username, email, role, password
      FROM users 
      WHERE id = 'pastor-rocky';
    `);
    
    if (pastorRocky.rows.length > 0) {
      const user = pastorRocky.rows[0];
      console.log('\n👤 PastorRocky User Details:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Has Password: ${user.password ? 'Yes' : 'No'}`);
    }
    
    console.log('\n🔑 Login Credentials:');
    console.log('   • Username: PastorRocky');
    console.log('   • Password: rocky123');
    console.log('   • Email: pastor_rocky@sfgmboston.com');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

fixPastorRockyPassword().catch(error => {
  console.error('❌ Fix failed:', error);
  process.exit(1);
});
