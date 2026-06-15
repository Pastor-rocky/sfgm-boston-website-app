import { lazy } from "react";

/**
 * ROUTE AUTHORING GUIDE (Cursor Only)
 * ----------------------------------
 * - Add or remove routes by editing the grouped arrays below; Cursor is the
 *   single source of truth for routing changes.
 * - Each entry is lazy-loaded via React.lazy so the main bundle stays lean.
 * - Pick the group that best matches the page type (marketing, student, auth,
 *   ebooks, or course content) and append a `createRoute("/path", () => import("@/pages/..."))`.
 * - When new course pages are generated, add their paths here instead of
 *   touching App.tsx directly.
 */

export type RouteDefinition = {
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
};

const createRoute = (
  path: string,
  importer: () => Promise<{ default: React.ComponentType<any> }>,
): RouteDefinition => ({
  path,
  component: lazy(importer),
});

export const marketingRoutes: RouteDefinition[] = [
  createRoute("/", () => import("@/pages/landing")),
  createRoute("/bible-school", () => import("@/pages/bible-school")),
  createRoute("/bible-university", () => import("@/pages/bible-university")),
  createRoute("/sfgm-orlando", () => import("@/pages/sfgm-orlando")),
  createRoute("/statement-of-faith", () => import("@/pages/statement-of-faith")),
  createRoute("/music", () => import("@/pages/music")),
  createRoute("/contact", () => import("@/pages/contact")),
  createRoute("/discussion-forum", () => import("@/pages/discussion-forum")),
  createRoute("/forum/post/:postId", () => import("@/pages/forum-post-detail")),
  createRoute("/instructor-application", () => import("@/pages/instructor-application")),
  createRoute("/online-services", () => import("@/pages/online-services")),
  createRoute("/privacy-policy", () => import("@/pages/privacy-policy")),
  createRoute("/terms-and-conditions", () => import("@/pages/terms-and-conditions")),
  createRoute("/family-night", () => import("@/pages/family-night")),
  createRoute("/genesis-to-revelation", () => import("@/pages/family-night")),
  createRoute("/live-service", () => import("@/pages/live-service")),
  createRoute("/past-services", () => import("@/pages/past-services")),
  createRoute("/textbook-catalog", () => import("@/pages/textbook-catalog")),
  createRoute("/book-suggestions", () => import("@/pages/book-suggestions")),
  createRoute("/events", () => import("@/pages/events")),
  createRoute("/cross-carriers-blog", () => import("@/pages/cross-carriers-blog")),
  createRoute("/pdf-download", () => import("@/pages/pdf-download")),
  createRoute("/course-catalog", () => import("@/pages/course-catalog")),
  createRoute("/bible-courses", () => import("@/pages/bible-school")),
  createRoute("/daily-sharpening", () => import("@/pages/daily-sharpening")),
  createRoute("/previous-services-blogs", () => import("@/pages/previous-services-blogs")),
  createRoute("/watchmen-series", () => import("@/pages/watchmen-series")),
  createRoute("/true-encounter-series", () => import("@/pages/true-encounter-series")),
  createRoute("/perception-series", () => import("@/pages/perception-series")),
  createRoute("/midweek-services", () => import("@/pages/midweek-services")),
  createRoute("/bible-study-tools", () => import("@/pages/bible-study-tools-new")),
  createRoute("/deacon-certificate-generator", () => import("@/pages/deacon-certificate-generator")),
];

export const studentRoutes: RouteDefinition[] = [
  createRoute("/dashboard", () => import("@/pages/student-dashboard")),
  createRoute("/student-profile", () => import("@/pages/student-profile")),
  createRoute("/student-progress", () => import("@/pages/student-progress")),
  createRoute("/profile", () => import("@/pages/profile")),
  createRoute("/course-instructions/:courseId", () => import("@/pages/course-instructions")),
  createRoute("/course/:id", () => import("@/pages/course-detail")),
  createRoute("/courses/:id", () => import("@/pages/course-detail")),
  createRoute("/quiz/:id", () => import("@/pages/quiz-take")),
  createRoute("/student-grades", () => import("@/pages/student-grades")),
  createRoute("/message-student", () => import("@/pages/message-student")),
  createRoute("/student-management", () => import("@/pages/student-management")),
  createRoute("/my-certificates", () => import("@/pages/my-certificates")),
  createRoute("/my-personal-library", () => import("@/pages/my-personal-library")),
  createRoute("/admin-panel", () => import("@/pages/admin-panel")),
  createRoute("/instructor-dashboard", () => import("@/pages/instructor-dashboard")),
];

export const authRoutes: RouteDefinition[] = [
  createRoute("/login", () => import("@/pages/login")),
  createRoute("/register", () => import("@/pages/register")),
  createRoute("/logout", () => import("@/pages/logout")),
];

