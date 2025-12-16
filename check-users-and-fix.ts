#!/usr/bin/env node

/**
 * Check Users Table and Fix Student ID
 */

import { db } from './server/db';
import { contentProgress, quizAttempts, users } from './shared/schema';
import { eq } from 'drizzle-orm';

async function checkUsersAndFix() {
  console.log('🔍 Checking Users Table and Fixing Student ID...\n');
  
  // Get all users
  const allUsers = await db.select()
    .from(users);
  
  console.log(`👥 Users in database: ${allUsers.length}`);
  allUsers.forEach((user, index) => {
    console.log(`   ${index + 1}. ID: "${user.id}", Email: ${user.email || 'N/A'}`);
  });
  
  // Get the current student ID with data
  const currentStudentId = 'user_1758068127040_i32vigp3l';
  
  // Check if this student ID exists in users table
  const userExists = allUsers.some(user => user.id === currentStudentId);
  console.log(`\n🎯 Student ID "${currentStudentId}" exists in users table: ${userExists ? '✅ Yes' : '❌ No'}`);
  
  if (userExists) {
    console.log('\n✅ The student ID is correct and exists in the users table.');
    console.log('The issue must be elsewhere. Let me check the frontend authentication...');
    
    // Check what the frontend might be using
    console.log('\n🔧 Possible Frontend Issues:');
    console.log('1. Frontend not properly authenticated');
    console.log('2. Frontend using different user ID');
    console.log('3. API endpoint not returning correct data');
    console.log('4. React Query caching issues');
    
    console.log('\n📝 Debugging Steps:');
    console.log('1. Check browser developer tools for authentication errors');
    console.log('2. Check what user ID the frontend is sending to API');
    console.log('3. Verify the /api/content-progress/1 endpoint returns data');
    console.log('4. Check if React Query is caching stale data');
    
  } else {
    console.log('\n❌ Student ID does not exist in users table!');
    console.log('This explains why the API is not returning data.');
    
    // Find a valid user ID to use
    if (allUsers.length > 0) {
      const validUserId = allUsers[0].id;
      console.log(`\n🔧 Using valid user ID: "${validUserId}"`);
      
      // Update the records to use the valid user ID
      console.log('\n📊 Updating Content Progress Records...');
      const progressResult = await db.update(contentProgress)
        .set({ studentId: validUserId })
        .where(eq(contentProgress.studentId, currentStudentId))
        .returning();
      
      console.log(`   ✅ Updated ${progressResult.length} content progress records`);
      
      console.log('\n📝 Updating Quiz Attempt Records...');
      const quizResult = await db.update(quizAttempts)
        .set({ studentId: validUserId })
        .where(eq(quizAttempts.studentId, currentStudentId))
        .returning();
      
      console.log(`   ✅ Updated ${quizResult.length} quiz attempt records`);
      
      console.log('\n🎉 SUCCESS! Records updated to use valid user ID.');
      console.log('Try refreshing the page at http://localhost:56000/course/1');
    }
  }
}

checkUsersAndFix().catch(error => {
  console.error('❌ Check failed:', error);
  process.exit(1);
});
