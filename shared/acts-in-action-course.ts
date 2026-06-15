/** Acts in Action (course ID 1) — reading progress IDs per week. */

export const ACTS_IN_ACTION_COURSE_ID = 1;

/**
 * Hardcoded content-progress reading IDs per week.
 * Each week: [e-book id, bible id] — must match course-content-viewer buttons.
 */
export const ACTS_IN_ACTION_WEEK_READING_IDS: Record<number, number[]> = {
  1: [1, 3], // Introduction & Chapter 1 (combined e-book), Acts 1-2
  2: [4, 5], // Chapter 2, Acts 3-5
  3: [6, 7], // Chapter 3, Acts 6-8
  4: [8, 9], // Chapter 4, Acts 9-11
  5: [10, 11], // Chapter 5, Acts 12-14
  6: [12, 13], // Chapter 6, Acts 15-17
  7: [14, 15], // Chapter 7, Acts 18-20
  8: [16, 17], // Chapter 8, Acts 21-23
  9: [18, 19], // Chapter 9, Acts 24-26
  10: [20, 21], // Chapter 10, Acts 27-28
};

export const ACTS_IN_ACTION_WEEKS = 10;

export const ACTS_IN_ACTION_QUIZ_IDS = [
  13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
] as const;

export function getActsInActionReadingIds(weekNumber: number): number[] {
  return ACTS_IN_ACTION_WEEK_READING_IDS[weekNumber] ?? [];
}
