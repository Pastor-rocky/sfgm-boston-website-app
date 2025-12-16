import { db } from './server/db';
import { courseReadings } from './shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Add all 107 course readings to the database
 * Based on the reading structure defined in course-content-viewer.tsx
 */

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

async function generateAllReadings(): Promise<ReadingData[]> {
  const allReadings: ReadingData[] = [];

  // ============================================
  // COURSE 1: ACTS IN ACTION (10 weeks, 21 readings)
  // ============================================
  console.log('📖 Course 1: Acts in Action (21 readings)');
  
  // Week 1: 3 readings
  allReadings.push({
    id: 1,
    courseId: 1,
    title: "Introduction to Acts in Action",
    description: "Course introduction and overview",
    readingType: 'textbook',
    content: "Introduction content - to be populated from Acts in Action textbook",
    bookTitle: "Acts in Action",
    bookAuthor: null,
    bookCoverUrl: null,
    chapterNumber: 0,
    orderIndex: 0
  });

  allReadings.push({
    id: 2,
    courseId: 1,
    title: "Week 1: Acts in Action Chapter 1",
    description: "Chapter 1 of Acts in Action textbook",
    readingType: 'textbook',
    content: "Chapter 1 content - to be populated from Acts in Action CHAPTER 1.pdf",
    bookTitle: "Acts in Action",
    bookAuthor: null,
    bookCoverUrl: null,
    chapterNumber: 1,
    orderIndex: 1
  });

    allReadings.push({
      id: 3,
      courseId: 1,
      title: "Week 1: Acts Chapters 1-2",
      description: "Read the beginning of the church with the ascension of Jesus and Pentecost",
      readingType: 'bible_chapter',
      content: "This week we begin our journey through the book of Acts by reading about Jesus' ascension and the birth of the church at Pentecost.\n\nRead online: https://www.biblegateway.com/passage/?search=Acts%201-2&version=NLT",
      bookTitle: "Book of Acts",
      bookAuthor: "Luke",
      bookCoverUrl: null,
      chapterNumber: 1,
      orderIndex: 2
    });

  // Weeks 2-10: 2 readings each (Chapter + Bible)
  const actsChapters = [
    { week: 2, chapter: 2, bible: "Acts 3-5", bibleDesc: "The early church's growth, miracles, and persecution" },
    { week: 3, chapter: 3, bible: "Acts 6-8", bibleDesc: "Stephen's martyrdom and the spread of the Gospel" },
    { week: 4, chapter: 4, bible: "Acts 9-11", bibleDesc: "Paul's conversion and Peter's vision" },
    { week: 5, chapter: 5, bible: "Acts 12-14", bibleDesc: "Persecution, deliverance, and Paul's first missionary journey" },
    { week: 6, chapter: 6, bible: "Acts 15-17", bibleDesc: "The Jerusalem Council and Paul's second missionary journey" },
    { week: 7, chapter: 7, bible: "Acts 18-20", bibleDesc: "Paul's ministry in Ephesus and farewell to the elders" },
    { week: 8, chapter: 8, bible: "Acts 21-23", bibleDesc: "Paul's arrest in Jerusalem and defense before the council" },
    { week: 9, chapter: 9, bible: "Acts 24-26", bibleDesc: "Paul's trials before Felix, Festus, and Agrippa" },
    { week: 10, chapter: 10, bible: "Acts 27-28", bibleDesc: "Paul's journey to Rome and ministry under house arrest" }
  ];

  actsChapters.forEach(({ week, chapter, bible, bibleDesc }, index) => {
    // Week 1 uses IDs 1-3, Week 2 starts at ID 4
    // Week 2: IDs 4,5  Week 3: IDs 6,7  Week 4: IDs 8,9, etc.
    const baseId = week * 2; // Week 2 = 4, Week 3 = 6, Week 4 = 8
    
    // Textbook chapter
    allReadings.push({
      id: baseId,
      courseId: 1,
      title: `Week ${week}: Acts in Action Chapter ${chapter}`,
      description: `Chapter ${chapter} of Acts in Action textbook`,
      readingType: 'textbook',
      content: `Chapter ${chapter} content - to be populated from Acts in Action CHAPTER ${chapter}.pdf`,
      bookTitle: "Acts in Action",
      bookAuthor: null,
      bookCoverUrl: null,
      chapterNumber: chapter,
      orderIndex: (week - 1) * 2 + 1
    });

    // Bible reading
    allReadings.push({
      id: baseId + 1,
      courseId: 1,
      title: `Week ${week}: ${bible}`,
      description: bibleDesc,
      readingType: 'bible_chapter',
      content: `${bibleDesc}\n\nRead online: https://www.biblegateway.com/passage/?search=${encodeURIComponent(bible)}&version=NLT`,
      bookTitle: "Book of Acts",
      bookAuthor: "Luke",
      bookCoverUrl: null,
      chapterNumber: week,
      orderIndex: (week - 1) * 2 + 2
    });
  });

  // ============================================
  // COURSE 2: BECOMING A FIRE STARTER (10 weeks, 20 readings)
  // ============================================
  console.log('📖 Course 2: Becoming a Fire Starter (20 readings)');
  
  const fireStarterChapters = [
    { week: 1, chapter: 1, bible: "Luke 1-4", bibleDesc: "The beginning of the Gospel according to Luke" },
    { week: 2, chapter: 2, bible: "Luke 5-8", bibleDesc: "Jesus' ministry and teachings" },
    { week: 3, chapter: 3, bible: "Luke 9-12", bibleDesc: "Jesus sends out the twelve and teaches" },
    { week: 4, chapter: 4, bible: "Luke 13-16", bibleDesc: "Parables and teachings" },
    { week: 5, chapter: 5, bible: "Luke 17-20", bibleDesc: "Jesus' journey to Jerusalem" },
    { week: 6, chapter: 6, bible: "Luke 21-24", bibleDesc: "The passion and resurrection" },
    { week: 7, chapter: 7, bible: "John 1-5", bibleDesc: "The Word became flesh" },
    { week: 8, chapter: 8, bible: "John 6-10", bibleDesc: "Jesus the bread of life and the good shepherd" },
    { week: 9, chapter: 9, bible: "John 11-15", bibleDesc: "The resurrection of Lazarus and the last supper" },
    { week: 10, chapter: 10, bible: "John 16-21", bibleDesc: "The Holy Spirit and the resurrection" }
  ];

  fireStarterChapters.forEach(({ week, chapter, bible, bibleDesc }) => {
    // Week 1: 101 (chapter), 102 (bible)
    // Week 2: 103 (chapter), 104 (bible)
    // Week 3: 105 (chapter), 106 (bible), etc.
    const chapterId = 100 + (week - 1) * 2 + 1;
    const bibleId = 100 + (week - 1) * 2 + 2;
    
    // Textbook chapter
    allReadings.push({
      id: chapterId,
      courseId: 2,
      title: `Week ${week}: Becoming a Fire Starter Chapter ${chapter}`,
      description: `Chapter ${chapter}: ${getFireStarterChapterTitle(chapter)}`,
      readingType: 'textbook',
      content: `Chapter ${chapter} content - available in becoming-a-firestarter-complete-ebook.tsx`,
      bookTitle: "Becoming a Fire Starter",
      bookAuthor: null,
      bookCoverUrl: null,
      chapterNumber: chapter,
      orderIndex: (week - 1) * 2
    });

    // Bible reading
    allReadings.push({
      id: bibleId,
      courseId: 2,
      title: `Week ${week}: ${bible}`,
      description: bibleDesc,
      readingType: 'bible_chapter',
      content: `${bibleDesc}\n\nRead online: https://www.biblegateway.com/passage/?search=${encodeURIComponent(bible)}&version=NLT`,
      bookTitle: bible.includes('Luke') ? "Gospel of Luke" : "Gospel of John",
      bookAuthor: "Luke/John",
      bookCoverUrl: null,
      chapterNumber: week,
      orderIndex: (week - 1) * 2 + 1
    });
  });

  // ============================================
  // COURSE 3: DON'T BE A JONAH (11 weeks, 22 readings)
  // ============================================
  console.log('📖 Course 3: Don\'t Be a Jonah (22 readings)');
  
  const jonahChapters = [
    { week: 1, chapter: 1, bible: "1 Timothy 1", bibleDesc: "Paul's greeting and charge to Timothy" },
    { week: 2, chapter: 2, bible: "1 Timothy 2", bibleDesc: "Instructions for worship and prayer" },
    { week: 3, chapter: 3, bible: "1 Timothy 3", bibleDesc: "Qualifications for leaders" },
    { week: 4, chapter: 4, bible: "1 Timothy 4", bibleDesc: "Warnings against false teachers" },
    { week: 5, chapter: 5, bible: "1 Timothy 5", bibleDesc: "Instructions for various groups" },
    { week: 6, chapter: 6, bible: "1 Timothy 6", bibleDesc: "Final instructions and warnings" },
    { week: 7, chapter: 7, bible: "2 Timothy 1", bibleDesc: "Paul's encouragement to Timothy" },
    { week: 8, chapter: 8, bible: "2 Timothy 2", bibleDesc: "A good soldier of Christ" },
    { week: 9, chapter: 9, bible: "2 Timothy 3", bibleDesc: "The last days" },
    { week: 10, chapter: 10, bible: "2 Timothy 4", bibleDesc: "Paul's final charge" },
    { week: 11, chapter: 11, bible: "Titus 1-3", bibleDesc: "Paul's letter to Titus" }
  ];

  jonahChapters.forEach(({ week, chapter, bible, bibleDesc }) => {
    // Week 1: 201 (chapter), 202 (bible)
    // Week 2: 203 (chapter), 204 (bible)
    // Week 3: 205 (chapter), 206 (bible), etc.
    const chapterId = 200 + (week - 1) * 2 + 1;
    const bibleId = 200 + (week - 1) * 2 + 2;
    
    // Textbook chapter
    allReadings.push({
      id: chapterId,
      courseId: 3,
      title: `Week ${week}: Don't Be a Jonah Chapter ${chapter}`,
      description: `Chapter ${chapter}: ${getJonahChapterTitle(chapter)}`,
      readingType: 'textbook',
      content: `Chapter ${chapter} content - available in dont-be-a-jonah-complete-book.tsx`,
      bookTitle: "Don't Be a Jonah",
      bookAuthor: "Anthony Lee",
      bookCoverUrl: null,
      chapterNumber: chapter,
      orderIndex: (week - 1) * 2
    });

    // Bible reading
    allReadings.push({
      id: bibleId,
      courseId: 3,
      title: `Week ${week}: ${bible}`,
      description: bibleDesc,
      readingType: 'bible_chapter',
      content: `${bibleDesc}\n\nRead online: https://www.biblegateway.com/passage/?search=${encodeURIComponent(bible)}&version=NLT`,
      bookTitle: bible.includes('Timothy') ? (bible.includes('1') ? "1 Timothy" : "2 Timothy") : "Titus",
      bookAuthor: "Paul",
      bookCoverUrl: null,
      chapterNumber: week,
      orderIndex: (week - 1) * 2 + 1
    });
  });

  // ============================================
  // COURSE 4: G.R.O.W (4 weeks, 4 readings)
  // ============================================
  console.log('📖 Course 4: G.R.O.W (4 readings)');
  
  const growChapters = [
    { week: 1, chapter: 1, title: "Give - Time, Talents, Treasure" },
    { week: 2, chapter: 2, title: "Read - Feed Daily on God's Word" },
    { week: 3, chapter: 3, title: "Obey - Listen and Apply God's Word" },
    { week: 4, chapter: 4, title: "Win - Go, Witness, Make Disciples" }
  ];

  growChapters.forEach(({ week, chapter, title }) => {
    allReadings.push({
      id: 300 + week,
      courseId: 4,
      title: `Week ${week}: G.R.O.W Chapter ${chapter} - ${title}`,
      description: title,
      readingType: 'textbook',
      content: `Chapter ${chapter} content - available in grow-complete-ebook.tsx`,
      bookTitle: "G.R.O.W",
      bookAuthor: null,
      bookCoverUrl: null,
      chapterNumber: chapter,
      orderIndex: week - 1
    });
  });

  // ============================================
  // COURSE 5: STUDYING FOR SERVICE (12 weeks, 24 readings)
  // ============================================
  console.log('📖 Course 5: Studying for Service (24 readings)');
  
  const studyingChapters = [
    { week: 1, chapter: 1, bible: "Matthew 1-4", bibleDesc: "The birth and early ministry of Jesus" },
    { week: 2, chapter: 2, bible: "Matthew 5-8", bibleDesc: "The Sermon on the Mount" },
    { week: 3, chapter: 3, bible: "Matthew 9-12", bibleDesc: "Jesus' miracles and teachings" },
    { week: 4, chapter: 4, bible: "Matthew 13-16", bibleDesc: "Parables and Peter's confession" },
    { week: 5, chapter: 5, bible: "Matthew 17-20", bibleDesc: "The transfiguration and teachings" },
    { week: 6, chapter: 6, bible: "Matthew 21-24", bibleDesc: "Jesus enters Jerusalem" },
    { week: 7, chapter: 7, bible: "Matthew 25-28", bibleDesc: "The passion and resurrection" },
    { week: 8, chapter: 8, bible: "Mark 1-4", bibleDesc: "The beginning of the Gospel" },
    { week: 9, chapter: 9, bible: "Mark 5-6", bibleDesc: "Miracles and teachings" },
    { week: 10, chapter: 10, bible: "Mark 7-8", bibleDesc: "Jesus feeds the multitudes" },
    { week: 11, chapter: 11, bible: "Mark 9-11", bibleDesc: "The transfiguration and entry into Jerusalem" },
    { week: 12, chapter: 12, bible: "Mark 12-16", bibleDesc: "The passion and resurrection" }
  ];

  studyingChapters.forEach(({ week, chapter, bible, bibleDesc }) => {
    // Week 1: 401 (chapter), 402 (bible)
    // Week 2: 403 (chapter), 404 (bible)
    // Week 3: 405 (chapter), 406 (bible), etc.
    const chapterId = 400 + (week - 1) * 2 + 1;
    const bibleId = 400 + (week - 1) * 2 + 2;
    
    // Textbook chapter
    allReadings.push({
      id: chapterId,
      courseId: 5,
      title: `Week ${week}: Studying for Service Chapter ${chapter}`,
      description: `Chapter ${chapter}: ${getStudyingChapterTitle(chapter)}`,
      readingType: 'textbook',
      content: `Chapter ${chapter} content - available in studying-for-service-complete-ebook.tsx`,
      bookTitle: "Studying for Service",
      bookAuthor: null,
      bookCoverUrl: null,
      chapterNumber: chapter,
      orderIndex: (week - 1) * 2
    });

    // Bible reading
    allReadings.push({
      id: bibleId,
      courseId: 5,
      title: `Week ${week}: ${bible}`,
      description: bibleDesc,
      readingType: 'bible_chapter',
      content: `${bibleDesc}\n\nRead online: https://www.biblegateway.com/passage/?search=${encodeURIComponent(bible)}&version=NLT`,
      bookTitle: bible.includes('Matthew') ? "Gospel of Matthew" : "Gospel of Mark",
      bookAuthor: "Matthew/Mark",
      bookCoverUrl: null,
      chapterNumber: week,
      orderIndex: (week - 1) * 2 + 1
    });
  });

  // ============================================
  // COURSE 6: DEACON COURSE (5 weeks, 5 readings)
  // ============================================
  console.log('📖 Course 6: Deacon Course (5 readings)');
  
  const deaconChapters = [
    { week: 1, chapter: 1, title: "The Unignorable Nudge" },
    { week: 2, chapter: 2, title: "Laying the Foundation" },
    { week: 3, chapter: 3, title: "The Servant in Motion" },
    { week: 4, chapter: 4, title: "The Spiritual Battlefield" },
    { week: 5, chapter: 5, title: "Commissioned for Impact" }
  ];

  deaconChapters.forEach(({ week, chapter, title }) => {
    allReadings.push({
      id: 500 + week,
      courseId: 6,
      title: `Week ${week}: Deacon Course Chapter ${chapter} - ${title}`,
      description: title,
      readingType: 'textbook',
      content: `Chapter ${chapter} content - available in deacon-course-complete-ebook.tsx`,
      bookTitle: "Deaconship Course",
      bookAuthor: null,
      bookCoverUrl: null,
      chapterNumber: chapter,
      orderIndex: week - 1
    });
  });

  // ============================================
  // COURSE 7: LEVEL UP LEADERSHIP (6 weeks, 6 readings)
  // ============================================
  console.log('📖 Course 7: Level Up Leadership (6 readings)');
  
  const leadershipChapters = [
    { week: 1, chapter: 1, title: "Position Leadership", pages: "Pages 1-81" },
    { week: 2, chapter: 2, title: "Permission Leadership", pages: "Pages 85-129" },
    { week: 3, chapter: 3, title: "Production Leadership", pages: "Pages 133-178" },
    { week: 4, chapter: 4, title: "People Development Leadership", pages: "Pages 181-228" },
    { week: 5, chapter: 5, title: "Pinnacle Leadership", pages: "Pages 229-286" },
    { week: 6, chapter: 6, title: "Integration & Application", pages: "" }
  ];

  leadershipChapters.forEach(({ week, chapter, title, pages }) => {
    allReadings.push({
      id: 600 + week,
      courseId: 7,
      title: `Week ${week}: Level Up Leadership - ${title}`,
      description: `${title} ${pages}`,
      readingType: 'textbook',
      content: `${title} content - ${pages}`,
      bookTitle: "The 5 Levels of Leadership",
      bookAuthor: "John Maxwell",
      bookCoverUrl: null,
      chapterNumber: chapter,
      orderIndex: week - 1
    });
  });

  // ============================================
  // COURSE 8: YOUTH MINISTRY (5 weeks, 5 readings)
  // ============================================
  console.log('📖 Course 8: Youth Ministry (5 readings)');
  
  const youthChapters = [
    { week: 1, chapter: 1, title: "The Calling" },
    { week: 2, chapter: 2, title: "Requirements" },
    { week: 3, chapter: 3, title: "Responsibilities" },
    { week: 4, chapter: 4, title: "Accountability" },
    { week: 5, chapter: 5, title: "Making New Disciples" }
  ];

  youthChapters.forEach(({ week, chapter, title }) => {
    allReadings.push({
      id: 700 + week,
      courseId: 8,
      title: `Week ${week}: Youth Ministry Chapter ${chapter} - ${title}`,
      description: title,
      readingType: 'textbook',
      content: `Chapter ${chapter} content - available in youth-ministry-complete-ebook.tsx`,
      bookTitle: "Answering the Call",
      bookAuthor: null,
      bookCoverUrl: null,
      chapterNumber: chapter,
      orderIndex: week - 1
    });
  });

  return allReadings;
}

