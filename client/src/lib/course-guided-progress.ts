import { ACTS_IN_ACTION_QUIZ_IDS } from "@shared/acts-in-action-course";
import { DEFAULT_PASSING_SCORE, MAN_OF_GOD_WEEK1_PASSING_SCORE } from "@shared/course-constants";
import { getCourseWeekReadingIds } from "@shared/course-reading-ids";
import {
  courseHasVideos,
  getGuidedMaxWeeks,
  usesGuidedFlow,
} from "./course-guided-flow";

export interface ContentProgressItem {
  contentType: string;
  contentId: number;
  completed: boolean;
}

export interface QuizAttemptLite {
  quizId: number;
  score?: string | number;
  completedAt?: string | null;
  startedAt?: string | null;
}

export interface VideoLite {
  id: number;
  title: string;
  isPublished?: boolean;
}

/** Quiz IDs per guided course week; null = no quiz for that week. */
const GUIDED_WEEKLY_QUIZ_IDS: Record<number, (number | null)[]> = {
  1: [...ACTS_IN_ACTION_QUIZ_IDS.slice(0, 10)],
  2: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57],
  // Must match server/routes/quizzes.ts QUIZ_SLUG_MAP (dbaj-week-N)
  3: [26, 46, 37, 38, 39, 40, 41, 42, 43, 44, 45],
  4: [71, 72, 73, 74],
  5: [59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70].slice(0, 12),
  6: [76, 77, 78, 79, 80],
  7: [200, 201, 202, 203, 204, null],
  8: [207, 208, 209, 210, 211],
  // Week 1 intro has no quiz; weeks 2–10 map to lesson quizzes 234–242
  10: [null, 234, 235, 236, 237, 238, 239, 240, 241, 242],
  16: [221, 222, 223, 224, 225, 226, 227, 228, 229, 230],
};

function getPassingScoreForWeek(courseId: number, weekNumber: number): number {
  if (courseId === 16 && weekNumber === 1) return MAN_OF_GOD_WEEK1_PASSING_SCORE;
  return DEFAULT_PASSING_SCORE;
}

function extractWeekNumber(title: string): number {
  const weekMatch = title.match(/Week (\d+)/i);
  if (weekMatch) return parseInt(weekMatch[1], 10);
  if (title.toLowerCase().includes("final exam")) return 11;
  return 1;
}

function normalizeScore(raw: number): number {
  if (Number.isNaN(raw)) return 0;
  return raw <= 1 ? raw * 100 : raw;
}

function isContentCompleted(
  progress: ContentProgressItem[],
  contentType: string,
  contentId: number,
): boolean {
  return progress.some(
    (p) => p.contentType === contentType && p.contentId === contentId && p.completed,
  );
}

function getQuizAttemptInfo(quizId: number, attempts: QuizAttemptLite[]) {
  const completedAttempts = attempts.filter(
    (attempt) => attempt.quizId === quizId && !!attempt.completedAt,
  );
  if (completedAttempts.length === 0) {
    return { count: 0, bestScorePercent: null as number | null };
  }

  const bestScorePercent = Math.max(
    ...completedAttempts.map((attempt) => {
      const raw =
        typeof attempt.score === "string"
          ? parseFloat(attempt.score || "0")
          : attempt.score || 0;
      return normalizeScore(raw);
    }),
  );

  return { count: completedAttempts.length, bestScorePercent };
}

function isWeekVideoComplete(
  weekNumber: number,
  progress: ContentProgressItem[],
  videos: VideoLite[],
  courseId: number,
): boolean {
  if (!courseHasVideos(courseId)) return true;

  // Don't Be a Jonah: videos only on odd weeks 1,3,5,7,9
  if (courseId === 3 && ![1, 3, 5, 7, 9].includes(weekNumber)) return true;

  const weekVideos = videos.filter((v) => {
    const videoWeek = extractWeekNumber(v.title);
    const hasWeekNumber = /Week \d+/i.test(v.title);
    return videoWeek === weekNumber && v.isPublished !== false && hasWeekNumber;
  });
  if (weekVideos.length === 0) return true;
  return weekVideos.every((v) => isContentCompleted(progress, "video", v.id));
}

