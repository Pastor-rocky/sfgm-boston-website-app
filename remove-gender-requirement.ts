#!/usr/bin/env node

/**
 * Remove Gender Requirement and SMS Notifications
 * Database Migration Script
 */

import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function removeGenderRequirement() {
  console.log('🔧 Removing Gender Requirement and SMS Notifications...\n');
  
  try {
    // Make gender column nullable
    console.log('1. Making gender column nullable...');
    await db.execute(sql`
      ALTER TABLE users 
      ALTER COLUMN gender DROP NOT NULL;
    `);
    console.log('   ✅ Gender column is now optional');
    
    // Add a default value for existing users who might have null gender
    console.log('\n2. Setting default gender for existing users...');
    await db.execute(sql`
      UPDATE users 
      SET gender = 'Not Specified' 
      WHERE gender IS NULL;
    `);
    console.log('   ✅ Default gender set for existing users');
    
    // Check current users
    const users = await db.execute(sql`
      SELECT id, username, gender, email_consent, sms_consent 
      FROM users 
      ORDER BY created_at DESC;
    `);
    
    console.log('\n👥 Current Users:');
    users.rows.forEach((user: any, index: number) => {
      console.log(`   ${index + 1}. ${user.username} - Gender: ${user.gender || 'Not Specified'}`);
    });
    
    console.log('\n🎉 Database migration completed successfully!');
    console.log('\n📝 Changes made:');
    console.log('   • Gender field is now optional');
    console.log('   • Existing users have default gender set');
    console.log('   • Ready for frontend updates');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

removeGenderRequirement().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
