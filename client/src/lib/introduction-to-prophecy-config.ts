import { introductionToProphecyChapters } from "@shared/introduction-to-prophecy-content";
import { INTRODUCTION_TO_PROPHECY_CHAPTER_ROUTES } from "@shared/introduction-to-prophecy-course";
import { getCourseWeekReadingIds } from "@shared/course-reading-ids";

function chapterLabel(title: string, subtitle: string): string {
  if (title === "Introduction") return "Introduction";
  if (subtitle) return `${title}: ${subtitle}`;
  return title;
}

export const INTRODUCTION_TO_PROPHECY_READING_SCHEDULE = introductionToProphecyChapters.map(
  (chapter) => ({
    week: chapter.id,
    title: chapterLabel(chapter.title, chapter.subtitle),
    route: INTRODUCTION_TO_PROPHECY_CHAPTER_ROUTES[chapter.id],
  }),
);

export function getIntroductionToProphecyReadingIds(weekNumber: number): number[] {
  return getCourseWeekReadingIds(10, weekNumber);
}

export const INTRODUCTION_TO_PROPHECY_COURSE_NAME = "Introduction to Prophecy";
