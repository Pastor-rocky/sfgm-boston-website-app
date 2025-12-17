#!/usr/bin/env node

/**
 * List All Users in Database
 */

import { db } from './server/db';
import { users } from './shared/schema';

async function listAllUsers() {
  console.log('👥 Listing all users in database...\n');
  
  try {
    const allUsers = await db.select()
      .from(users);
    
    console.log(`Total users: ${allUsers.length}\n`);
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. Username: "${user.username || 'N/A'}"`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Name: ${user.firstName || ''} ${user.lastName || ''}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error listing users:', error);
    process.exit(1);
  }
}

listAllUsers().catch(error => {
  console.error('❌ Failed:', error);
  process.exit(1);
});