function isWeekContentCompleted(
  courseId: number,
  weekNumber: number,
  progress: ContentProgressItem[],
  videos: VideoLite[],
): boolean {
  if (!isWeekVideoComplete(weekNumber, progress, videos, courseId)) return false;

  const readingIds = getCourseWeekReadingIds(courseId, weekNumber);
  return (
    readingIds.length === 0 ||
    readingIds.every((id) => isContentCompleted(progress, "reading", id))
  );
}

function isWeekQuizPassed(
  courseId: number,
  weekNumber: number,
  attempts: QuizAttemptLite[],
): boolean {
  const quizIds = GUIDED_WEEKLY_QUIZ_IDS[courseId];
  const quizId = quizIds?.[weekNumber - 1];
  if (quizId == null) return true;

  const attemptInfo = getQuizAttemptInfo(quizId, attempts);
  const passingScore = getPassingScoreForWeek(courseId, weekNumber);
  return (
    attemptInfo.count > 0 && (attemptInfo.bestScorePercent ?? 0) >= passingScore
  );
}

function isWeekFullyCompleted(
  courseId: number,
  weekNumber: number,
  progress: ContentProgressItem[],
  videos: VideoLite[],
  attempts: QuizAttemptLite[],
): boolean {
  if (!isWeekContentCompleted(courseId, weekNumber, progress, videos)) return false;
  return isWeekQuizPassed(courseId, weekNumber, attempts);
}

function canAccessWeek(
  courseId: number,
  weekNumber: number,
  progress: ContentProgressItem[],
  videos: VideoLite[],
): boolean {
  if (weekNumber <= 1) return true;
  return isWeekContentCompleted(courseId, weekNumber - 1, progress, videos);
}

/** Furthest week unlocked by content progression (prior week videos + readings done). */
export function getFurthestAccessibleWeek(
  courseId: number,
  progress: ContentProgressItem[],
  videos: VideoLite[],
): number {
  if (!usesGuidedFlow(courseId)) return 1;

  const maxWeek = getGuidedMaxWeeks(courseId);
  let furthest = 1;
  for (let w = 1; w <= maxWeek; w++) {
    if (!canAccessWeek(courseId, w, progress, videos)) break;
    furthest = w;
  }
  return furthest;
}

/**
 * Week the student should focus on now.
 * Uses content progression — a failed quiz on an earlier week does NOT trap the student.
 */
export function computeGuidedActiveWeek(
  courseId: number,
  progress: ContentProgressItem[],
  videos: VideoLite[],
  _attempts: QuizAttemptLite[],
): number {
  if (!usesGuidedFlow(courseId)) return 1;

  const furthest = getFurthestAccessibleWeek(courseId, progress, videos);
  for (let w = 1; w <= furthest; w++) {
    if (!isWeekContentCompleted(courseId, w, progress, videos)) {
      return w;
    }
  }
  return furthest;
}

/** Weeks where content is done but the quiz was attempted and not passed. */
export function getFailedQuizWeeks(
  courseId: number,
  progress: ContentProgressItem[],
  videos: VideoLite[],
  attempts: QuizAttemptLite[],
): number[] {
  if (!usesGuidedFlow(courseId)) return [];

  const maxWeek = getGuidedMaxWeeks(courseId);
  const failed: number[] = [];
  for (let w = 1; w <= maxWeek; w++) {
    if (!canAccessWeek(courseId, w, progress, videos)) continue;
    if (!isWeekContentCompleted(courseId, w, progress, videos)) continue;

    const quizIds = GUIDED_WEEKLY_QUIZ_IDS[courseId];
    const quizId = quizIds?.[w - 1];
    if (quizId == null) continue;

    const attemptInfo = getQuizAttemptInfo(quizId, attempts);
    if (attemptInfo.count === 0) continue;

    const passingScore = getPassingScoreForWeek(courseId, w);
    if ((attemptInfo.bestScorePercent ?? 0) < passingScore) {
      failed.push(w);
    }
  }
  return failed;
}

/** Current guided week for dashboard / cards. */
export function computeGuidedWeek(
  courseId: number,
  progress: ContentProgressItem[],
  videos: VideoLite[],
  attempts: QuizAttemptLite[],
): number {
  return computeGuidedActiveWeek(courseId, progress, videos, attempts);
}

export function getPreviousReviewWeeks(guidedWeek: number): number[] {
  if (guidedWeek <= 1) return [];
  return Array.from({ length: guidedWeek - 1 }, (_, i) => i + 1);
}
