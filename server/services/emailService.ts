import { ServerClient } from "postmark";

interface EssayEmailPayload {
  toEmail?: string | null;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  quizId: number;
  questionId: number;
  wordCount: number;
  essayText: string;
  submittedAt: Date;
}

interface EmailDeliveryResult {
  delivered: boolean;
  reason?: string;
}

const DEFAULT_REVIEW_EMAIL = "pastor_rocky@sfgmboston.com";

const emailEnabled = () => {
  return (process.env.EMAIL_ENABLED || "").toLowerCase() === "true";
};

let postmarkClient: ServerClient | null = null;

function getPostmarkClient(): ServerClient | null {
  const token = process.env.POSTMARK_SERVER_API_TOKEN;
  if (!token) return null;

  if (!postmarkClient) {
    postmarkClient = new ServerClient(token);
  }

  return postmarkClient;
}

function getFromAddress(): string | null {
  const fromEmail = process.env.POSTMARK_FROM_EMAIL;
  const fromName = process.env.POSTMARK_FROM_NAME;

  if (!fromEmail) return null;
  if (fromName && fromName.trim().length > 0) {
    // Postmark accepts: "Display Name <email@domain>"
    return `${fromName.trim()} <${fromEmail.trim()}>`;
  }

  return fromEmail.trim();
}

async function sendPostmarkEmail(args: {
  to: string;
  subject: string;
  textBody: string;
  htmlBody?: string;
}): Promise<EmailDeliveryResult> {
  if (!emailEnabled()) {
    return { delivered: false, reason: "Email delivery disabled" };
  }

  const client = getPostmarkClient();
  const from = getFromAddress();

  if (!client || !from) {
    return { delivered: false, reason: "Missing Postmark configuration" };
  }

  try {
    await client.sendEmail({
      From: from,
      To: args.to,
      Subject: args.subject,
      TextBody: args.textBody,
      HtmlBody: args.htmlBody,
      MessageStream: process.env.POSTMARK_MESSAGE_STREAM || "outbound",
    });

    return { delivered: true };
  } catch (error) {
    return { delivered: false, reason: (error as Error)?.message || "Unknown error" };
  }
}

