/**
 * SFGM Man of God Course — shared chapter metadata (course ID 16).
 * E-book text lives in client/src/components/man-of-god-*-content.tsx
 */

export {
  MAN_OF_GOD_COURSE_ID,
  MAN_OF_GOD_DESCRIPTION,
  MAN_OF_GOD_OVERVIEW,
  MAN_OF_GOD_WEEKS,
  MAN_OF_GOD_WEEKLY_PASSING_SCORE,
  MAN_OF_GOD_WHAT_YOULL_LEARN,
} from "@shared/man-of-god-course";

export { DEFAULT_PASSING_SCORE, MAN_OF_GOD_WEEK1_PASSING_SCORE } from "@shared/course-constants";

/** Main course hub (videos, readings, quizzes) */
export const MAN_OF_GOD_COURSE_URL = "/course/16";
/** Short bookmark URL — redirects to course hub */
export const MAN_OF_GOD_ALIAS_URL = "/man-of-god";
export const MAN_OF_GOD_COVER = "/man-of-god-course-cover.webp";

export type ManOfGodChapter = {
  week: number;
  title: string;
  route: string;
  audioFile: string;
  readingId: number;
};

export const MAN_OF_GOD_CHAPTERS: ManOfGodChapter[] = [
  {
    week: 1,
    title: "Course Introduction",
    route: "/man-of-god-ch1",
    audioFile: "mog introduction.wav",
    readingId: 1601,
  },
  {
    week: 2,
    title: "Chapter One • A Mature Man",
    route: "/man-of-god-ch2",
    audioFile: "mog Cp1.wav",
    readingId: 1602,
  },
  {
    week: 3,
    title: 'Chapter two."A Business man"',
    route: "/man-of-god-ch3",
    audioFile: "mog Cp2.wav",
    readingId: 1603,
  },
  {
    week: 4,
    title: "Chapter Three “A leading man.”",
    route: "/man-of-god-ch4",
    audioFile: "mog Cp3.wav",
    readingId: 1604,
  },
  {
    week: 5,
    title: "Chapter Four “A New Man.”",
    route: "/man-of-god-ch5",
    audioFile: "mog Cp4.wav",
    readingId: 1605,
  },
  {
    week: 6,
    title: "Don’t mess with God‘s glory",
    route: "/man-of-god-ch6",
    audioFile: "mog Cp5.wav",
    readingId: 1606,
  },
  {
    week: 7,
    title: "Don’t mess with Gods girls",
    route: "/man-of-god-ch7",
    audioFile: "mog Cp6.wav",
    readingId: 1607,
  },
  {
    week: 8,
    title: "Don't Mess With Gods Gold",
    route: "/man-of-god-ch8",
    audioFile: "mog Cp7.wav",
    readingId: 1608,
  },
  {
    week: 9,
    title: "Don't Mess With Gods Gifts",
    route: "/man-of-god-ch9",
    audioFile: "mog Cp8.wav",
    readingId: 1609,
  },
  {
    week: 10,
    title: "Course Conclusion “A real man.”",
    route: "/man-of-god-ch10",
    audioFile: "mog Cp9.wav",
    readingId: 1610,
  },
];

export function getManOfGodChapter(week: number): ManOfGodChapter | undefined {
  return MAN_OF_GOD_CHAPTERS.find((c) => c.week === week);
}

export function getManOfGodReadingIds(week: number): number[] {
  const chapter = getManOfGodChapter(week);
  return chapter ? [chapter.readingId] : [];
}

export const MAN_OF_GOD_READING_SCHEDULE = MAN_OF_GOD_CHAPTERS.map(({ week, title, route }) => ({
  week,
  title,
  route,
}));
