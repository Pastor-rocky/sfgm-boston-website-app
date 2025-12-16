import { db } from './server/db';
import { quizzes, quizQuestions } from './shared/schema';

async function addYouthMinistryWeek4Quiz() {
  try {
    console.log('Creating Youth Ministry Week 4 Quiz...');
    
    const [quiz] = await db.insert(quizzes).values({
      id: 210,
      moduleId: null,
      title: 'Youth Ministry — Week 4 Quiz',
      timeLimit: 15,
      passingScore: 70,
      isFinalExam: false,
      isPublished: true,
      publishedAt: new Date(),
    }).returning();
    
    const questions = [
      { quizId: 210, question: 'The primary purpose of accountability in ministry is to:', type: 'multiple_choice' as const, options: ['A) Create conditions for truth, trust, and healthy growth', 'B) Control people through rules', 'C) Avoid hard conversations', 'D) Impress outside observers'], correctAnswer: 'A) Create conditions for truth, trust, and healthy growth', points: 1, orderIndex: 1 },
      { quizId: 210, question: 'A God-centered foundation for accountability emphasizes:', type: 'multiple_choice' as const, options: ['A) Managing optics', 'B) Performing for applause', 'C) Living in reverent awe before God with regular confession and surrender', 'D) Avoiding limits to prove commitment'], correctAnswer: 'C) Living in reverent awe before God with regular confession and surrender', points: 1, orderIndex: 2 },
      { quizId: 210, question: 'A practical way to keep teaching accountable to Scripture is to:', type: 'multiple_choice' as const, options: ['A) Choose topics based only on trends', 'B) Skip peer review to save time', 'C) Use a sermon prep checklist and invite midweek feedback', 'D) Rely on memory for quotes and sources'], correctAnswer: 'C) Use a sermon prep checklist and invite midweek feedback', points: 1, orderIndex: 3 },
      { quizId: 210, question: 'Maxwell\'s Law of the Inner Circle suggests you should:', type: 'multiple_choice' as const, options: ['A) Avoid close relationships to stay objective', 'B) Choose friends who never challenge you', 'C) Build a circle that tells you the truth in love', 'D) Focus only on public opinion'], correctAnswer: 'C) Build a circle that tells you the truth in love', points: 1, orderIndex: 4 },
      { quizId: 210, question: 'A healthy conflict pathway on your team starts with:', type: 'multiple_choice' as const, options: ['A) Publicly calling out the person', 'B) Venting to others first', 'C) Going directly to the person, then involving others if needed', 'D) Ignoring the issue to keep peace'], correctAnswer: 'C) Going directly to the person, then involving others if needed', points: 1, orderIndex: 5 },
      { quizId: 210, question: 'Financial accountability for youth ministry should include:', type: 'multiple_choice' as const, options: ['A) Single-person cash counts to be efficient', 'B) Loose record-keeping to stay flexible', 'C) Two-person cash counts, receipts, and approved reimbursement processes', 'D) Private discretionary funds for leaders'], correctAnswer: 'C) Two-person cash counts, receipts, and approved reimbursement processes', points: 1, orderIndex: 6 },
      { quizId: 210, question: 'A core element of safety accountability is:', type: 'multiple_choice' as const, options: ['A) Allowing one-on-one closed-door meetings with students', 'B) Using disappearing messages for privacy', 'C) The two-adult rule and visible meeting spaces', 'D) Avoiding written policies to allow discretion'], correctAnswer: 'C) The two-adult rule and visible meeting spaces', points: 1, orderIndex: 7 },
      { quizId: 210, question: 'A metric that serves discipleship better than attendance alone is:', type: 'multiple_choice' as const, options: ['A) Number of games played', 'B) First-time guest follow-up touches completed', 'C) Social media likes', 'D) Merchandise sold'], correctAnswer: 'B) First-time guest follow-up touches completed', points: 1, orderIndex: 8 },
      { quizId: 210, question: 'When a leader makes a mistake, the first faithful response is to:', type: 'multiple_choice' as const, options: ['A) Minimize and move on', 'B) Hide it and hope it fades', 'C) Surface the issue quickly and tell the truth plainly', 'D) Blame team members'], correctAnswer: 'C) Surface the issue quickly and tell the truth plainly', points: 1, orderIndex: 9 },
      { quizId: 210, question: 'A simple rhythm that prevents burnout is to:', type: 'multiple_choice' as const, options: ['A) Keep messages open 24/7', 'B) Skip days off during busy seasons', 'C) Establish a weekly day off and a nightly communication cut-off', 'D) Cancel vacations to show dedication'], correctAnswer: 'C) Establish a weekly day off and a nightly communication cut-off', points: 1, orderIndex: 10 },
      { quizId: 210, question: 'A leader covenant most helpfully clarifies:', type: 'multiple_choice' as const, options: ['A) Event themes and branding guidelines', 'B) Personal preferences for music', 'C) Character expectations, communication boundaries, and safety practices', 'D) Who gets platform time'], correctAnswer: 'C) Character expectations, communication boundaries, and safety practices', points: 1, orderIndex: 11 },
      { quizId: 210, question: 'A wise digital communication practice is to:', type: 'multiple_choice' as const, options: ['A) Use private accounts for ministry conversations', 'B) Send late-night DMs to be available', 'C) Keep messages group-based when possible and include a second adult or parent on private threads', 'D) Use disappearing messages to protect privacy'], correctAnswer: 'C) Keep messages group-based when possible and include a second adult or parent on private threads', points: 1, orderIndex: 12 },
      { quizId: 210, question: 'A restoration plan after failure should be:', type: 'multiple_choice' as const, options: ['A) Rushed to reduce embarrassment', 'B) Led without outside counsel', 'C) Careful, honest, and supervised by church leadership', 'D) Avoided to keep morale high'], correctAnswer: 'C) Careful, honest, and supervised by church leadership', points: 1, orderIndex: 13 },
      { quizId: 210, question: 'To align teaching with your church, you should:', type: 'multiple_choice' as const, options: ['A) Ignore the doctrinal statement to stay creative', 'B) Announce controversial topics the day of', 'C) Invite your pastor to preview tough topics and ensure alignment', 'D) Only teach non-doctrinal subjects'], correctAnswer: 'C) Invite your pastor to preview tough topics and ensure alignment', points: 1, orderIndex: 14 },
      { quizId: 210, question: 'Making accountability visible to parents includes:', type: 'multiple_choice' as const, options: ['A) Avoiding Q&A to control the narrative', 'B) Sharing safety policies, introducing leaders, and explaining screening processes', 'C) Focusing only on upcoming events', 'D) Asking parents not to contact you'], correctAnswer: 'B) Sharing safety policies, introducing leaders, and explaining screening processes', points: 1, orderIndex: 15 },
      { quizId: 210, question: 'A key sign you are accountable for outcomes rather than activity is:', type: 'multiple_choice' as const, options: ['A) Adding more events quickly', 'B) Tracking and acting on engagement and formation metrics', 'C) Measuring only total attendance', 'D) Looking at last year\'s calendar for ideas'], correctAnswer: 'B) Tracking and acting on engagement and formation metrics', points: 1, orderIndex: 16 },
      { quizId: 210, question: 'One practical step to build feedback into your leadership is to:', type: 'multiple_choice' as const, options: ['A) Wait for crises to ask for input', 'B) Hold twice-yearly "stop, start, continue" conversations with your pastor and team', 'C) Only read anonymous suggestion boxes', 'D) Avoid feedback to protect confidence'], correctAnswer: 'B) Hold twice-yearly "stop, start, continue" conversations with your pastor and team', points: 1, orderIndex: 17 },
      { quizId: 210, question: 'Tony Evans would most affirm which preaching accountability principle?', type: 'multiple_choice' as const, options: ['A) The preacher stands over the text to adapt it freely', 'B) The preacher stands under the text, letting Scripture set the agenda', 'C) Culture sets the sermon agenda; Scripture is secondary', 'D) Illustration value determines the message'], correctAnswer: 'B) The preacher stands under the text, letting Scripture set the agenda', points: 1, orderIndex: 18 },
      { quizId: 210, question: 'A wise boundary for counseling students is to:', type: 'multiple_choice' as const, options: ['A) Promise absolute confidentiality', 'B) Avoid involving parents in any situation', 'C) Listen, pray, document serious issues briefly, and refer to professionals when needed', 'D) Share details broadly to get advice'], correctAnswer: 'C) Listen, pray, document serious issues briefly, and refer to professionals when needed', points: 1, orderIndex: 19 },
      { quizId: 210, question: 'According to Maxwell\'s People Development emphasis (Level 4), accountability grows when leaders:', type: 'multiple_choice' as const, options: ['A) Do all critical tasks themselves', 'B) Delegate without training', 'C) Coach, equip, and give ownership with clear expectations and feedback', 'D) Rotate volunteers frequently to avoid attachment'], correctAnswer: 'C) Coach, equip, and give ownership with clear expectations and feedback', points: 1, orderIndex: 20 }
    ];
    
    await db.insert(quizQuestions).values(questions);
    
    console.log(`Successfully created Youth Ministry Week 4 Quiz with ${questions.length} questions!`);
    console.log(`Quiz ID: ${quiz.id}`);
    console.log(`Access at: http://localhost:56000/quiz/youth-ministry-week-4`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating Youth Ministry Week 4 Quiz:', error);
    process.exit(1);
  }
}

addYouthMinistryWeek4Quiz();
