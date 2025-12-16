#!/usr/bin/env node

/**
 * Clean Database and Create PastorRocky Student - Fixed Version
 */

import { db } from './server/db';
import { users, contentProgress, quizAttempts, enrollments } from './shared/schema';
import { eq } from 'drizzle-orm';

async function cleanDatabaseAndCreatePastorRockyFixed() {
  console.log('🧹 Cleaning Database and Creating PastorRocky Student (Fixed)...\n');
  
  // First, let's see what users exist
  const allUsers = await db.select()
    .from(users);
  
  console.log(`👥 Current Users: ${allUsers.length}`);
  allUsers.forEach((user, index) => {
    console.log(`   ${index + 1}. ID: "${user.id}", Email: ${user.email || 'N/A'}`);
  });
  
  // Delete all related data first (in correct order)
  console.log('\n🗑️ Cleaning all related data...');
  
  // Delete content progress for all non-admin users
  const usersToDelete = allUsers.filter(user => user.id !== '1'); // Keep admin
  for (const user of usersToDelete) {
    await db.delete(contentProgress).where(eq(contentProgress.studentId, user.id));
    await db.delete(quizAttempts).where(eq(quizAttempts.studentId, user.id));
    await db.delete(enrollments).where(eq(enrollments.studentId, user.id));
  }
  
  console.log(`   ✅ Cleaned content progress, quiz attempts, and enrollments`);
  
  // Now delete the users
  console.log('\n🗑️ Removing all non-admin users...');
  for (const user of usersToDelete) {
    console.log(`   Deleting user: "${user.id}"`);
    await db.delete(users).where(eq(users.id, user.id));
  }
  
  console.log(`   ✅ Deleted ${usersToDelete.length} users`);
  
  // Create PastorRocky user
  console.log('\n👤 Creating PastorRocky user...');
  const pastorRockyId = 'pastor-rocky';
  
  try {
    await db.insert(users).values({
      id: pastorRockyId,
      email: 'pastor_rocky@sfgmboston.com',
      name: 'PastorRocky',
      phone: '617-512-7451',
      role: 'student',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log(`   ✅ Created PastorRocky user with ID: "${pastorRockyId}"`);
    console.log(`   📧 Email: pastor_rocky@sfgmboston.com`);
    console.log(`   📞 Phone: 617-512-7451`);
    
  } catch (error) {
    console.log(`   ⚠️ User might already exist: ${error.message}`);
  }
  
  // Verify the cleanup
  console.log('\n🔍 Verifying cleanup...');
  const remainingUsers = await db.select()
    .from(users);
  
  console.log(`👥 Remaining Users: ${remainingUsers.length}`);
  remainingUsers.forEach((user, index) => {
    console.log(`   ${index + 1}. ID: "${user.id}", Email: ${user.email || 'N/A'}, Role: ${user.role || 'N/A'}`);
  });
  
  // Check if there's any remaining data
  const remainingProgress = await db.select()
    .from(contentProgress);
  
  const remainingQuizAttempts = await db.select()
    .from(quizAttempts);
  
  const remainingEnrollments = await db.select()
    .from(enrollments);
  
  console.log(`\n📊 Remaining Data:`);
  console.log(`   • Content Progress records: ${remainingProgress.length}`);
  console.log(`   • Quiz Attempt records: ${remainingQuizAttempts.length}`);
  console.log(`   • Enrollment records: ${remainingEnrollments.length}`);
  
  console.log('\n🎉 Database cleanup complete!');
  console.log('\n📝 Next Steps:');
  console.log('1. Remove automatic login from frontend');
  console.log('2. Test login with PastorRocky credentials');
  console.log('3. Complete Week 1 content to unlock Week 2');
  console.log('\n🔑 Login Credentials:');
  console.log('   • Username: PastorRocky');
  console.log('   • Email: pastor_rocky@sfgmboston.com');
  console.log('   • Phone: 617-512-7451');
}

cleanDatabaseAndCreatePastorRockyFixed().catch(error => {
  console.error('❌ Cleanup failed:', error);
  process.exit(1);
});
