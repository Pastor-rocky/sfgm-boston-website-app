#!/usr/bin/env node

/**
 * Delete PastorRocky2 from Production Database
 * 
 * Usage:
 *   DATABASE_URL="your-production-url" node --env-file=.env node_modules/.bin/tsx delete-pastorrocky2-production.ts
 * 
 * Or set DATABASE_URL in your environment first
 */

import { db } from './server/db';
import { users, contentProgress, quizAttempts, enrollments, authTokens, essaySubmissions } from './shared/schema';
import { eq, or, ilike } from 'drizzle-orm';

async function deletePastorRocky2() {
  console.log('🗑️ Deleting PastorRocky2 from production database...\n');
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL environment variable not set!');
    console.log('\n📝 Usage:');
    console.log('   DATABASE_URL="your-production-url" node --env-file=.env node_modules/.bin/tsx delete-pastorrocky2-production.ts');
    process.exit(1);
  }
  
  console.log(`🔌 Connecting to: ${dbUrl.split('@')[1] || 'database'}...\n`);
  
  try {
    // Find the user by username (case-insensitive, try multiple variations)
    const allUsers = await db.select()
      .from(users);
    
    const user = allUsers.find(u => 
      u.username?.toLowerCase() === 'pastorrocky2' ||
      u.username === 'PastorRocky2' ||
      u.username === 'pastorrocky2'
    );
    
    if (!user) {
      console.log('❌ User "PastorRocky2" not found');
      console.log('\n👥 Available users:');
      allUsers.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.username || 'N/A'} (${u.id})`);
      });
      return;
    }
    
    console.log(`👤 Found user: ${user.username} (ID: ${user.id})`);
    console.log(`   Email: ${user.email || 'N/A'}`);
    
    // Delete all related data first
    console.log('\n🗑️ Deleting related data...');
    
    const progressDeleted = await db.delete(contentProgress).where(eq(contentProgress.studentId, user.id));
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




