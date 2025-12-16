#!/usr/bin/env node

/**
 * Complete Database Cleanup and Create PastorRocky
 */

import { db } from './server/db';
import { users, contentProgress, quizAttempts, enrollments, authTokens } from './shared/schema';
import { eq } from 'drizzle-orm';

async function completeDatabaseCleanup() {
  console.log('🧹 Complete Database Cleanup and Create PastorRocky...\n');
  
  // First, let's see what users exist
  const allUsers = await db.select()
    .from(users);
  
  console.log(`👥 Current Users: ${allUsers.length}`);
  allUsers.forEach((user, index) => {
    console.log(`   ${index + 1}. ID: "${user.id}", Email: ${user.email || 'N/A'}`);
  });
  
  // Delete ALL data first (nuclear option)
  console.log('\n🗑️ Nuclear cleanup - removing ALL data...');
  
  await db.delete(contentProgress);
  await db.delete(quizAttempts);
  await db.delete(enrollments);
  await db.delete(authTokens);
  
  console.log('   ✅ Cleaned all content progress, quiz attempts, enrollments, and auth tokens');
  
  // Now delete all users except admin
  const usersToDelete = allUsers.filter(user => user.id !== '1'); // Keep admin
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
  
  const remainingAuthTokens = await db.select()
    .from(authTokens);
  
  console.log(`\n📊 Remaining Data:`);
  console.log(`   • Content Progress records: ${remainingProgress.length}`);
  console.log(`   • Quiz Attempt records: ${remainingQuizAttempts.length}`);
  console.log(`   • Enrollment records: ${remainingEnrollments.length}`);
  console.log(`   • Auth Token records: ${remainingAuthTokens.length}`);
  
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

completeDatabaseCleanup().catch(error => {
  console.error('❌ Cleanup failed:', error);
  process.exit(1);
});