export const ebookRoutes: RouteDefinition[] = [
  createRoute("/acts-in-action-ebook", () => import("@/pages/acts-in-action-ebook")),
  createRoute("/dont-be-a-jonah-complete-book", () => import("@/pages/dont-be-a-jonah-complete-book")),
  createRoute("/becoming-a-firestarter-complete-ebook", () => import("@/pages/becoming-a-firestarter-complete-ebook")),
  createRoute("/studying-for-service-complete-ebook", () => import("@/pages/studying-for-service-complete-ebook")),
  createRoute("/grow-complete-ebook", () => import("@/pages/grow-complete-ebook")),
  createRoute("/deacon-course-complete-ebook", () => import("@/pages/deacon-course-complete-ebook")),
  createRoute("/youth-ministry-complete-ebook", () => import("@/pages/youth-ministry-complete-ebook")),
  createRoute("/man-of-god-complete-ebook", () => import("@/pages/man-of-god-complete-ebook")),
  createRoute("/choosing-your-future-complete-ebook", () => import("@/pages/choosing-your-future-complete-ebook")),
  createRoute("/only-time-could-tell-complete-ebook", () => import("@/pages/only-time-could-tell-complete-ebook")),
];

export const audioAndCourseContentRoutes: RouteDefinition[] = [
  createRoute("/acts-audio-player", () => import("@/pages/acts-audio-player")),
  createRoute("/acts-audio-player-ch1", () => import("@/pages/acts-audio-player")),
  createRoute("/acts-audio-player-ch2", () => import("@/pages/acts-audio-player-ch2")),
  createRoute("/acts-audio-player-ch3", () => import("@/pages/acts-audio-player-ch3")),
  createRoute("/acts-audio-player-ch4", () => import("@/pages/acts-audio-player-ch4")),
  createRoute("/acts-audio-player-ch5", () => import("@/pages/acts-audio-player-ch5")),
  createRoute("/acts-audio-player-ch6", () => import("@/pages/acts-audio-player-ch6")),
  createRoute("/acts-audio-player-ch7", () => import("@/pages/acts-audio-player-ch7")),
  createRoute("/acts-audio-player-ch8", () => import("@/pages/acts-audio-player-ch8")),
  createRoute("/acts-audio-player-ch9", () => import("@/pages/acts-audio-player-ch9")),
  createRoute("/acts-audio-player-ch10", () => import("@/pages/acts-audio-player-ch10")),
  createRoute("/dont-be-a-jonah-player-ch1", () => import("@/pages/dont-be-a-jonah-player-ch1")),
  createRoute("/dont-be-a-jonah-player-ch2", () => import("@/pages/dont-be-a-jonah-player-ch2")),
  createRoute("/dont-be-a-jonah-player-ch3", () => import("@/pages/dont-be-a-jonah-player-ch3")),
  createRoute("/dont-be-a-jonah-player-ch4", () => import("@/pages/dont-be-a-jonah-player-ch4")),
  createRoute("/dont-be-a-jonah-player-ch5", () => import("@/pages/dont-be-a-jonah-player-ch5")),
  createRoute("/dont-be-a-jonah-player-ch6", () => import("@/pages/dont-be-a-jonah-player-ch6")),
  createRoute("/dont-be-a-jonah-player-ch7", () => import("@/pages/dont-be-a-jonah-player-ch7")),
  createRoute("/dont-be-a-jonah-player-ch8", () => import("@/pages/dont-be-a-jonah-player-ch8")),
  createRoute("/dont-be-a-jonah-player-ch9", () => import("@/pages/dont-be-a-jonah-player-ch9")),
  createRoute("/dont-be-a-jonah-player-ch10", () => import("@/pages/dont-be-a-jonah-player-ch10")),
  createRoute("/dont-be-a-jonah-player-ch11", () => import("@/pages/dont-be-a-jonah-player-ch11")),
  createRoute("/becoming-a-firestarter-ch1", () => import("@/pages/becoming-a-firestarter-ch1")),
  createRoute("/becoming-a-firestarter-ch2", () => import("@/pages/becoming-a-firestarter-ch2")),
  createRoute("/becoming-a-firestarter-ch3", () => import("@/pages/becoming-a-firestarter-ch3")),
  createRoute("/becoming-a-firestarter-ch4", () => import("@/pages/becoming-a-firestarter-ch4")),
  createRoute("/becoming-a-firestarter-ch5", () => import("@/pages/becoming-a-firestarter-ch5")),
  createRoute("/becoming-a-firestarter-ch6", () => import("@/pages/becoming-a-firestarter-ch6")),
  createRoute("/becoming-a-firestarter-ch7", () => import("@/pages/becoming-a-firestarter-ch7")),
  createRoute("/becoming-a-firestarter-ch8", () => import("@/pages/becoming-a-firestarter-ch8")),
  createRoute("/becoming-a-firestarter-ch9", () => import("@/pages/becoming-a-firestarter-ch9")),
  createRoute("/becoming-a-firestarter-ch10", () => import("@/pages/becoming-a-firestarter-ch10")),
  createRoute("/studying-for-service-ch1", () => import("@/pages/studying-for-service-ch1")),
  createRoute("/studying-for-service-ch2", () => import("@/pages/studying-for-service-ch2")),
  createRoute("/studying-for-service-ch3", () => import("@/pages/studying-for-service-ch3")),
  createRoute("/studying-for-service-ch4", () => import("@/pages/studying-for-service-ch4")),
  createRoute("/studying-for-service-ch5", () => import("@/pages/studying-for-service-ch5")),
  createRoute("/studying-for-service-ch6", () => import("@/pages/studying-for-service-ch6")),
  createRoute("/studying-for-service-ch7", () => import("@/pages/studying-for-service-ch7")),
  createRoute("/studying-for-service-ch8", () => import("@/pages/studying-for-service-ch8")),
  createRoute("/studying-for-service-ch9", () => import("@/pages/studying-for-service-ch9")),
  createRoute("/studying-for-service-ch10", () => import("@/pages/studying-for-service-ch10")),
  createRoute("/studying-for-service-ch11", () => import("@/pages/studying-for-service-ch11")),
  createRoute("/studying-for-service-ch12", () => import("@/pages/studying-for-service-ch12")),
  createRoute("/grow-ch1", () => import("@/pages/grow-ch1")),
  createRoute("/grow-ch2", () => import("@/pages/grow-ch2")),
  createRoute("/grow-ch3", () => import("@/pages/grow-ch3")),
  createRoute("/grow-ch4", () => import("@/pages/grow-ch4")),
  createRoute("/deacon-course-ch1", () => import("@/pages/deacon-course-ch1")),
  createRoute("/deacon-course-ch2", () => import("@/pages/deacon-course-ch2")),
  createRoute("/deacon-course-ch3", () => import("@/pages/deacon-course-ch3")),
  createRoute("/deacon-course-ch4", () => import("@/pages/deacon-course-ch4")),
  createRoute("/deacon-course-ch5", () => import("@/pages/deacon-course-ch5")),
  createRoute("/youth-ministry-course-ch1", () => import("@/pages/youth-ministry-course-ch1")),
  createRoute("/youth-ministry-course-ch2", () => import("@/pages/youth-ministry-course-ch2")),
  createRoute("/youth-ministry-course-ch3", () => import("@/pages/youth-ministry-course-ch3")),
  createRoute("/youth-ministry-course-ch4", () => import("@/pages/youth-ministry-course-ch4")),
  createRoute("/youth-ministry-course-ch5", () => import("@/pages/youth-ministry-course-ch5")),
  createRoute("/level-up-leadership-week1", () => import("@/pages/level-up-leadership-week1")),
  createRoute("/level-up-leadership-week2", () => import("@/pages/level-up-leadership-week2")),
  createRoute("/level-up-leadership-week3", () => import("@/pages/level-up-leadership-week3")),
  createRoute("/level-up-leadership-week4", () => import("@/pages/level-up-leadership-week4")),
  createRoute("/level-up-leadership-week5", () => import("@/pages/level-up-leadership-week5")),
  createRoute("/level-up-leadership-week6", () => import("@/pages/level-up-leadership-week6")),
  createRoute("/man-of-god", () => import("@/pages/man-of-god")),
  createRoute("/man-of-god-ch1", () => import("@/pages/man-of-god-ch1")),
  createRoute("/man-of-god-ch2", () => import("@/pages/man-of-god-ch2")),
  createRoute("/man-of-god-ch3", () => import("@/pages/man-of-god-ch3")),
  createRoute("/man-of-god-ch4", () => import("@/pages/man-of-god-ch4")),
  createRoute("/man-of-god-ch5", () => import("@/pages/man-of-god-ch5")),
  createRoute("/man-of-god-ch6", () => import("@/pages/man-of-god-ch6")),
  createRoute("/man-of-god-ch7", () => import("@/pages/man-of-god-ch7")),
  createRoute("/man-of-god-ch8", () => import("@/pages/man-of-god-ch8")),
  createRoute("/man-of-god-ch9", () => import("@/pages/man-of-god-ch9")),
  createRoute("/man-of-god-ch10", () => import("@/pages/man-of-god-ch10")),
];

export const catchAllRoute = lazy(() => import("@/pages/not-found"));

