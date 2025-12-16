#!/usr/bin/env node

/**
 * Fix PastorRocky Username
 */

import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function fixPastorRockyUsername() {
  console.log('🔧 Fixing PastorRocky Username...\n');
  
  try {
    // Update PastorRocky to have a username
    await db.execute(sql`
      UPDATE users 
      SET username = 'PastorRocky', updated_at = NOW()
      WHERE id = 'pastor-rocky';
    `);
    
    console.log('✅ PastorRocky username updated!');
    
    // Verify the update
    const pastorRocky = await db.execute(sql`
      SELECT id, username, email, role
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
    }
    
    console.log('\n🔑 Login Credentials:');
    console.log('   • Username: PastorRocky');
    console.log('   • Password: rocky123');
    console.log('   • Email: pastor_rocky@sfgmboston.com');
    
    console.log('\n📝 Next Steps:');
    console.log('1. Clear browser storage (F12 → Application → Clear All)');
    console.log('2. Go to http://localhost:56000/login');
    console.log('3. Login with PastorRocky / rocky123');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

fixPastorRockyUsername().catch(error => {
  console.error('❌ Fix failed:', error);
  process.exit(1);
});
