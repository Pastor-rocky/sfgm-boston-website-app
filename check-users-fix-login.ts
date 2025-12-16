#!/usr/bin/env node

/**
 * Check Current Users and Fix Login Issues
 */

import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function checkUsersAndFixLogin() {
  console.log('🔍 Checking Current Users and Login Issues...\n');
  
  try {
    // Check all current users
    const users = await db.execute(sql`
      SELECT id, username, email, role, created_at
      FROM users 
      ORDER BY created_at DESC;
    `);
    
    console.log('👥 Current Users in Database:');
    users.rows.forEach((user: any, index: number) => {
      console.log(`   ${index + 1}. Username: ${user.username || 'N/A'}`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Email: ${user.email || 'N/A'}`);
      console.log(`      Role: ${user.role}`);
      console.log(`      Created: ${user.created_at}`);
      console.log('');
    });
    
    // Check if PastorRocky exists
    const pastorRocky = users.rows.find((user: any) => user.id === 'pastor-rocky');
    
    if (pastorRocky) {
      console.log('✅ PastorRocky user exists!');
      console.log(`   Username: ${pastorRocky.username || 'N/A'}`);
      console.log(`   Email: ${pastorRocky.email || 'N/A'}`);
      console.log(`   Role: ${pastorRocky.role}`);
    } else {
      console.log('❌ PastorRocky user not found!');
      console.log('   Creating PastorRocky user...');
      
      // Create PastorRocky user
      await db.execute(sql`
        INSERT INTO users (id, username, email, password, role, gender, created_at, updated_at)
        VALUES (
          'pastor-rocky',
          'PastorRocky',
          'pastor_rocky@sfgmboston.com',
          '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          'student',
          NULL,
          NOW(),
          NOW()
        );
      `);
      
      console.log('✅ PastorRocky user created!');
    }
    
    console.log('\n🔑 Login Instructions:');
    console.log('1. Clear your browser storage (F12 → Application → Clear All)');
    console.log('2. Go to http://localhost:56000/login');
    console.log('3. Use these credentials:');
    console.log('   • Username: PastorRocky');
    console.log('   • Password: rocky123');
    console.log('   • Email: pastor_rocky@sfgmboston.com');
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkUsersAndFixLogin().catch(error => {
  console.error('❌ Check failed:', error);
  process.exit(1);
});
