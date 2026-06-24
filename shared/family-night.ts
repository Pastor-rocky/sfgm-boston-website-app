/** Family Night Faith cycle — June 2026 */
export const FAMILY_NIGHT_FINAL_EXAM_QUIZ_ID = 244;

export const FAMILY_NIGHT_CYCLE = {
  id: "2026-06-faith",
  theme: "Faith",
  monthLabel: "June 2026",
  finalExamTitle: "Faith Final Exam",
  questionCount: 10,
} as const;

export type FamilyNightLiveViewMode = "split" | "question" | "leaderboard";

export type FamilyNightLiveState = {
  cycleId: string;
  /** 0-based index into final exam questions; null = no question highlighted */
  activeQuestionIndex: number | null;
  viewMode: FamilyNightLiveViewMode;
  updatedAt: string;
};

/** Wednesday Family Night — 9:00 PM US Eastern */
export const FAMILY_NIGHT_FINAL_EXAM_OPENS_AT_ISO = "2026-06-03T21:00:00-04:00";
export const FAMILY_NIGHT_FINAL_EXAM_OPENS_LABEL = "Wednesday, June 3 at 9:00 PM ET";

export const FAMILY_NIGHT_QUIZ_SLUGS: Record<string, number> = {
  "family-night-faith-week-1": 220,
  "family-night-faith-week-2": 232,
  "family-night-faith-week-3": 243,
  "family-night-faith-final-exam": FAMILY_NIGHT_FINAL_EXAM_QUIZ_ID,
};

export type FinalExamCountdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOpen: boolean;
  totalMs: number;
};

export function getFinalExamOpensAt(): Date {
  return new Date(FAMILY_NIGHT_FINAL_EXAM_OPENS_AT_ISO);
}

export function isFinalExamScheduleOpen(now: Date = new Date()): boolean {
  return now.getTime() >= getFinalExamOpensAt().getTime();
}

export function getFinalExamCountdownParts(now: Date = new Date()): FinalExamCountdown {
  const opensAt = getFinalExamOpensAt().getTime();
  const nowMs = now.getTime();
  const totalMs = Math.max(0, opensAt - nowMs);
  const isOpen = nowMs >= opensAt;

  return {
    days: Math.floor(totalMs / (1000 * 60 * 60 * 24)),
    hours: Math.floor((totalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((totalMs % (1000 * 60)) / 1000),
    isOpen,
    totalMs,
  };
}

export function formatFinalExamCountdown(parts: FinalExamCountdown): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  if (parts.days > 0) {
    return `${parts.days}d ${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`;
  }
  return `${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`;
}

export function getFinalExamScheduleBlock(quizId: number) {
  if (quizId !== FAMILY_NIGHT_FINAL_EXAM_QUIZ_ID) return null;
  if (isFinalExamScheduleOpen()) return null;

  const countdown = getFinalExamCountdownParts();
  return {
    code: "FINAL_EXAM_NOT_OPEN",
    message: `Final exam opens ${FAMILY_NIGHT_FINAL_EXAM_OPENS_LABEL}.`,
    opensAt: FAMILY_NIGHT_FINAL_EXAM_OPENS_AT_ISO,
    opensLabel: FAMILY_NIGHT_FINAL_EXAM_OPENS_LABEL,
    countdown,
    countdownLabel: formatFinalExamCountdown(countdown),
  };
}

export function isFamilyNightQuizId(id: number): boolean {
  return Object.values(FAMILY_NIGHT_QUIZ_SLUGS).includes(id);
}

export function isFamilyNightFinalExamQuizParam(param: string | undefined): boolean {
  if (!param) return false;
  if (param === "family-night-faith-final-exam") return true;
  const n = Number(param);
  return !Number.isNaN(n) && n === FAMILY_NIGHT_FINAL_EXAM_QUIZ_ID;
}

export function isFamilyNightQuizParam(param: string | undefined): boolean {
  if (!param) return false;
  if (param in FAMILY_NIGHT_QUIZ_SLUGS) return true;
  const n = Number(param);
  return !Number.isNaN(n) && isFamilyNightQuizId(n);
}

export function getFamilyNightReturnPath(): string {
  return "/family-night";
}