async function addAllReadings() {
  console.log('🚀 Adding all course readings to database...\n');
  
  const allReadings = await generateAllReadings();
  
  // ============================================
  // INSERT ALL READINGS INTO DATABASE
  // ============================================
  console.log(`\n📝 Inserting ${allReadings.length} readings into database...\n`);

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const reading of allReadings) {
    try {
      // Check if reading already exists
      const existing = await db.select()
        .from(courseReadings)
        .where(eq(courseReadings.id, reading.id))
        .limit(1);

      if (existing.length > 0) {
        // Update existing reading
        await db.update(courseReadings)
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
            updatedAt: new Date()
          })
          .where(eq(courseReadings.id, reading.id));
        
        skipped++;
        if (skipped % 10 === 0) {
          console.log(`  ⚠️  Updated ${skipped} existing readings...`);
        }
      } else {
        // Insert new reading
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
        if (inserted % 10 === 0) {
          console.log(`  ✅ Inserted ${inserted} readings...`);
        }
      }
    } catch (error: any) {
      errors++;
      console.error(`  ❌ Error with reading ID ${reading.id} (${reading.title}):`, error.message);
    }
  }

  console.log(`\n✅ Complete!`);
  console.log(`   📊 Inserted: ${inserted}`);
  console.log(`   🔄 Updated: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📚 Total: ${allReadings.length} readings\n`);
}