export async function sendEssaySubmissionEmail(payload: EssayEmailPayload): Promise<EmailDeliveryResult> {
  const reviewEmail = payload.toEmail || process.env.ESSAY_REVIEW_EMAIL || DEFAULT_REVIEW_EMAIL;

  if (!emailEnabled()) {
    console.log("[email] Delivery disabled. Logging essay payload for manual review.");
    logEssayPayload(reviewEmail, payload);
    return { delivered: false, reason: "Email delivery disabled" };
  }

  const subject = `Final Exam Essay Submission - ${payload.studentName || "Unknown Student"}`;
  const textBody = [
    `Student: ${payload.studentName || "Unknown Student"}`,
    `Student Email: ${payload.studentEmail || "unknown@sfgmboston.com"}`,
    `Course: ${payload.courseTitle || "Unknown Course"}`,
    `Quiz ID: ${payload.quizId}`,
    `Question ID: ${payload.questionId}`,
    `Word Count: ${payload.wordCount}`,
    `Submitted At: ${payload.submittedAt.toISOString()}`,
    "",
    "Essay:",
    payload.essayText,
  ].join("
");

  const result = await sendPostmarkEmail({
    to: reviewEmail,
    subject,
    textBody,
  });

  if (!result.delivered) {
    console.error("[email] Failed to deliver essay submission email:", result.reason);
    logEssayPayload(reviewEmail, payload);
  }

  return result;
}

function logEssayPayload(recipient: string, payload: EssayEmailPayload) {
  console.log("=== ESSAY SUBMISSION EMAIL ===");
  console.log(`To: ${recipient}`);
  console.log(`Subject: Final Exam Essay Submission - ${payload.studentName}`);
  console.log(`Course: ${payload.courseTitle}`);
  console.log(`Quiz ID: ${payload.quizId}`);
  console.log(`Question ID: ${payload.questionId}`);
  console.log(`Word Count: ${payload.wordCount}`);
  console.log(`Submitted: ${payload.submittedAt.toLocaleString()}`);
  console.log(`Student Email: ${payload.studentEmail}`);
  console.log(`Essay Text:
${payload.essayText}`);
  console.log("=== END EMAIL ===");
}

interface RegistrationEmailPayload {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  registrationDate: Date;
}

interface AdminNotificationPayload {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  registrationDate: Date;
  emailConsent?: boolean;
}

export async function sendWelcomeEmail(payload: RegistrationEmailPayload): Promise<EmailDeliveryResult> {
  if (!emailEnabled()) {
    console.log("[email] Delivery disabled. Logging welcome email payload.");
    logWelcomeEmail(payload);
    return { delivered: false, reason: "Email delivery disabled" };
  }

  const subject = "Welcome to SFGM Boston Bible School!";
  const textBody = [
    `Hello ${payload.firstName} ${payload.lastName},`,
    "",
    "Welcome to SFGM Boston Bible School!",
    `Your username is: ${payload.username}`,
    "",
    "You can log in anytime at:",
    "https://sfgmboston.com/login",
    "",
    "God bless,",
    "SFGM Boston Bible School",
  ].join("
");

  const result = await sendPostmarkEmail({
    to: payload.email,
    subject,
    textBody,
  });

  if (!result.delivered) {
    console.error("[email] Failed to deliver welcome email:", result.reason);
    logWelcomeEmail(payload);
  }

  return result;
}

export async function sendAdminRegistrationNotification(payload: AdminNotificationPayload): Promise<EmailDeliveryResult> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || DEFAULT_REVIEW_EMAIL;

  if (!emailEnabled()) {
    console.log("[email] Delivery disabled. Logging admin notification payload.");
    logAdminNotification(adminEmail, payload);
    return { delivered: false, reason: "Email delivery disabled" };
  }

  const subject = `New User Registration - ${payload.firstName} ${payload.lastName}`;
  const textBody = [
    "A new user registered:",
    "",
    `Name: ${payload.firstName} ${payload.lastName}`,
    `Email: ${payload.email}`,
    `Username: ${payload.username}`,
    `Registered: ${payload.registrationDate.toISOString()}`,
    `Email Consent: ${payload.emailConsent ? "Yes" : "No"}`,
  ].join("
");

  const result = await sendPostmarkEmail({
    to: adminEmail,
    subject,
    textBody,
  });

  if (!result.delivered) {
    console.error("[email] Failed to deliver admin notification email:", result.reason);
    logAdminNotification(adminEmail, payload);
  }

  return result;
}

function logWelcomeEmail(payload: RegistrationEmailPayload) {
  console.log("=== WELCOME EMAIL ===");
  console.log(`To: ${payload.email}`);
  console.log("Subject: Welcome to SFGM Boston Bible School!");
  console.log(`Name: ${payload.firstName} ${payload.lastName}`);
  console.log(`Username: ${payload.username}`);
  console.log(`Registration Date: ${payload.registrationDate.toLocaleString()}`);
  console.log("=== END EMAIL ===");
}

function logAdminNotification(recipient: string, payload: AdminNotificationPayload) {
  console.log("=== ADMIN REGISTRATION NOTIFICATION ===");
  console.log(`To: ${recipient}`);
  console.log(`Subject: New User Registration - ${payload.firstName} ${payload.lastName}`);
  console.log(`Name: ${payload.firstName} ${payload.lastName}`);
  console.log(`Email: ${payload.email}`);
  console.log(`Username: ${payload.username}`);
  console.log(`Registration Date: ${payload.registrationDate.toLocaleString()}`);
  console.log(`Email Consent: ${payload.emailConsent ? "Yes" : "No"}`);
  console.log("=== END EMAIL ===");
}

interface BirthdayEmailPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  textMessageConsent?: boolean;
}

export async function sendBirthdayEmail(payload: BirthdayEmailPayload): Promise<EmailDeliveryResult> {
  if (!emailEnabled()) {
    console.log("[email] Delivery disabled. Logging birthday email payload.");
    logBirthdayEmail(payload);
    return { delivered: false, reason: "Email delivery disabled" };
  }

  const subject = `Happy Birthday ${payload.firstName}!`;
  const textBody = [
    `Happy Birthday ${payload.firstName}!`,
    "",
    "We pray God blesses you with a wonderful year ahead.",
    "",
    "SFGM Boston Bible School",
  ].join("
");

  const result = await sendPostmarkEmail({
    to: payload.email,
    subject,
    textBody,
  });

  if (!result.delivered) {
    console.error("[email] Failed to deliver birthday email:", result.reason);
    logBirthdayEmail(payload);
  }

  return result;
}

function logBirthdayEmail(payload: BirthdayEmailPayload) {
  console.log("=== BIRTHDAY EMAIL ===");
  console.log(`To: ${payload.email}`);
  console.log(`Subject: Happy Birthday ${payload.firstName}!`);
  console.log(`Name: ${payload.firstName} ${payload.lastName}`);
  console.log(`Date of Birth: ${payload.dateOfBirth}`);
  console.log(`Phone: ${payload.phone || "N/A"}`);
  console.log(`Text Message Consent: ${payload.textMessageConsent ? "Yes" : "No"}`);
  console.log("=== END EMAIL ===");
}

export async function sendTestEmail(toEmail: string): Promise<EmailDeliveryResult> {
  const to = (toEmail || "").trim();
  if (!to) return { delivered: false, reason: "Missing recipient" };

  const result = await sendPostmarkEmail({
    to,
    subject: "SFGM Test Email",
    textBody: "This is a test email from SFGM Boston Bible School.",
  });

  return result;
}
