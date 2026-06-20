/**
 * Hardcoded content-progress reading IDs per course week.
 * Must match buttons in course-content-viewer.tsx and server course-progress-config.
 */
import { ACTS_IN_ACTION_WEEK_READING_IDS } from "./acts-in-action-course";

export const FIRE_STARTER_WEEK_READING_IDS: Record<number, number[]> = {
  1: [101, 102], 2: [103, 104], 3: [105, 106], 4: [107, 108], 5: [109, 110],
  6: [111, 112], 7: [113, 114], 8: [115, 116], 9: [117, 118], 10: [119, 120],
};

export const DONT_BE_A_JONAH_WEEK_READING_IDS: Record<number, number[]> = {
  1: [201, 202], 2: [203, 204], 3: [205, 206], 4: [207, 208], 5: [209, 210],
  6: [211, 212], 7: [213, 214], 8: [215, 216], 9: [217, 218], 10: [219, 220], 11: [221, 222],
};

export const GROW_WEEK_READING_IDS: Record<number, number[]> = {
  1: [301], 2: [302], 3: [303], 4: [304],
};

export const STUDYING_FOR_SERVICE_WEEK_READING_IDS: Record<number, number[]> = {
  1: [401, 402], 2: [403, 404], 3: [405, 406], 4: [407, 408], 5: [409, 410],
  6: [411, 412], 7: [413, 414], 8: [415, 416], 9: [417, 418], 10: [419, 420],
  11: [421, 422], 12: [423, 424],
};

export const DEACON_WEEK_READING_IDS: Record<number, number[]> = {
  1: [501], 2: [502], 3: [503], 4: [504], 5: [505],
};

export const LEVEL_UP_LEADERSHIP_WEEK_READING_IDS: Record<number, number[]> = {
  1: [601], 2: [602], 3: [603], 4: [604], 5: [605], 6: [606],
};

export const YOUTH_MINISTRY_WEEK_READING_IDS: Record<number, number[]> = {
  1: [701], 2: [702], 3: [703], 4: [704], 5: [705],
};

export const MAN_OF_GOD_WEEK_READING_IDS: Record<number, number[]> = {
  1: [1601], 2: [1602], 3: [1603], 4: [1604], 5: [1605],
  6: [1606], 7: [1607], 8: [1608], 9: [1609], 10: [1610],
};

/** Introduction to Prophecy — 10 chapter weeks (Introduction + Lessons 1–9). */
export const INTRODUCTION_TO_PROPHECY_WEEK_READING_IDS: Record<number, number[]> = {
  1: [1001],
  2: [1002],
  3: [1003],
  4: [1004],
  5: [1005],
  6: [1006],
  7: [1007],
  8: [1008],
  9: [1009],
  10: [1010],
};

const COURSE_WEEK_READING_MAP: Record<number, Record<number, number[]>> = {
  1: ACTS_IN_ACTION_WEEK_READING_IDS,
  2: FIRE_STARTER_WEEK_READING_IDS,
  3: DONT_BE_A_JONAH_WEEK_READING_IDS,
  4: GROW_WEEK_READING_IDS,
  5: STUDYING_FOR_SERVICE_WEEK_READING_IDS,
  6: DEACON_WEEK_READING_IDS,
  7: LEVEL_UP_LEADERSHIP_WEEK_READING_IDS,
  8: YOUTH_MINISTRY_WEEK_READING_IDS,
  16: MAN_OF_GOD_WEEK_READING_IDS,
  10: INTRODUCTION_TO_PROPHECY_WEEK_READING_IDS,
};

export function getCourseWeekReadingIds(courseId: number, weekNumber: number): number[] {
  return COURSE_WEEK_READING_MAP[courseId]?.[weekNumber] ?? [];
}

export function getCourseWeekReadingSets(courseId: number): number[][] {
  const map = COURSE_WEEK_READING_MAP[courseId];
  if (!map) return [];
  const weeks = Object.keys(map).map(Number).sort((a, b) => a - b);
  return weeks.map((w) => map[w]);
}