// Helper functions for chapter titles
function getFireStarterChapterTitle(chapter: number): string {
  const titles: Record<number, string> = {
    1: "When God Answers with Fire",
    2: "It's Fire or Nothing!",
    3: "Fuel for the Fire",
    4: "Keep Your Eyes on the Fire",
    5: "Tested by Fire",
    6: "The Consuming Fire",
    7: "Fasting for Fire",
    8: "Fellowship of Fire",
    9: "Fan the Fire",
    10: "Conclusion"
  };
  return titles[chapter] || `Chapter ${chapter}`;
}

function getJonahChapterTitle(chapter: number): string {
  const titles: Record<number, string> = {
    1: "Fighting Against God",
    2: "The Bitter Root",
    3: "Deep Depression",
    4: "The Isolation Trap",
    5: "Unnecessary Storms",
    6: "Hell No, Let's Go",
    7: "God of Second Chances",
    8: "Your Mess is a Message",
    9: "Signs of Jonah",
    10: "Where is Your Nineveh?",
    11: "Leaving a Legacy"
  };
  return titles[chapter] || `Chapter ${chapter}`;
}

function getStudyingChapterTitle(chapter: number): string {
  const titles: Record<number, string> = {
    1: "Know Your Text",
    2: "Notice the Names",
    3: "Look at the Places",
    4: "The Numbers Game",
    5: "Dig Deeper (Greek and Hebrew)",
    6: "Pictures and Parables",
    7: "Illustrations",
    8: "Application",
    9: "How to Make a Sermon",
    10: "Balance",
    11: "Personal Testimony",
    12: "Conclusion"
  };
  return titles[chapter] || `Chapter ${chapter}`;
}

// Run the script if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addAllReadings()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { addAllReadings, generateAllReadings };

