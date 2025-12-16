import emailjs from "@emailjs/nodejs";

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

export async function sendEssaySubmissionEmail(payload: EssayEmailPayload): Promise<EmailDeliveryResult> {
  const reviewEmail = payload.toEmail || process.env.ESSAY_REVIEW_EMAIL || DEFAULT_REVIEW_EMAIL;

  if (!emailEnabled()) {
    console.log("[email] Delivery disabled. Logging essay payload for manual review.");
    logEssayPayload(reviewEmail, payload);
    return { delivered: false, reason: "Email delivery disabled" };
  }

  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey || !privateKey) {
    console.warn("[email] Missing EmailJS configuration. Unable to send essay notification.");
    logEssayPayload(reviewEmail, payload);
    return { delivered: false, reason: "Missing EmailJS configuration" };
  }

  const templateParams = {
    to_email: reviewEmail,
    student_name: payload.studentName || "Unknown Student",
    student_email: payload.studentEmail || "unknown@sfgmboston.com",
    course_title: payload.courseTitle || "Unknown Course",
    quiz_id: payload.quizId,
    question_id: payload.questionId,
    word_count: payload.wordCount,
    essay_text: payload.essayText,
    submitted_at: payload.submittedAt.toISOString(),
  };

  try {
    await emailjs.send(serviceId, templateId, templateParams, {
      publicKey,
      privateKey,
    });
    return { delivered: true };
  } catch (error) {
    console.error("[email] Failed to deliver essay submission email:", error);
    logEssayPayload(reviewEmail, payload);
    return { delivered: false, reason: (error as Error)?.message || "Unknown error" };
  }
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
  console.log(`Essay Text:\n${payload.essayText}`);
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
  emailConsent: boolean;
}

export async function sendWelcomeEmail(payload: RegistrationEmailPayload): Promise<EmailDeliveryResult> {
  if (!emailEnabled()) {
    console.log("[email] Delivery disabled. Logging welcome email payload.");
    logWelcomeEmail(payload);
    return { delivered: false, reason: "Email delivery disabled" };
  }

  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const welcomeTemplateId = process.env.EMAILJS_WELCOME_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !welcomeTemplateId || !publicKey || !privateKey) {
    console.warn("[email] Missing EmailJS configuration. Unable to send welcome email.");
    logWelcomeEmail(payload);
    return { delivered: false, reason: "Missing EmailJS configuration" };
  }

  const templateParams = {
    to_email: payload.email,
    first_name: payload.firstName,
    last_name: payload.lastName,
    full_name: `${payload.firstName} ${payload.lastName}`,
    username: payload.username,
    registration_date: payload.registrationDate.toLocaleDateString(),
    registration_time: payload.registrationDate.toLocaleTimeString(),
  };

  try {
    await emailjs.send(serviceId, welcomeTemplateId, templateParams, {
      publicKey,
      privateKey,
    });
    return { delivered: true };
  } catch (error) {
    console.error("[email] Failed to deliver welcome email:", error);
    logWelcomeEmail(payload);
    return { delivered: false, reason: (error as Error)?.message || "Unknown error" };
  }
}

export async function sendAdminRegistrationNotification(payload: AdminNotificationPayload): Promise<EmailDeliveryResult> {
  const adminEmail = DEFAULT_REVIEW_EMAIL;

  if (!emailEnabled()) {
    console.log("[email] Delivery disabled. Logging admin notification payload.");
    logAdminNotification(adminEmail, payload);
    return { delivered: false, reason: "Email delivery disabled" };
  }

  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const adminTemplateId = process.env.EMAILJS_ADMIN_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !adminTemplateId || !publicKey || !privateKey) {
    console.warn("[email] Missing EmailJS configuration. Unable to send admin notification.");
    logAdminNotification(adminEmail, payload);
    return { delivered: false, reason: "Missing EmailJS configuration" };
  }

  const templateParams = {
    to_email: adminEmail,
    first_name: payload.firstName,
    last_name: payload.lastName,
    full_name: `${payload.firstName} ${payload.lastName}`,
    email: payload.email,
    username: payload.username,
    registration_date: payload.registrationDate.toLocaleDateString(),
    registration_time: payload.registrationDate.toLocaleTimeString(),
    email_consent: payload.emailConsent ? "Yes" : "No",
  };

  try {
    await emailjs.send(serviceId, adminTemplateId, templateParams, {
      publicKey,
      privateKey,
    });
    return { delivered: true };
  } catch (error) {
    console.error("[email] Failed to deliver admin notification email:", error);
    logAdminNotification(adminEmail, payload);
    return { delivered: false, reason: (error as Error)?.message || "Unknown error" };
  }
}

function logWelcomeEmail(payload: RegistrationEmailPayload) {
  console.log("=== WELCOME EMAIL ===");
  console.log(`To: ${payload.email}`);
  console.log(`Subject: Welcome to SFGM Boston Bible School!`);
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

  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const birthdayTemplateId = process.env.EMAILJS_BIRTHDAY_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !birthdayTemplateId || !publicKey || !privateKey) {
    console.warn("[email] Missing EmailJS configuration. Unable to send birthday email.");
    logBirthdayEmail(payload);
    return { delivered: false, reason: "Missing EmailJS configuration" };
  }

  const templateParams = {
    to_email: payload.email,
    first_name: payload.firstName,
    last_name: payload.lastName,
    full_name: `${payload.firstName} ${payload.lastName}`,
    birthday_date: payload.dateOfBirth,
  };

  try {
    await emailjs.send(serviceId, birthdayTemplateId, templateParams, {
      publicKey,
      privateKey,
    });
    return { delivered: true };
  } catch (error) {
    console.error("[email] Failed to deliver birthday email:", error);
    logBirthdayEmail(payload);
    return { delivered: false, reason: (error as Error)?.message || "Unknown error" };
  }
}

function logBirthdayEmail(payload: BirthdayEmailPayload) {
  console.log("=== BIRTHDAY EMAIL ===");
  console.log(`To: ${payload.email}`);
  console.log(`Subject: 🎉 Happy Birthday ${payload.firstName}!`);
  console.log(`Name: ${payload.firstName} ${payload.lastName}`);
  console.log(`Date of Birth: ${payload.dateOfBirth}`);
  console.log(`Phone: ${payload.phone || "N/A"}`);
  console.log(`Text Message Consent: ${payload.textMessageConsent ? "Yes" : "No"}`);
  console.log("=== END EMAIL ===");
}




















