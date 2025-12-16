import { db } from './server/db';
import { quizzes, quizQuestions } from './shared/schema';

async function addYouthMinistryWeek2Quiz() {
  try {
    console.log('Creating Youth Ministry Week 2 Quiz...');
    
    // Create the quiz entry
    const [quiz] = await db.insert(quizzes).values({
      id: 208, // Week 2
      moduleId: null,
      title: 'Youth Ministry — Week 2 Quiz',
      timeLimit: 15, // 15 minutes for weekly quiz
      passingScore: 70,
      isFinalExam: false,
      isPublished: true,
      publishedAt: new Date(),
    }).returning();
    
    console.log('Quiz created:', quiz);
    
    // Create quiz questions
    const questions = [
      { 
        quizId: 208, 
        question: 'The first requirement of spiritual leadership emphasizes:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Character before competency', 
          'B) Charisma before content', 
          'C) Events before relationships', 
          'D) Innovation before integrity'
        ], 
        correctAnswer: 'A) Character before competency', 
        points: 1, 
        orderIndex: 1 
      },
      { 
        quizId: 208, 
        question: 'According to Maxwell\'s Five Levels, early influence in youth ministry is primarily built on:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Position', 
          'B) Permission through trust', 
          'C) Production only', 
          'D) Pinnacle reputation'
        ], 
        correctAnswer: 'B) Permission through trust', 
        points: 1, 
        orderIndex: 2 
      },
      { 
        quizId: 208, 
        question: 'The most essential ministry strategy Jesus gives in John 15 is to:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Build the biggest program', 
          'B) Master social media', 
          'C) Abide in Him', 
          'D) Focus on attendance first'
        ], 
        correctAnswer: 'C) Abide in Him', 
        points: 1, 
        orderIndex: 3 
      },
      { 
        quizId: 208, 
        question: 'The "two-adult rule" primarily serves to:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Save time', 
          'B) Reduce paperwork', 
          'C) Protect students, leaders, and the church', 
          'D) Increase event momentum'
        ], 
        correctAnswer: 'C) Protect students, leaders, and the church', 
        points: 1, 
        orderIndex: 4 
      },
      { 
        quizId: 208, 
        question: 'Tony Evans emphasizes that preaching authority comes from:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Personality and performance', 
          'B) Cultural relevance alone', 
          'C) God\'s Word empowered by the Spirit', 
          'D) Technology and media'
        ], 
        correctAnswer: 'C) God\'s Word empowered by the Spirit', 
        points: 1, 
        orderIndex: 5 
      },
      { 
        quizId: 208, 
        question: 'Which practice best sustains long-term ministry health?', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Skipping rest during busy seasons', 
          'B) Establishing a rule of life with Scripture, prayer, Sabbath, and community', 
          'C) Avoiding feedback to stay confident', 
          'D) Adding more events when tired'
        ], 
        correctAnswer: 'B) Establishing a rule of life with Scripture, prayer, Sabbath, and community', 
        points: 1, 
        orderIndex: 6 
      },
      { 
        quizId: 208, 
        question: 'A key implication of Maxwell\'s Law of the Lid is that leaders should:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Delegate everything immediately', 
          'B) Focus only on numbers', 
          'C) Intentionally grow character and capacity to raise their impact', 
          'D) Avoid change to keep stability'
        ], 
        correctAnswer: 'C) Intentionally grow character and capacity to raise their impact', 
        points: 1, 
        orderIndex: 7 
      },
      { 
        quizId: 208, 
        question: 'The most trustworthy way to confirm moral integrity is:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Self-evaluation alone', 
          'B) Public compliments', 
          'C) Private aspirations', 
          'D) Transparent accountability and consistent habits over time'
        ], 
        correctAnswer: 'D) Transparent accountability and consistent habits over time', 
        points: 1, 
        orderIndex: 8 
      },
      { 
        quizId: 208, 
        question: 'A text-driven youth sermon means:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Starting with stories and adding a verse at the end', 
          'B) Choosing the most exciting topic weekly', 
          'C) Letting the passage\'s main point drive the message\'s main point', 
          'D) Avoiding application to stay "deep"'
        ], 
        correctAnswer: 'C) Letting the passage\'s main point drive the message\'s main point', 
        points: 1, 
        orderIndex: 9 
      },
      { 
        quizId: 208, 
        question: 'In partnering with parents, a wise first step is to:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Replace them as primary disciple-makers', 
          'B) Compete for authority', 
          'C) Communicate clearly, invite feedback, and resource home discipleship', 
          'D) Avoid contact to stay independent'
        ], 
        correctAnswer: 'C) Communicate clearly, invite feedback, and resource home discipleship', 
        points: 1, 
        orderIndex: 10 
      },
      { 
        quizId: 208, 
        question: 'Emotional resilience in ministry is best strengthened by:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Ignoring feelings to appear strong', 
          'B) Shaming yourself into working harder', 
          'C) Naming stress, seeking support, resting, and practicing healthy rhythms', 
          'D) Taking fewer vacations but longer hours'
        ], 
        correctAnswer: 'C) Naming stress, seeking support, resting, and practicing healthy rhythms', 
        points: 1, 
        orderIndex: 11 
      },
      { 
        quizId: 208, 
        question: 'A safety plan should include at minimum:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Event themes and games', 
          'B) Stage lighting cues', 
          'C) Two-adult rule, communication boundaries, transportation and reporting procedures', 
          'D) Graphic design templates'
        ], 
        correctAnswer: 'C) Two-adult rule, communication boundaries, transportation and reporting procedures', 
        points: 1, 
        orderIndex: 12 
      },
      { 
        quizId: 208, 
        question: 'A practical sign you value integrity with money is:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Relying on memory for expenses', 
          'B) Keeping receipts and following church-approved processes', 
          'C) Using cash for everything without records', 
          'D) Avoiding a budget'
        ], 
        correctAnswer: 'B) Keeping receipts and following church-approved processes', 
        points: 1, 
        orderIndex: 13 
      },
      { 
        quizId: 208, 
        question: 'The Law of Priorities reminds leaders to:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Say yes to all opportunities', 
          'B) Focus on activity, not accomplishment', 
          'C) Put first things first—prayer, people, preparation', 
          'D) Let urgency determine schedule'
        ], 
        correctAnswer: 'C) Put first things first—prayer, people, preparation', 
        points: 1, 
        orderIndex: 14 
      },
      { 
        quizId: 208, 
        question: 'Relational credibility with students grows primarily through:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Clever branding and giveaways', 
          'B) Sporadic, intense events', 
          'C) Consistent presence, empathy, and keeping your word', 
          'D) Frequent rule changes'
        ], 
        correctAnswer: 'C) Consistent presence, empathy, and keeping your word', 
        points: 1, 
        orderIndex: 15 
      },
      { 
        quizId: 208, 
        question: 'When preparing to preach, a simple and faithful pattern is:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Entertain, impress, dismiss', 
          'B) Brainstorm, poll, improvise', 
          'C) Quote many sources, avoid the text', 
          'D) Pray the text, explain the text, illustrate, apply'
        ], 
        correctAnswer: 'D) Pray the text, explain the text, illustrate, apply', 
        points: 1, 
        orderIndex: 16 
      },
      { 
        quizId: 208, 
        question: 'Healthy boundaries in student conversations are best summarized as:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Private and uninterruptible', 
          'B) Casual and undocumented', 
          'C) Observable and interruptible with clear guidelines', 
          'D) Digital only to stay modern'
        ], 
        correctAnswer: 'C) Observable and interruptible with clear guidelines', 
        points: 1, 
        orderIndex: 17 
      },
      { 
        quizId: 208, 
        question: 'A core aspect of building a volunteer team is to:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Recruit anyone quickly to fill gaps', 
          'B) Do everything yourself to ensure quality', 
          'C) Share vision, define roles, and provide a simple onboarding process', 
          'D) Avoid training to keep it organic'
        ], 
        correctAnswer: 'C) Share vision, define roles, and provide a simple onboarding process', 
        points: 1, 
        orderIndex: 18 
      },
      { 
        quizId: 208, 
        question: 'A youth minister aligned with the church will:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Run an independent calendar and mission', 
          'B) Ignore senior leadership to move faster', 
          'C) Coordinate vision, teaching, and communication with church leaders', 
          'D) Compete for resources publicly'
        ], 
        correctAnswer: 'C) Coordinate vision, teaching, and communication with church leaders', 
        points: 1, 
        orderIndex: 19 
      },
      { 
        quizId: 208, 
        question: 'One wise response when you notice a personal weakness affecting ministry is to:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Hide it to protect your image', 
          'B) Blame circumstances', 
          'C) Invite accountability, seek training, and make a growth plan', 
          'D) Quit immediately'
        ], 
        correctAnswer: 'C) Invite accountability, seek training, and make a growth plan', 
        points: 1, 
        orderIndex: 20 
      }
    ];
    
    await db.insert(quizQuestions).values(questions);
    
    console.log(`Successfully created Youth Ministry Week 2 Quiz with ${questions.length} questions!`);
    console.log(`Quiz ID: ${quiz.id}`);
    console.log(`Access at: http://localhost:56000/quiz/youth-ministry-week-2`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating Youth Ministry Week 2 Quiz:', error);
    process.exit(1);
  }
}

addYouthMinistryWeek2Quiz();
