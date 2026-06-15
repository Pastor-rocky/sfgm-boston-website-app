/** Platform-wide course rules */

/** Default minimum score (percent) to pass weekly quizzes and final exams */
export const DEFAULT_PASSING_SCORE = 70;

/** Man of God Week 1 — essay-only; submit essay to pass */
export const MAN_OF_GOD_WEEK1_PASSING_SCORE = 100;

/** Legacy catalog IDs that map to G.R.O.W (course 4) */
export const GROW_COURSE_ID = 4;
export const LEGACY_GROW_COURSE_IDS = [0, 18] as const;

/** Normalize legacy course IDs to canonical database IDs */
export function normalizeCourseId(courseId: number): number {
  if (LEGACY_GROW_COURSE_IDS.includes(courseId as (typeof LEGACY_GROW_COURSE_IDS)[number])) {
    return GROW_COURSE_ID;
  }
  return courseId;
}
