#!/usr/bin/env node

/**
 * Set PastorRocky Role to Dean
 * 
 * This script updates PastorRocky's role to "dean" in the database.
 * Run with: node --env-file=.env node_modules/.bin/tsx set-pastor-rocky-as-dean.ts
 */

import { db } from './server/db';
import { users } from './shared/schema';
import { eq, or, ilike } from 'drizzle-orm';
import { storage } from './server/storage';

async function setPastorRockyAsDean() {
  console.log('👔 Setting PastorRocky Role to Dean...\n');
  
  try {
    // Find PastorRocky by email or username
    const [pastorRocky] = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, 'pastor_rocky@sfgmboston.com'),
          ilike(users.username, 'pastorrocky'),
          eq(users.id, 'pastor-rocky')
        )
      )
      .limit(1);

    if (!pastorRocky) {
      console.log('❌ PastorRocky user not found!');
      console.log('   Please ensure the user exists in the database.');
      console.log('   Expected email: pastor_rocky@sfgmboston.com');
      console.log('   Expected username: PastorRocky (or similar)');
      return;
    }

    console.log('👤 Found PastorRocky:');
    console.log(`   ID: ${pastorRocky.id}`);
    console.log(`   Username: ${pastorRocky.username || 'N/A'}`);
    console.log(`   Email: ${pastorRocky.email || 'N/A'}`);
    console.log(`   Current Role: ${pastorRocky.role || 'N/A'}\n`);

    // Update role to dean
    await storage.setUserAsDean(pastorRocky.id);
    
    console.log('✅ PastorRocky role updated to "dean"!');
    
    // Verify the update
    const [updated] = await db
      .select()
      .from(users)
      .where(eq(users.id, pastorRocky.id))
      .limit(1);
    
    if (updated) {
      console.log('\n👔 Updated User Details:');
      console.log(`   ID: ${updated.id}`);
      console.log(`   Username: ${updated.username || 'N/A'}`);
      console.log(`   Email: ${updated.email || 'N/A'}`);
      console.log(`   Role: ${updated.role}`);
    }
    
    console.log('\n📝 Next Steps:');
    console.log('1. Log out and log back in to refresh your session');
    console.log('2. You should now have access to all pages as Dean');
    console.log('3. Your role will display as "Dean" in the admin panel');
    
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
}

setPastorRockyAsDean().catch(error => {
  console.error('❌ Update failed:', error);
  process.exit(1);
});
