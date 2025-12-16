#!/usr/bin/env node

/**
 * Debug Login Issues
 */

import { db } from './server/db';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function debugLoginIssues() {
  console.log('🔍 Debugging Login Issues...\n');
  
  try {
    // Check if PastorRocky user exists
    const pastorRocky = await db.execute(sql`
      SELECT id, username, email, password, role
      FROM users 
      WHERE id = 'pastor-rocky';
    `);
    
    if (pastorRocky.rows.length === 0) {
      console.log('❌ PastorRocky user not found!');
      return;
    }
    
    const user = pastorRocky.rows[0];
    console.log('👤 PastorRocky User Found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Password Hash: ${user.password ? 'Present' : 'Missing'}`);
    
    // Test password verification
    const testPassword = 'rocky123';
    console.log(`\n🔐 Testing Password: ${testPassword}`);
    
    if (user.password) {
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`   Password Valid: ${isValid}`);
      
      if (!isValid) {
        console.log('   ❌ Password verification failed!');
        console.log('   🔧 Re-hashing password...');
        
        const newHash = await bcrypt.hash(testPassword, 10);
        await db.execute(sql`
          UPDATE users 
          SET password = ${newHash}, updated_at = NOW()
          WHERE id = 'pastor-rocky';
        `);
        
        console.log('   ✅ Password re-hashed and updated!');
        
        // Test again
        const isValidAfterUpdate = await bcrypt.compare(testPassword, newHash);
        console.log(`   Password Valid After Update: ${isValidAfterUpdate}`);
      }
    } else {
      console.log('   ❌ No password hash found!');
    }
    
    // Test getUserByUsername function
    console.log('\n🔍 Testing getUserByUsername function...');
    const userByUsername = await db.execute(sql`
      SELECT id, username, email, password, role
      FROM users 
      WHERE username = 'PastorRocky';
    `);
    
    if (userByUsername.rows.length > 0) {
      console.log('   ✅ getUserByUsername works!');
      console.log(`   Found user: ${userByUsername.rows[0].username}`);
    } else {
      console.log('   ❌ getUserByUsername failed!');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugLoginIssues().catch(error => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});
