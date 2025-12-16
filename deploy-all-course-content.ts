#!/usr/bin/env node

/**
 * Comprehensive Deployment Script
 * 
 * This script adds ALL missing course content to the database:
 * 1. All course readings (107 readings across 8 courses)
 * 2. Verifies all data is present
 * 3. Reports what was added/updated
 * 
 * Run with: DATABASE_URL="your_url" npx tsx deploy-all-course-content.ts
 */

import { db } from './server/db';
import { courseReadings } from './shared/schema';
import { eq } from 'drizzle-orm';
import { generateAllReadings } from './add-all-course-readings';

interface ReadingData {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  readingType: 'textbook' | 'bible_chapter' | 'external_link';
  content: string | null;
  bookTitle: string | null;
  bookAuthor: string | null;
  bookCoverUrl: string | null;
  chapterNumber: number | null;
  orderIndex: number;
}

async function deployAllContent() {
  console.log('🚀 Starting comprehensive course content deployment...\n');
  console.log('=' .repeat(80));
  
  try {
    // Step 1: Get all readings from the script
    console.log('\n📖 Step 1: Generating all course readings...');
    const allReadings = await generateAllReadings();
    console.log(`✅ Generated ${allReadings.length} readings\n`);

    // Step 2: Check what's already in the database
    console.log('📊 Step 2: Checking existing database readings...');
    const existingReadings = await db
      .select()
      .from(courseReadings)
      .where(eq(courseReadings.isActive, true));
    
    const existingById = new Map(existingReadings.map(r => [r.id, r]));
    console.log(`   Found ${existingReadings.length} existing readings\n`);

    // Step 3: Insert or update readings
    console.log('💾 Step 3: Inserting/updating readings in database...\n');
    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const reading of allReadings) {
      try {
        const existing = existingById.get(reading.id);
        
        if (existing) {
          // Update existing reading
          await db
            .update(courseReadings)
            .set({
              courseId: reading.courseId,
              title: reading.title,
              description: reading.description,
              readingType: reading.readingType,
              content: reading.content,
              bookTitle: reading.bookTitle,
              bookAuthor: reading.bookAuthor,
              bookCoverUrl: reading.bookCoverUrl,
              chapterNumber: reading.chapterNumber,
              orderIndex: reading.orderIndex,
              isActive: true,
              updatedAt: new Date()
            })
            .where(eq(courseReadings.id, reading.id));
          updated++;
        } else {
          // Insert new reading (use ON CONFLICT to handle duplicates)
          try {
            await db.insert(courseReadings).values({
              id: reading.id,
              courseId: reading.courseId,
              title: reading.title,
              description: reading.description,
              readingType: reading.readingType,
              content: reading.content,
              bookTitle: reading.bookTitle,
              bookAuthor: reading.bookAuthor,
              bookCoverUrl: reading.bookCoverUrl,
              chapterNumber: reading.chapterNumber,
              orderIndex: reading.orderIndex,
              isActive: true
            });
            inserted++;
          } catch (insertError: any) {
            // If insert fails due to duplicate, try update instead
            if (insertError.message?.includes('duplicate key') || insertError.code === '23505') {
              await db
                .update(courseReadings)
                .set({
                  courseId: reading.courseId,
                  title: reading.title,
                  description: reading.description,
                  readingType: reading.readingType,
                  content: reading.content,
                  bookTitle: reading.bookTitle,
                  bookAuthor: reading.bookAuthor,
                  bookCoverUrl: reading.bookCoverUrl,
                  chapterNumber: reading.chapterNumber,
                  orderIndex: reading.orderIndex,
                  isActive: true,
                  updatedAt: new Date()
                })
                .where(eq(courseReadings.id, reading.id));
              updated++;
            } else {
              throw insertError;
            }
          }
        }
      } catch (error: any) {
        console.error(`   ❌ Error with reading ID ${reading.id} (${reading.title}):`, error.message);
        errors++;
      }
    }

    // Step 4: Verify by course
    console.log('\n📋 Step 4: Verifying readings by course...\n');
    const readingsByCourse = await db
      .select()
      .from(courseReadings)
      .where(eq(courseReadings.isActive, true));
    
    const courseCounts = new Map<number, number>();
    readingsByCourse.forEach(r => {
      courseCounts.set(r.courseId, (courseCounts.get(r.courseId) || 0) + 1);
    });

    const expectedCounts: Record<number, number> = {
      1: 21, // Acts in Action
      2: 20, // Becoming a Fire Starter
      3: 22, // Don't Be a Jonah
      4: 4,  // G.R.O.W
      5: 24, // Studying for Service
      6: 5,  // Deacon Course
      7: 6,  // Level Up Leadership
      8: 5   // Youth Ministry
    };

    console.log('   Course Reading Counts:');
    for (const [courseId, expected] of Object.entries(expectedCounts)) {
      const actual = courseCounts.get(Number(courseId)) || 0;
      const status = actual === expected ? '✅' : '⚠️';
      console.log(`   ${status} Course ${courseId}: ${actual}/${expected} readings`);
    }

    // Step 5: Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 DEPLOYMENT SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Inserted: ${inserted} new readings`);
    console.log(`🔄 Updated: ${updated} existing readings`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📚 Total readings in database: ${readingsByCourse.length}`);
    console.log('\n✅ Deployment complete!');
    console.log('\n⚠️  IMPORTANT: After deployment, verify that:');
    console.log('   1. All courses show readings correctly on the website');
    console.log('   2. Course 4 (G.R.O.W) shows 4 textbook readings (not Acts Bible readings)');
    console.log('   3. Course 1 (Acts in Action) shows 21 readings (intro + 10 weeks × 2)');
    console.log('   4. Remove hardcoded fallback in server/storage.ts line 1882-2117');
    console.log('\n');

  } catch (error: any) {
    console.error('\n❌ Deployment failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the deployment
deployAllContent()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

export { deployAllContent };

