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

export const courseProgressConfig: Record<number, CourseProgressDefinition> = {
  1: {
    quizIds: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    reading: {
      type: 'explicitWeekSets',
      weekSets: [
        [1, 2, 3],
        [4, 5],
        [6, 7],
        [8, 9],
        [10, 11],
        [12, 13],
        [14, 15],
        [16, 17],
        [18, 19],
        [20, 21],
      ],
    },
    video: { type: 'published' },
  },
  2: {
    quizIds: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58],
    reading: { type: 'placeholderPair', baseIds: [1000, 2000], weeks: 10 },
    video: { type: 'published' },
  },
  3: {
    quizIds: [26, 46, 37, 38, 39, 40, 41, 42, 43, 44, 45, 47],
    reading: { type: 'placeholderPair', baseIds: [1000, 2000], weeks: 11 },
    video: { type: 'published' },
  },
  0: {
    quizIds: [71, 72, 73, 74, 75],
    reading: { type: 'placeholderSingle', baseId: 4000, weeks: 4 },
    video: { type: 'none' },
  },
  4: {
    quizIds: [71, 72, 73, 74, 75],
    reading: { type: 'placeholderSingle', baseId: 4000, weeks: 4 },
    video: { type: 'none' },
  },
  5: {
    quizIds: [59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70],
    reading: { type: 'placeholderPair', baseIds: [5000, 6000], weeks: 12 },
    video: { type: 'published' },
  },
  6: {
    quizIds: [76, 77, 78, 79, 80, 82],
    reading: { type: 'placeholderSingle', baseId: 7000, weeks: 5 },
    video: { type: 'none' },
  },
  7: {
    quizIds: [200, 201, 202, 203, 204, 206],
    reading: { type: 'placeholderSingle', baseId: 8000, weeks: 6 },
    video: { type: 'published' },
  },
  8: {
    quizIds: [207, 208, 209, 210, 211, 212],
    reading: { type: 'placeholderSingle', baseId: 9000, weeks: 5 },
    video: { type: 'none' },
  },
  16: {
    quizIds: [221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231],
    reading: { type: "placeholderSingle", baseId: 16000, weeks: 10 },
    video: { type: "published" },
  },
};

