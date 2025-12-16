import { db } from './server/db';
import { quizzes, quizQuestions } from './shared/schema';

async function addYouthMinistryWeek1Quiz() {
  try {
    console.log('Creating Youth Ministry Week 1 Quiz...');
    
    // Create the quiz entry
    const [quiz] = await db.insert(quizzes).values({
      id: 207, // Starting from 207 for Youth Ministry
      moduleId: null,
      title: 'Youth Ministry — Week 1 Quiz',
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
        quizId: 207, 
        question: 'Which response best captures Samuel\'s posture when first hearing God\'s call?', 
        type: 'multiple_choice' as const, 
        options: [
          'A) A listening servant ready to obey', 
          'B) A strategic planner mapping programs', 
          'C) A recruiter assembling a team', 
          'D) A skeptic demanding a sign'
        ], 
        correctAnswer: 'A) A listening servant ready to obey', 
        points: 1, 
        orderIndex: 1 
      },
      { 
        quizId: 207, 
        question: 'In David\'s anointing narrative (1 Samuel 16), what primary criterion does God emphasize?', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Physical strength', 
          'B) The heart', 
          'C) Family status', 
          'D) Public reputation'
        ], 
        correctAnswer: 'B) The heart', 
        points: 1, 
        orderIndex: 2 
      },
      { 
        quizId: 207, 
        question: 'Which pairing best represents the two dimensions of a ministry calling?', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Personality and platform', 
          'B) Strategy and systems', 
          'C) Internal conviction and external affirmation', 
          'D) Events and experiences'
        ], 
        correctAnswer: 'C) Internal conviction and external affirmation', 
        points: 1, 
        orderIndex: 3 
      },
      { 
        quizId: 207, 
        question: 'According to Tony Evans, the authority of preaching rests mainly in:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) The speaker\'s creativity', 
          'B) Audience enthusiasm', 
          'C) Cultural trends', 
          'D) God\'s Word empowered by the Spirit'
        ], 
        correctAnswer: 'D) God\'s Word empowered by the Spirit', 
        points: 1, 
        orderIndex: 4 
      },
      { 
        quizId: 207, 
        question: 'Maxwell\'s Law of the Process teaches that leadership development occurs:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Daily over time', 
          'B) Only during crises', 
          'C) After ordination', 
          'D) Automatically with age'
        ], 
        correctAnswer: 'A) Daily over time', 
        points: 1, 
        orderIndex: 5 
      },
      { 
        quizId: 207, 
        question: 'Timothy was instructed not to let anyone despise him for his youth but to:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Focus on innovation', 
          'B) Set an example in speech, conduct, love, faith, and purity', 
          'C) Change churches frequently', 
          'D) Avoid difficult topics'
        ], 
        correctAnswer: 'B) Set an example in speech, conduct, love, faith, and purity', 
        points: 1, 
        orderIndex: 6 
      },
      { 
        quizId: 207, 
        question: 'Which practice most helps test the authenticity of a perceived call?', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Posting about it online', 
          'B) Waiting for a title', 
          'C) Serving consistently and evaluating fruit over time', 
          'D) Buying more ministry books'
        ], 
        correctAnswer: 'C) Serving consistently and evaluating fruit over time', 
        points: 1, 
        orderIndex: 7 
      },
      { 
        quizId: 207, 
        question: 'In The Awe of God, cultivating the fear of the Lord primarily leads to:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Seeking applause', 
          'B) Avoiding hard work', 
          'C) Pursuing novelty', 
          'D) Purified motives and obedient living'
        ], 
        correctAnswer: 'D) Purified motives and obedient living', 
        points: 1, 
        orderIndex: 8 
      },
      { 
        quizId: 207, 
        question: 'Which biblical example illustrates learning to recognize God\'s voice with a mentor\'s help?', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Samuel guided by Eli', 
          'B) Moses guided by Jethro\'s daughter', 
          'C) Elijah guided by Elisha', 
          'D) Peter guided by Barnabas'
        ], 
        correctAnswer: 'A) Samuel guided by Eli', 
        points: 1, 
        orderIndex: 9 
      },
      { 
        quizId: 207, 
        question: 'In Maxwell\'s Five Levels of Leadership, Level 2 (Permission) is gained chiefly through:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Titles and position', 
          'B) Relationships and trust', 
          'C) Incentives and rewards', 
          'D) Policies and procedures'
        ], 
        correctAnswer: 'B) Relationships and trust', 
        points: 1, 
        orderIndex: 10 
      },
      { 
        quizId: 207, 
        question: 'Which is the healthiest first identity for an emerging youth minister?', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Influencer', 
          'B) Program director', 
          'C) Adopted child of God and obedient servant', 
          'D) Event planner'
        ], 
        correctAnswer: 'C) Adopted child of God and obedient servant', 
        points: 1, 
        orderIndex: 11 
      },
      { 
        quizId: 207, 
        question: 'A common pitfall for the called is:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Seeking feedback from mentors', 
          'B) Starting small and serving', 
          'C) Chasing a platform over people', 
          'D) Reading Scripture in context'
        ], 
        correctAnswer: 'C) Chasing a platform over people', 
        points: 1, 
        orderIndex: 12 
      },
      { 
        quizId: 207, 
        question: 'Which young leader was anointed while tending sheep?', 
        type: 'multiple_choice' as const, 
        options: [
          'A) David', 
          'B) Samuel', 
          'C) Timothy', 
          'D) Josiah'
        ], 
        correctAnswer: 'A) David', 
        points: 1, 
        orderIndex: 13 
      },
      { 
        quizId: 207, 
        question: 'Which external sign most reliably confirms a ministry call?', 
        type: 'multiple_choice' as const, 
        options: [
          'A) A viral post', 
          'B) Pastoral affirmation and observed fruit over time', 
          'C) A personal sense of excitement', 
          'D) Attendance at a conference'
        ], 
        correctAnswer: 'B) Pastoral affirmation and observed fruit over time', 
        points: 1, 
        orderIndex: 14 
      },
      { 
        quizId: 207, 
        question: 'Which pair best describes the preacher\'s core aim in youth ministry?', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Entertainment and applause', 
          'B) Innovation and novelty', 
          'C) Faithful exposition and life transformation', 
          'D) Fast growth and visibility'
        ], 
        correctAnswer: 'C) Faithful exposition and life transformation', 
        points: 1, 
        orderIndex: 15 
      },
      { 
        quizId: 207, 
        question: 'What habit best forms a posture like Samuel\'s?', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Constant multitasking', 
          'B) Avoiding accountability', 
          'C) Overcommitting to events', 
          'D) Regular listening prayer and Scripture meditation'
        ], 
        correctAnswer: 'D) Regular listening prayer and Scripture meditation', 
        points: 1, 
        orderIndex: 16 
      },
      { 
        quizId: 207, 
        question: 'Which Maxwell principle warns that your leadership ability sets the ceiling on your impact?', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Law of the Lid', 
          'B) Law of Navigation', 
          'C) Law of Victory', 
          'D) Law of Explosive Growth'
        ], 
        correctAnswer: 'A) Law of the Lid', 
        points: 1, 
        orderIndex: 17 
      },
      { 
        quizId: 207, 
        question: 'In Timothy\'s development, which relational dynamic was crucial?', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Competition with peers', 
          'B) Mentorship under Paul', 
          'C) Isolation and independence', 
          'D) Anonymous feedback'
        ], 
        correctAnswer: 'B) Mentorship under Paul', 
        points: 1, 
        orderIndex: 18 
      },
      { 
        quizId: 207, 
        question: 'Which step is most helpful for early discernment of calling?', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Securing a job title', 
          'B) Designing a logo', 
          'C) Meeting with a pastor for honest feedback', 
          'D) Focusing on social media presence'
        ], 
        correctAnswer: 'C) Meeting with a pastor for honest feedback', 
        points: 1, 
        orderIndex: 19 
      },
      { 
        quizId: 207, 
        question: 'The hidden years in David\'s life teach aspiring youth ministers to:', 
        type: 'multiple_choice' as const, 
        options: [
          'A) Avoid difficult tasks', 
          'B) Demand immediate authority', 
          'C) Trust human approval above all', 
          'D) Embrace preparation and faithfulness in obscurity'
        ], 
        correctAnswer: 'D) Embrace preparation and faithfulness in obscurity', 
        points: 1, 
        orderIndex: 20 
      }
    ];
    
    await db.insert(quizQuestions).values(questions);
    
    console.log(`Successfully created Youth Ministry Week 1 Quiz with ${questions.length} questions!`);
    console.log(`Quiz ID: ${quiz.id}`);
    console.log(`Access at: http://localhost:56000/quiz/youth-ministry-week-1`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating Youth Ministry Week 1 Quiz:', error);
    process.exit(1);
  }
}

addYouthMinistryWeek1Quiz();
