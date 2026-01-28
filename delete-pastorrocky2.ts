#!/usr/bin/env node

/**
 * Delete PastorRocky2 Test User
 */

import { db } from './server/db';
import { users, contentProgress, quizAttempts, enrollments, authTokens, essaySubmissions } from './shared/schema';
import { eq, or, ilike } from 'drizzle-orm';

async function deletePastorRocky2() {
  console.log('🗑️ Deleting PastorRocky2 test user...\n');
  
  try {
    // Find the user by username (case-insensitive)
    const [user] = await db.select()
      .from(users)
      .where(or(
        ilike(users.username, 'pastorrocky2'),
        eq(users.username, 'PastorRocky2'),
        eq(users.username, 'pastorrocky2')
      ));
    
    if (!user) {
      console.log('❌ User "PastorRocky2" not found');
      return;
    }
    
    console.log(`👤 Found user: ${user.username} (ID: ${user.id})`);
    console.log(`   Email: ${user.email || 'N/A'}`);
    
    // Delete all related data first
    console.log('\n🗑️ Deleting related data...');
    
    await db.delete(contentProgress).where(eq(contentProgress.studentId, user.id));
    console.log('   ✅ Deleted content progress');
    
    await db.delete(quizAttempts).where(eq(quizAttempts.studentId, user.id));
    console.log('   ✅ Deleted quiz attempts');
    
    await db.delete(enrollments).where(eq(enrollments.studentId, user.id));
    console.log('   ✅ Deleted enrollments');
    
    await db.delete(authTokens).where(eq(authTokens.userId, user.id));
    console.log('   ✅ Deleted auth tokens');
    
    await db.delete(essaySubmissions).where(eq(essaySubmissions.studentId, user.id));
    console.log('   ✅ Deleted essay submissions');
    
    // Delete the user
    await db.delete(users).where(eq(users.id, user.id));
    console.log(`\n✅ Successfully deleted user: ${user.username}`);
    
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    process.exit(1);
  }
}

deletePastorRocky2().catch(error => {
  console.error('❌ Failed:', error);
  process.exit(1);
});




