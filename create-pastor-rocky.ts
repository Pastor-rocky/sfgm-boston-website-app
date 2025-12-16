#!/usr/bin/env node

/**
 * Create PastorRocky User with Required Fields
 */

import { db } from './server/db';
import { users } from './shared/schema';

async function createPastorRockyUser() {
  console.log('👤 Creating PastorRocky User with Required Fields...\n');
  
  const pastorRockyId = 'pastor-rocky';
  
  try {
    await db.insert(users).values({
      id: pastorRockyId,
      email: 'pastor_rocky@sfgmboston.com',
      name: 'PastorRocky',
      phone: '617-512-7451',
      role: 'student',
      gender: 'male', // Add required gender field
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log(`✅ Created PastorRocky user successfully!`);
    console.log(`   ID: "${pastorRockyId}"`);
    console.log(`   Email: pastor_rocky@sfgmboston.com`);
    console.log(`   Phone: 617-512-7451`);
    console.log(`   Role: student`);
    
  } catch (error) {
    console.log(`❌ Error creating user: ${error.message}`);
  }
  
  // Verify the user was created
  const allUsers = await db.select()
    .from(users);
  
  console.log(`\n👥 Current Users: ${allUsers.length}`);
  allUsers.forEach((user, index) => {
    console.log(`   ${index + 1}. ID: "${user.id}", Email: ${user.email || 'N/A'}, Role: ${user.role || 'N/A'}`);
  });
}

createPastorRockyUser().catch(error => {
  console.error('❌ Creation failed:', error);
  process.exit(1);
});
