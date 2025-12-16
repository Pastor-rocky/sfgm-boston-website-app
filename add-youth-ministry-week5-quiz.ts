import { db } from './server/db';
import { quizzes, quizQuestions } from './shared/schema';

async function addYouthMinistryWeek5Quiz() {
  try {
    console.log('Creating Youth Ministry Week 5 Quiz...');
    
    const [quiz] = await db.insert(quizzes).values({
      id: 211,
      moduleId: null,
      title: 'Youth Ministry — Week 5 Quiz',
      timeLimit: 15,
      passingScore: 70,
      isFinalExam: false,
      isPublished: true,
      publishedAt: new Date(),
    }).returning();
    
    const questions = [
      { quizId: 211, question: 'The central goal of outreach in youth ministry is to:', type: 'multiple_choice' as const, options: ['A) Make disciples who follow and obey Jesus, not just draw a crowd', 'B) Win games and giveaways', 'C) Maximize social media engagement', 'D) Create the most creative events'], correctAnswer: 'A) Make disciples who follow and obey Jesus, not just draw a crowd', points: 1, orderIndex: 1 },
      { quizId: 211, question: 'A best practice within 48 hours of a first-time visit is to:', type: 'multiple_choice' as const, options: ['A) Send a mass newsletter only', 'B) Send a personal message to the student and a brief, warm email to the parent with a clear next step', 'C) Wait for them to return and then reach out', 'D) Ask them to fill out a long survey'], correctAnswer: 'B) Send a personal message to the student and a brief, warm email to the parent with a clear next step', points: 1, orderIndex: 2 },
      { quizId: 211, question: 'A concise biblical response to the gospel is to:', type: 'multiple_choice' as const, options: ['A) Promise to attend more often', 'B) Try to behave better', 'C) Repent and believe in Jesus', 'D) Volunteer immediately'], correctAnswer: 'C) Repent and believe in Jesus', points: 1, orderIndex: 3 },
      { quizId: 211, question: 'According to Tony Evans, effective invitations to trust Christ should be grounded in:', type: 'multiple_choice' as const, options: ['A) The preacher\'s personality', 'B) Emotional music alone', 'C) Cultural trends', 'D) The authority of God\'s Word and the Spirit\'s work'], correctAnswer: 'D) The authority of God\'s Word and the Spirit\'s work', points: 1, orderIndex: 4 },
      { quizId: 211, question: 'A simple first-month pathway for new students prioritizes:', type: 'multiple_choice' as const, options: ['A) A different event every week', 'B) Complex membership interviews', 'C) Advanced theological debates', 'D) Connecting to a small group, sharing the gospel clearly, and inviting to a baptism conversation'], correctAnswer: 'D) Connecting to a small group, sharing the gospel clearly, and inviting to a baptism conversation', points: 1, orderIndex: 5 },
      { quizId: 211, question: 'Maxwell\'s People Development (Level 4) emphasizes:', type: 'multiple_choice' as const, options: ['A) Doing more tasks yourself', 'B) Equipping and empowering people (students) to lead others', 'C) Focusing on titles and positions', 'D) Measuring only attendance'], correctAnswer: 'B) Equipping and empowering people (students) to lead others', points: 1, orderIndex: 6 },
      { quizId: 211, question: 'A helpful tool for students to share their faith is:', type: 'multiple_choice' as const, options: ['A) A 30-minute lecture', 'B) A ten-point doctrinal essay', 'C) A three-minute testimony (before/Jesus/after)', 'D) Only posting quotes online'], correctAnswer: 'C) A three-minute testimony (before/Jesus/after)', points: 1, orderIndex: 7 },
      { quizId: 211, question: 'A healthier way to measure disciple-making than attendance alone is to track:', type: 'multiple_choice' as const, options: ['A) Number of snack items distributed', 'B) Stage design changes', 'C) Event budgets', 'D) Next steps like baptisms, Scripture plans started, small group engagement, and serving'], correctAnswer: 'D) Next steps like baptisms, Scripture plans started, small group engagement, and serving', points: 1, orderIndex: 8 },
      { quizId: 211, question: 'A first principle in evangelism training for students is to:', type: 'multiple_choice' as const, options: ['A) Avoid mentioning Jesus', 'B) Memorize long arguments first', 'C) Pray by name for friends and rely on the Spirit\'s help', 'D) Wait until you\'re a leader to share'], correctAnswer: 'C) Pray by name for friends and rely on the Spirit\'s help', points: 1, orderIndex: 9 },
      { quizId: 211, question: 'A safe and wise follow-up after a student indicates a faith decision is to:', type: 'multiple_choice' as const, options: ['A) Promise total secrecy in all cases', 'B) Involve parents appropriately and schedule a visible, accountable meeting with a leader', 'C) Delay contact for a few weeks', 'D) Post the decision publicly without consent'], correctAnswer: 'B) Involve parents appropriately and schedule a visible, accountable meeting with a leader', points: 1, orderIndex: 10 },
      { quizId: 211, question: 'A quarterly outreach that pairs compassion with proclamation could be:', type: 'multiple_choice' as const, options: ['A) A random movie night', 'B) A talent show with no debrief', 'C) A service project with a gospel-centered debrief and an invitation', 'D) A competitive event focused on prizes'], correctAnswer: 'C) A service project with a gospel-centered debrief and an invitation', points: 1, orderIndex: 11 },
      { quizId: 211, question: 'A solid "first 90 days" plan for a new believer includes:', type: 'multiple_choice' as const, options: ['A) Attending only big events', 'B) Avoiding responsibilities', 'C) Waiting a year before joining a group', 'D) Bible reading plan, prayer, small group, and a simple serving role'], correctAnswer: 'D) Bible reading plan, prayer, small group, and a simple serving role', points: 1, orderIndex: 12 },
      { quizId: 211, question: 'Building an invite culture begins when leaders:', type: 'multiple_choice' as const, options: ['A) Model inviting friends, share stories, and celebrate attempts', 'B) Outsource all invites to marketing', 'C) Rely on giveaways only', 'D) Keep invites a secret'], correctAnswer: 'A) Model inviting friends, share stories, and celebrate attempts', points: 1, orderIndex: 13 },
      { quizId: 211, question: 'To keep sermons evangelistically clear, a youth preacher should:', type: 'multiple_choice' as const, options: ['A) Teach five big ideas per message', 'B) Preach one clear big idea from the text and include a specific call to respond', 'C) Avoid applications to stay academic', 'D) Focus mainly on humor'], correctAnswer: 'B) Preach one clear big idea from the text and include a specific call to respond', points: 1, orderIndex: 14 },
      { quizId: 211, question: 'A baptism class should primarily:', type: 'multiple_choice' as const, options: ['A) Explain church history in depth', 'B) Focus on advanced doctrines', 'C) Clarify the gospel, the meaning of baptism, and next steps for new believers', 'D) Teach event planning skills'], correctAnswer: 'C) Clarify the gospel, the meaning of baptism, and next steps for new believers', points: 1, orderIndex: 15 },
      { quizId: 211, question: 'The first competency in a student leadership pipeline often is:', type: 'multiple_choice' as const, options: ['A) Managing the church budget', 'B) Writing policy documents', 'C) Leading a full retreat', 'D) Leading prayer and sharing a testimony in small group'], correctAnswer: 'D) Leading prayer and sharing a testimony in small group', points: 1, orderIndex: 16 },
      { quizId: 211, question: 'Maxwell\'s Law of the Picture implies that students will:', type: 'multiple_choice' as const, options: ['A) Ignore what leaders do', 'B) Do the opposite of leaders', 'C) Only follow printed rules', 'D) Often imitate what their leaders consistently model'], correctAnswer: 'D) Often imitate what their leaders consistently model', points: 1, orderIndex: 17 },
      { quizId: 211, question: 'A wise step for digital evangelism is to:', type: 'multiple_choice' as const, options: ['A) Send late-night private messages', 'B) Share a brief testimony or invite through group chats using ministry accounts and healthy boundaries', 'C) Use disappearing messages for privacy', 'D) Debate strangers in comment sections'], correctAnswer: 'B) Share a brief testimony or invite through group chats using ministry accounts and healthy boundaries', points: 1, orderIndex: 18 },
      { quizId: 211, question: 'When fear keeps students from sharing their faith, the best coaching is to:', type: 'multiple_choice' as const, options: ['A) Tell them to try harder without help', 'B) Avoid the topic', 'C) Practice a simple gospel tool, role-play conversations, and go out in pairs', 'D) Wait until they are older'], correctAnswer: 'C) Practice a simple gospel tool, role-play conversations, and go out in pairs', points: 1, orderIndex: 19 },
      { quizId: 211, question: 'The ultimate source of power for Christian witness is:', type: 'multiple_choice' as const, options: ['A) Perfect arguments', 'B) Event excellence', 'C) Peer approval', 'D) The Holy Spirit empowering believers'], correctAnswer: 'D) The Holy Spirit empowering believers', points: 1, orderIndex: 20 }
    ];
    
    await db.insert(quizQuestions).values(questions);
    
    console.log(`Successfully created Youth Ministry Week 5 Quiz with ${questions.length} questions!`);
    console.log(`Quiz ID: ${quiz.id}`);
    console.log(`Access at: http://localhost:56000/quiz/youth-ministry-week-5`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating Youth Ministry Week 5 Quiz:', error);
    process.exit(1);
  }
}

addYouthMinistryWeek5Quiz();
