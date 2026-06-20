import emailjs from "@emailjs/nodejs";
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

interface DeliverEmailArgs {
  to: string;
  subject: string;
  textBody: string;
  htmlBody?: string;
  emailJs?: {
    templateId?: string;
    params: Record<string, string>;
  };
}

const DEFAULT_REVIEW_EMAIL = "pastor_rocky@sfgmboston.com";

function formatEmailError(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const emailJsError = error as { text?: string; status?: number; message?: string };
    if (emailJsError.text) {
      return emailJsError.status ? `${emailJsError.status}: ${emailJsError.text}` : emailJsError.text;
    }
    if (emailJsError.message) return emailJsError.message;
  }
  return "Unknown error";
}

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
    return `${fromName.trim()} <${fromEmail.trim()}>`;
  }

  return fromEmail.trim();
}

function getEmailJsConfig() {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !publicKey || !privateKey) {
    return null;
  }

  return { serviceId, publicKey, privateKey };
}

function formatRegistrationDateParts(date: Date) {
  return {
    registration_date: date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    registration_time: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

async function sendPostmarkEmail(args: {
  to: string;
  subject: string;
  textBody: string;
  htmlBody?: string;
}): Promise<EmailDeliveryResult> {
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
    return { delivered: false, reason: formatEmailError(error) };
  }
}

async function sendEmailJsTemplate(
  templateId: string | undefined,
  templateParams: Record<string, string>,
): Promise<EmailDeliveryResult> {
  if (!templateId) {
    return { delivered: false, reason: "Missing EmailJS template ID" };
  }

  const config = getEmailJsConfig();
  if (!config) {
    return { delivered: false, reason: "Missing EmailJS configuration" };
  }

  try {
    await emailjs.send(config.serviceId, templateId, templateParams, {
      publicKey: config.publicKey,
      privateKey: config.privateKey,
    });

    return { delivered: true };
  } catch (error) {
    return { delivered: false, reason: formatEmailError(error) };
  }
}

async function deliverEmail(args: DeliverEmailArgs): Promise<EmailDeliveryResult> {
  if (!emailEnabled()) {
    console.log("[email] EMAIL_ENABLED is not true; delivery disabled");
    return { delivered: false, reason: "Email delivery disabled" };
  }

  const postmarkResult = await sendPostmarkEmail({
    to: args.to,
    subject: args.subject,
    textBody: args.textBody,
    htmlBody: args.htmlBody,
  });

  if (postmarkResult.delivered) {
    return postmarkResult;
  }

  if (args.emailJs) {
    const emailJsResult = await sendEmailJsTemplate(args.emailJs.templateId, args.emailJs.params);
    if (emailJsResult.delivered) {
      return emailJsResult;
    }

    return {
      delivered: false,
      reason: emailJsResult.reason || postmarkResult.reason || "Email delivery failed",
    };
  }

  return postmarkResult;
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
  ].join("\n");

  const result = await deliverEmail({
    to: reviewEmail,
    subject,
    textBody,
    emailJs: {
      templateId: process.env.EMAILJS_TEMPLATE_ID,
      params: {
        student_name: payload.studentName || "Unknown Student",
        student_email: payload.studentEmail || "unknown@sfgmboston.com",
        course_title: payload.courseTitle || "Unknown Course",
        quiz_id: String(payload.quizId),
        question_id: String(payload.questionId),
        word_count: String(payload.wordCount),
        submitted_at: payload.submittedAt.toLocaleString(),
        essay_text: payload.essayText,
      },
    },
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
  ].join("\n");

  const registrationParts = formatRegistrationDateParts(payload.registrationDate);
  const result = await deliverEmail({
    to: payload.email,
    subject,
    textBody,
    emailJs: {
      templateId: process.env.EMAILJS_WELCOME_TEMPLATE_ID,
      params: {
        first_name: payload.firstName,
        last_name: payload.lastName,
        username: payload.username,
        email: payload.email,
        ...registrationParts,
      },
    },
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
  ].join("\n");

  const registrationParts = formatRegistrationDateParts(payload.registrationDate);
  const result = await deliverEmail({
    to: adminEmail,
    subject,
    textBody,
    emailJs: {
      templateId: process.env.EMAILJS_ADMIN_TEMPLATE_ID,
      params: {
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        username: payload.username,
        email_consent: payload.emailConsent ? "Yes" : "No",
        ...registrationParts,
      },
    },
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
  ].join("\n");

  const result = await deliverEmail({
    to: payload.email,
    subject,
    textBody,
    emailJs: {
      templateId: process.env.EMAILJS_BIRTHDAY_TEMPLATE_ID,
      params: {
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
      },
    },
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

  return deliverEmail({
    to,
    subject: "SFGM Test Email",
    textBody: "This is a test email from SFGM Boston Bible School.",
  });
}

interface EssayPortalNotificationPayload {
  toEmail: string;
  instructorName?: string;
  studentName: string;
  courseTitle: string;
  wordCount: number;
  essayId: number;
  portalUrl: string;
}

export async function sendEssayPortalNotification(
  payload: EssayPortalNotificationPayload,
): Promise<EmailDeliveryResult> {
  const subject = `New essay to review — ${payload.studentName}`;
  const textBody = [
    payload.instructorName ? `Hello ${payload.instructorName},` : "Hello,",
    "",
    `${payload.studentName} submitted a final exam essay for ${payload.courseTitle}.`,
    `Word count: ${payload.wordCount}`,
    "",
    "The full essay is in your Instructor Portal — not in this email.",
    `Review it here: ${payload.portalUrl}`,
    "",
    "SFGM Boston Bible School",
  ].join("\n");

  if (!emailEnabled()) {
    console.log("[email] Essay portal notification (disabled):", payload.toEmail, subject);
    return { delivered: false, reason: "Email delivery disabled" };
  }

  return deliverEmail({ to: payload.toEmail, subject, textBody });
}

interface InstructorMessageEmailPayload {
  toEmail: string;
  studentName: string;
  subject: string;
  body: string;
}

interface PasswordResetEmailPayload {
  firstName: string;
  email: string;
  resetUrl: string;
}

function getPasswordResetEmailJsConfig(payload: PasswordResetEmailPayload) {
  const dedicatedTemplateId = process.env.EMAILJS_PASSWORD_RESET_TEMPLATE_ID;
  if (dedicatedTemplateId) {
    return {
      templateId: dedicatedTemplateId,
      params: {
        first_name: payload.firstName || "Student",
        email: payload.email,
        reset_url: payload.resetUrl,
      },
    };
  }

  // Reuse the welcome template when no dedicated password-reset template exists yet.
  return {
    templateId: process.env.EMAILJS_WELCOME_TEMPLATE_ID,
    params: {
      first_name: payload.firstName || "Student",
      last_name: "",
      username: "Use the link below to reset your password:",
      email: payload.email,
      registration_date: payload.resetUrl,
      registration_time: "This link expires in 1 hour",
    },
  };
}

export async function sendPasswordResetEmail(
  payload: PasswordResetEmailPayload,
): Promise<EmailDeliveryResult> {
  const subject = "Reset your SFGM Boston Bible School password";
  const textBody = [
    `Hello ${payload.firstName || "Student"},`,
    "",
    "We received a request to reset your password for SFGM Boston Bible School.",
    "",
    "Click the link below to choose a new password (link expires in 1 hour):",
    payload.resetUrl,
    "",
    "If you did not request this, you can ignore this email. Your password will not change.",
    "",
    "SFGM Boston Bible School",
  ].join("\n");

  const htmlBody = [
    `<p>Hello ${payload.firstName || "Student"},</p>`,
    "<p>We received a request to reset your password for SFGM Boston Bible School.</p>",
    `<p><a href="${payload.resetUrl}">Reset your password</a> (link expires in 1 hour)</p>`,
    "<p>If you did not request this, you can ignore this email. Your password will not change.</p>",
    "<p>SFGM Boston Bible School</p>",
  ].join("");

  if (!emailEnabled()) {
    console.log("[email] Password reset (disabled):", payload.email, payload.resetUrl);
    return { delivered: false, reason: "Email delivery disabled" };
  }

  return deliverEmail({
    to: payload.email,
    subject,
    textBody,
    htmlBody,
    emailJs: getPasswordResetEmailJsConfig(payload),
  });
}

export async function sendInstructorMessageEmail(
  payload: InstructorMessageEmailPayload,
): Promise<EmailDeliveryResult> {
  const textBody = [
    `Hello ${payload.studentName},`,
    "",
    payload.body,
    "",
    "— SFGM Boston Bible School",
  ].join("\n");

  if (!emailEnabled()) {
    console.log("[email] Instructor message (disabled):", payload.toEmail);
    return { delivered: false, reason: "Email delivery disabled" };
  }

  return deliverEmail({
    to: payload.toEmail,
    subject: payload.subject,
    textBody,
  });
}
