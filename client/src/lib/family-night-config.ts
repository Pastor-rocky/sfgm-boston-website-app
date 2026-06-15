/**
 * Family Night monthly cycle content.
 * Update videoUrl values when new teachings are ready.
 */

export type FamilyNightVideo = {
  week: number;
  title: string;
  subtitle: string;
  preacher: string;
  description: string;
  videoUrl: string;
  isInstagram: boolean;
  /** Future quiz route slug, e.g. family-night-faith-week-1 */
  quizPath: string | null;
  contentId: number;
};

export type FamilyNightCycle = {
  id: string;
  theme: string;
  monthLabel: string;
  prizeDescription: string;
  weeks: FamilyNightVideo[];
  finalExam: {
    title: string;
    description: string;
    quizPath: string | null;
    contentId: number;
  };
};

/** Used with /api/content-progress when Family Night course exists in DB (optional). */
export const FAMILY_NIGHT_COURSE_ID = 9;

export const CURRENT_FAMILY_NIGHT_CYCLE: FamilyNightCycle = {
  id: "2026-06-faith",
  theme: "Faith",
  monthLabel: "June 2026",
  prizeDescription: "Monthly prize awarded to overall, men's, and women's champions",
  weeks: [
    {
      week: 1,
      title: "Teaching 1",
      subtitle: "Faith — Part 1",
      preacher: "TBD",
      description: "First Family Night teaching for our Faith series.",
      videoUrl: "https://www.instagram.com/p/DZJaNtOjlNp/",
      isInstagram: true,
      quizPath: "/quiz/220",
      contentId: 101,
    },
    {
      week: 2,
      title: "Teaching 2",
      subtitle: "Faith — Part 2",
      preacher: "TBD",
      description: "Second Family Night teaching for our Faith series.",
      videoUrl: "https://www.instagram.com/p/DZbdDY9DnP-/",
      isInstagram: true,
      quizPath: "/quiz/232",
      contentId: 102,
    },
    {
      week: 3,
      title: "Teaching 3",
      subtitle: "Faith — Part 3",
      preacher: "TBD",
      description: "Third teaching — posted after Week 2.",
      videoUrl: "",
      isInstagram: false,
      quizPath: null,
      contentId: 103,
    },
  ],
  finalExam: {
    title: "Faith Final Exam",
    description: "Monthly championship exam — unlocks after all three teachings are watched.",
    quizPath: null,
    contentId: 104,
  },
};

export function getVideoEmbedUrl(url: string, isInstagram: boolean = false): string {
  if (!url) return "";
  if (isInstagram && url.includes("instagram.com/p/")) {
    const postId = url.split("/p/")[1]?.split("/")[0];
    return postId ? `https://www.instagram.com/p/${postId}/embed/` : url;
  }
  if (url.includes("youtube.com/watch") || url.includes("youtu.be/")) {
    const videoId = url.includes("youtu.be/")
      ? url.split("youtu.be/")[1]?.split("?")[0]
      : url.split("v=")[1]?.split("&")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }
  return url;
}
