import twilio from "twilio";

export interface SmsDeliveryResult {
  delivered: boolean;
  reason?: string;
  sid?: string;
}

function smsEnabled(): boolean {
  return (process.env.SMS_ENABLED || "").toLowerCase() === "true";
}

function getTwilioConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return null;
  }

  return { accountSid, authToken, fromNumber };
}

function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (phone.trim().startsWith("+") && digits.length >= 10) return `+${digits}`;
  return null;
}

export async function sendStudentSms(args: {
  toPhone: string;
  body: string;
}): Promise<SmsDeliveryResult> {
  if (!smsEnabled()) {
    return { delivered: false, reason: "SMS delivery disabled (set SMS_ENABLED=true)" };
  }

  const config = getTwilioConfig();
  if (!config) {
    return {
      delivered: false,
      reason: "Missing Twilio configuration (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)",
    };
  }

  const to = normalizePhone(args.toPhone);
  if (!to) {
    return { delivered: false, reason: "Invalid student phone number" };
  }

  const body = args.body.trim();
  if (!body) {
    return { delivered: false, reason: "Message body is required" };
  }

  try {
    const client = twilio(config.accountSid, config.authToken);
    const message = await client.messages.create({
      from: config.fromNumber,
      to,
      body: body.slice(0, 1600),
    });

    return { delivered: true, sid: message.sid };
  } catch (error) {
    return { delivered: false, reason: (error as Error)?.message || "Twilio send failed" };
  }
}

export function getSmsConfigStatus() {
  return {
    enabled: smsEnabled(),
    configured: Boolean(getTwilioConfig()),
  };
}
