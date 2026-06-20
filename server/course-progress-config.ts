import { ACTS_IN_ACTION_QUIZ_IDS } from "../shared/acts-in-action-course";
import { getCourseWeekReadingSets } from "../shared/course-reading-ids";

export type PlaceholderReadingStrategy =
  | { type: 'placeholderSingle'; baseId: number; weeks: number }
  | { type: 'placeholderPair'; baseIds: [number, number]; weeks: number };

export type ReadingStrategy =
  | PlaceholderReadingStrategy
  | { type: 'explicitWeekSets'; weekSets: number[][] }
  | { type: 'none' };

export type VideoStrategy =
  | { type: 'published' }
  | { type: 'none' };

export interface CourseProgressDefinition {
  quizIds: number[];
  reading?: ReadingStrategy;
  video?: VideoStrategy;
}

function explicitReading(courseId: number): ReadingStrategy {
  return { type: 'explicitWeekSets', weekSets: getCourseWeekReadingSets(courseId) };
}

export const courseProgressConfig: Record<number, CourseProgressDefinition> = {
  1: {
    quizIds: [...ACTS_IN_ACTION_QUIZ_IDS],
    reading: explicitReading(1),
    video: { type: 'published' },
  },
  2: {
    quizIds: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58],
    reading: explicitReading(2),
    video: { type: 'published' },
  },
  3: {
    quizIds: [26, 46, 37, 38, 39, 40, 41, 42, 43, 44, 45, 47],
    reading: explicitReading(3),
    video: { type: 'published' },
  },
  4: {
    quizIds: [71, 72, 73, 74, 75],
    reading: explicitReading(4),
    video: { type: 'none' },
  },
  5: {
    quizIds: [59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70],
    reading: explicitReading(5),
    video: { type: 'published' },
  },
  6: {
    quizIds: [76, 77, 78, 79, 80, 82],
    reading: explicitReading(6),
    video: { type: 'none' },
  },
  7: {
    quizIds: [200, 201, 202, 203, 204, 206],
    reading: explicitReading(7),
    video: { type: 'published' },
  },
  8: {
    quizIds: [207, 208, 209, 210, 211, 212],
    reading: explicitReading(8),
    video: { type: 'none' },
  },
  16: {
    quizIds: [221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231],
    reading: explicitReading(16),
    video: { type: "published" },
  },
  10: {
    quizIds: [234, 235, 236, 237, 238, 239, 240, 241, 242],
    reading: explicitReading(10),
    video: { type: "published" },
  },
};
