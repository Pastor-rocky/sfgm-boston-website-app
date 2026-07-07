/** Linear week flow: video → e-book → bible → quiz (guided courses) */

import { getCourseWeekReadingIds } from "@shared/course-reading-ids";

export type GuidedStep = "video" | "readings" | "bible" | "quiz";

export interface GuidedCourseConfig {
  maxWeeks: number;
  /** Course has published video content in the guided flow */
  hasVideos: boolean;
  /** Week has separate e-book + Bible reading steps */
  hasBibleStep: boolean;
  /** First step when starting a new week */
  initialStep: GuidedStep;
}

/** All Bible School courses using the guided one-week-at-a-time UX */
export const GUIDED_FLOW_COURSE_IDS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 10, 16]);

export const GUIDED_COURSE_CONFIG: Record<number, GuidedCourseConfig> = {
  1: { maxWeeks: 10, hasVideos: true, hasBibleStep: true, initialStep: "video" },
  2: { maxWeeks: 10, hasVideos: false, hasBibleStep: true, initialStep: "readings" },
  3: { maxWeeks: 11, hasVideos: true, hasBibleStep: true, initialStep: "video" },
  4: { maxWeeks: 4, hasVideos: false, hasBibleStep: false, initialStep: "readings" },
  5: { maxWeeks: 12, hasVideos: true, hasBibleStep: true, initialStep: "video" },
  6: { maxWeeks: 5, hasVideos: false, hasBibleStep: false, initialStep: "readings" },
  7: { maxWeeks: 6, hasVideos: true, hasBibleStep: false, initialStep: "video" },
  8: { maxWeeks: 5, hasVideos: false, hasBibleStep: false, initialStep: "readings" },
  10: { maxWeeks: 10, hasVideos: true, hasBibleStep: false, initialStep: "video" },
  16: { maxWeeks: 10, hasVideos: true, hasBibleStep: false, initialStep: "video" },
};

export function usesGuidedFlow(courseId: number): boolean {
  return GUIDED_FLOW_COURSE_IDS.has(courseId);
}

export function getGuidedCourseConfig(courseId: number): GuidedCourseConfig | null {
  return GUIDED_COURSE_CONFIG[courseId] ?? null;
}

export function getGuidedMaxWeeks(courseId: number): number {
  return GUIDED_COURSE_CONFIG[courseId]?.maxWeeks ?? 10;
}

export function courseHasBibleStep(courseId: number): boolean {
  return GUIDED_COURSE_CONFIG[courseId]?.hasBibleStep ?? getCourseWeekReadingIds(courseId, 1).length >= 2;
}

export function courseHasVideos(courseId: number): boolean {
  return GUIDED_COURSE_CONFIG[courseId]?.hasVideos ?? true;
}

export function getGuidedInitialStep(courseId: number): GuidedStep {
  return GUIDED_COURSE_CONFIG[courseId]?.initialStep ?? "video";
}

/** Active steps for a course (excludes video/bible when not applicable). */
export function getGuidedStepsForCourse(courseId: number): GuidedStep[] {
  const cfg = GUIDED_COURSE_CONFIG[courseId];
  if (!cfg) return ["video", "readings", "bible", "quiz"];
  const steps: GuidedStep[] = [];
  if (cfg.hasVideos) steps.push("video");
  steps.push("readings");
  if (cfg.hasBibleStep) steps.push("bible");
  steps.push("quiz");
  return steps;
}

const FULL_STEP_ORDER: GuidedStep[] = ["video", "readings", "bible", "quiz"];

export function guidedStepIndex(step: GuidedStep, courseId?: number): number {
  const order = courseId != null ? getGuidedStepsForCourse(courseId) : FULL_STEP_ORDER;
  return order.indexOf(step);
}

export function stepLabel(step: GuidedStep, week: number): string {
  switch (step) {
    case "video":
      return `Week ${week}: Watch the video`;
    case "readings":
      return `Week ${week}: Read the e-book`;
    case "bible":
      return `Week ${week}: Complete the Bible reading`;
    case "quiz":
      return `Week ${week}: Take the quiz`;
  }
}

export function stepShortLabel(step: GuidedStep): string {
  switch (step) {
    case "video":
      return "Video";
    case "readings":
      return "E-book";
    case "bible":
      return "Bible";
    case "quiz":
      return "Quiz";
  }
}

export function nextActionLabel(step: GuidedStep, week: number, courseId?: number): string | null {
  const steps = courseId != null ? getGuidedStepsForCourse(courseId) : FULL_STEP_ORDER;
  const idx = steps.indexOf(step);
  const next = steps[idx + 1];
  if (!next) return null;
  switch (next) {
    case "readings":
      return courseHasVideos(courseId ?? 0)
        ? `Continue to Week ${week} readings`
        : `Continue to Week ${week} e-book`;
    case "bible":
      return "Go to required Bible reading";
    case "quiz":
      return `Continue to Week ${week} quiz`;
    default:
      return null;
  }
}

/** Overall course progress percent for guided flow (0–100). */
export function guidedOverallProgressPercent(
  guidedWeek: number,
  guidedStep: GuidedStep,
  maxWeeks: number,
  courseId?: number,
): number {
  const steps = courseId != null ? getGuidedStepsForCourse(courseId) : FULL_STEP_ORDER;
  const stepCount = steps.length;
  const weekFraction = (guidedWeek - 1) / maxWeeks;
  const stepIdx = steps.indexOf(guidedStep);
  const stepFraction = (stepIdx + 1) / stepCount / maxWeeks;
  return Math.min(100, (weekFraction + stepFraction) * 100);
}

export function getWeekEbookReadingId(courseId: number, weekNumber: number): number | undefined {
  return getCourseWeekReadingIds(courseId, weekNumber)[0];
}

export function getWeekBibleReadingId(courseId: number, weekNumber: number): number | undefined {
  const ids = getCourseWeekReadingIds(courseId, weekNumber);
  return ids.length >= 2 ? ids[1] : undefined;
}
