import { db } from './server/db';
import { quizzes, quizQuestions } from './shared/schema';

async function addYouthMinistryWeek3Quiz() {
  try {
    console.log('Creating Youth Ministry Week 3 Quiz...');
    
    const [quiz] = await db.insert(quizzes).values({
      id: 209,
      moduleId: null,
      title: 'Youth Ministry — Week 3 Quiz',
      timeLimit: 15,
      passingScore: 70,
      isFinalExam: false,
      isPublished: true,
      publishedAt: new Date(),
    }).returning();
    
    const questions = [
      { quizId: 209, question: 'The Law of Priorities reminds youth ministers to focus on:', type: 'multiple_choice' as const, options: ['A) Doing first things first rather than equating activity with accomplishment', 'B) Building the largest possible calendar', 'C) Copying other ministries\' events', 'D) Avoiding delegation to ensure quality'], correctAnswer: 'A) Doing first things first rather than equating activity with accomplishment', points: 1, orderIndex: 1 },
      { quizId: 209, question: 'A text-driven student sermon primarily:', type: 'multiple_choice' as const, options: ['A) Starts with stories and adds a verse at the end', 'B) Lets the passage\'s main point drive the message\'s main point', 'C) Focuses on entertainment value', 'D) Avoids application to stay "deep"'], correctAnswer: 'B) Lets the passage\'s main point drive the message\'s main point', points: 1, orderIndex: 2 },
      { quizId: 209, question: 'The most important early influence with students (Maxwell\'s Five Levels) is built at:', type: 'multiple_choice' as const, options: ['A) Level 1: Position', 'B) Level 3: Production', 'C) Level 2: Permission—trust and relationship', 'D) Level 5: Pinnacle'], correctAnswer: 'C) Level 2: Permission—trust and relationship', points: 1, orderIndex: 3 },
      { quizId: 209, question: 'A healthy small group leader is first trained to:', type: 'multiple_choice' as const, options: ['A) Run games flawlessly', 'B) Manage budgets', 'C) Design logos', 'D) Listen well and ask wise questions'], correctAnswer: 'D) Listen well and ask wise questions', points: 1, orderIndex: 4 },
      { quizId: 209, question: 'A simple follow-up best practice for first-time students is to contact them within:', type: 'multiple_choice' as const, options: ['A) 48 hours with a warm welcome and a next step', 'B) Two weeks with a general newsletter', 'C) Six weeks with a survey', 'D) Only if they return three times'], correctAnswer: 'A) 48 hours with a warm welcome and a next step', points: 1, orderIndex: 5 },
      { quizId: 209, question: 'In preaching to students, Tony Evans would most emphasize:', type: 'multiple_choice' as const, options: ['A) Personality and performance', 'B) The authority of God\'s Word empowered by the Spirit', 'C) Pop culture references as the main point', 'D) Keeping sermons under five minutes'], correctAnswer: 'B) The authority of God\'s Word empowered by the Spirit', points: 1, orderIndex: 6 },
      { quizId: 209, question: 'Volunteer development moves beyond task delegation when leaders:', type: 'multiple_choice' as const, options: ['A) Are told exactly what to do every time', 'B) Are kept at Level 1: Position', 'C) Are equipped, coached, and entrusted with ownership', 'D) Are rotated out quickly'], correctAnswer: 'C) Are equipped, coached, and entrusted with ownership', points: 1, orderIndex: 7 },
      { quizId: 209, question: 'Partnering with parents is best described as:', type: 'multiple_choice' as const, options: ['A) Replacing them as primary disciple-makers', 'B) Competing for influence', 'C) Keeping them uninformed to avoid interference', 'D) Communicating clearly and resourcing faith conversations at home'], correctAnswer: 'D) Communicating clearly and resourcing faith conversations at home', points: 1, orderIndex: 8 },
      { quizId: 209, question: 'A wise administrative question for budgeting is:', type: 'multiple_choice' as const, options: ['A) What is the trendiest purchase?', 'B) What will impress other churches?', 'C) Does this spending help make disciples?', 'D) How can we spend as fast as possible?'], correctAnswer: 'C) Does this spending help make disciples?', points: 1, orderIndex: 9 },
      { quizId: 209, question: 'A small group pathway should prioritize:', type: 'multiple_choice' as const, options: ['A) Constantly changing leaders', 'B) Scripture engagement and real-life application in a safe environment', 'C) Lecture-style teaching only', 'D) Unstructured hangouts every week'], correctAnswer: 'B) Scripture engagement and real-life application in a safe environment', points: 1, orderIndex: 10 },
      { quizId: 209, question: 'A pastoral response in student crisis begins with:', type: 'multiple_choice' as const, options: ['A) Lecturing them immediately', 'B) Posting about it for prayer online', 'C) Listening, praying, involving parents/pastors appropriately', 'D) Promising confidentiality in all cases'], correctAnswer: 'C) Listening, praying, involving parents/pastors appropriately', points: 1, orderIndex: 11 },
      { quizId: 209, question: 'Measuring what matters in youth ministry means tracking:', type: 'multiple_choice' as const, options: ['A) Only total attendance', 'B) Leader retention, follow-up touches, group engagement, next steps', 'C) Number of games played', 'D) Amount of merchandise sold'], correctAnswer: 'B) Leader retention, follow-up touches, group engagement, next steps', points: 1, orderIndex: 12 },
      { quizId: 209, question: 'A sustainable weekly rhythm protects:', type: 'multiple_choice' as const, options: ['A) Only admin time', 'B) Only event time', 'C) Time with God, people, team, admin, and rest', 'D) Only last-minute preparation'], correctAnswer: 'C) Time with God, people, team, admin, and rest', points: 1, orderIndex: 13 },
      { quizId: 209, question: 'An effective parent update typically includes:', type: 'multiple_choice' as const, options: ['A) Doctrinal position papers only', 'B) The teaching plan, key dates, and a conversation guide', 'C) Volunteer schedules only', 'D) Photos from past events only'], correctAnswer: 'B) The teaching plan, key dates, and a conversation guide', points: 1, orderIndex: 14 },
      { quizId: 209, question: 'The shift from doer to developer is marked by:', type: 'multiple_choice' as const, options: ['A) Doing the most visible tasks yourself', 'B) Recruiting quickly to fill gaps', 'C) Training, empowering, and celebrating volunteers who own ministry areas', 'D) Avoiding feedback to stay positive'], correctAnswer: 'C) Training, empowering, and celebrating volunteers who own ministry areas', points: 1, orderIndex: 15 },
      { quizId: 209, question: 'An invite culture among students emphasizes:', type: 'multiple_choice' as const, options: ['A) Pressure tactics', 'B) Praying for friends, investing in relationships, and inviting to next steps', 'C) Public debates', 'D) Large giveaways only'], correctAnswer: 'B) Praying for friends, investing in relationships, and inviting to next steps', points: 1, orderIndex: 16 },
      { quizId: 209, question: 'The purpose of clear safety systems (check-in, two-adult rule, reporting) is to:', type: 'multiple_choice' as const, options: ['A) Slow ministry momentum', 'B) Impress insurance providers', 'C) Protect students, leaders, and the church while enabling ministry', 'D) Replace pastoral care'], correctAnswer: 'C) Protect students, leaders, and the church while enabling ministry', points: 1, orderIndex: 17 },
      { quizId: 209, question: 'A helpful small group resource for leaders each week is:', type: 'multiple_choice' as const, options: ['A) A long theological treatise', 'B) A concise guide with big idea, 3–5 questions, and two follow-ups', 'C) Only a video link', 'D) No guide—let it be spontaneous'], correctAnswer: 'B) A concise guide with big idea, 3–5 questions, and two follow-ups', points: 1, orderIndex: 18 },
      { quizId: 209, question: 'The heart behind administrative order in ministry is to:', type: 'multiple_choice' as const, options: ['A) Control people', 'B) Maximize personal convenience', 'C) Free leaders to love people well by reducing confusion', 'D) Showcase excellence over empathy'], correctAnswer: 'C) Free leaders to love people well by reducing confusion', points: 1, orderIndex: 19 },
      { quizId: 209, question: 'A wise sermon preparation rhythm begins with:', type: 'multiple_choice' as const, options: ['A) Browsing illustration websites first', 'B) Checking social media trends', 'C) Praying and letting the text shape the preacher before shaping the sermon', 'D) Picking multiple big ideas to cover everything'], correctAnswer: 'C) Praying and letting the text shape the preacher before shaping the sermon', points: 1, orderIndex: 20 }
    ];
    
    await db.insert(quizQuestions).values(questions);
    
    console.log(`Successfully created Youth Ministry Week 3 Quiz with ${questions.length} questions!`);
    console.log(`Quiz ID: ${quiz.id}`);
    console.log(`Access at: http://localhost:56000/quiz/youth-ministry-week-3`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating Youth Ministry Week 3 Quiz:', error);
    process.exit(1);
  }
}

addYouthMinistryWeek3Quiz();
