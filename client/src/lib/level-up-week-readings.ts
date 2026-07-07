export const MAXWELL_BOOK_TITLE = '"The 5 Levels of Leadership" by John C. Maxwell';

export const MAXWELL_OFFLINE_NOTE =
  "Read in your own copy of the book — this text is not available on the SFGM website.";

export type ScripturePassage = {
  id: string;
  reference: string;
  url: string;
};

export type LevelUpWeekReading = {
  pages: string;
  chapterTitle: string;
  passages: ScripturePassage[];
};

export const LEVEL_UP_WEEK_READINGS: Record<number, LevelUpWeekReading> = {
  1: {
    pages: "1–81",
    chapterTitle: "Introduction and Level 1 — Position Leadership",
    passages: [
      { id: "2chron9-31", reference: "2 Chronicles 9:31", url: "https://www.biblegateway.com/passage/?search=2+Chronicles+9%3A31&version=NIV" },
      { id: "2chron10-1-19", reference: "2 Chronicles 10:1-19", url: "https://www.biblegateway.com/passage/?search=2+Chronicles+10%3A1-19&version=NIV" },
      { id: "mark10-35-45", reference: "Mark 10:35-45", url: "https://www.biblegateway.com/passage/?search=Mark+10%3A35-45&version=NIV" },
      { id: "john13-1-17", reference: "John 13:1-17", url: "https://www.biblegateway.com/passage/?search=John+13%3A1-17&version=NIV" },
      { id: "phil2-1-11", reference: "Philippians 2:1-11", url: "https://www.biblegateway.com/passage/?search=Philippians+2%3A1-11&version=NIV" },
    ],
  },
  2: {
    pages: "85–129",
    chapterTitle: "Level 2 — Permission Leadership",
    passages: [
      { id: "1sam18-1-30", reference: "1 Samuel 18:1-30", url: "https://www.biblegateway.com/passage/?search=1+Samuel+18%3A1-30&version=NLT" },
      { id: "1sam20-1-42", reference: "1 Samuel 20:1-42", url: "https://www.biblegateway.com/passage/?search=1+Samuel+20%3A1-42&version=NLT" },
      { id: "1sam23-15-18", reference: "1 Samuel 23:15-18", url: "https://www.biblegateway.com/passage/?search=1+Samuel+23%3A15-18&version=NLT" },
      { id: "isaiah41-8-10", reference: "Isaiah 41:8-10", url: "https://www.biblegateway.com/passage/?search=Isaiah+41%3A8-10&version=NLT" },
      { id: "john15-9-17", reference: "John 15:9-17", url: "https://www.biblegateway.com/passage/?search=John+15%3A9-17&version=NLT" },
      { id: "james2-21-24", reference: "James 2:21-24", url: "https://www.biblegateway.com/passage/?search=James+2%3A21-24&version=NLT" },
      { id: "james4-1-7", reference: "James 4:1-7", url: "https://www.biblegateway.com/passage/?search=James+4%3A1-7&version=NLT" },
    ],
  },
  3: {
    pages: "133–178",
    chapterTitle: "Level 3 — Production Leadership",
    passages: [
      { id: "exodus17-8-16", reference: "Exodus 17:8-16", url: "https://www.biblegateway.com/passage/?search=Exodus+17%3A8-16&version=NLT" },
      { id: "joshua1-1-18", reference: "Joshua 1:1-18", url: "https://www.biblegateway.com/passage/?search=Joshua+1%3A1-18&version=NLT" },
      { id: "joshua6-1-27", reference: "Joshua 6:1-27", url: "https://www.biblegateway.com/passage/?search=Joshua+6%3A1-27&version=NLT" },
      { id: "psalm108-8", reference: "Psalm 108:8", url: "https://www.biblegateway.com/passage/?search=Psalm+108%3A8&version=NLT" },
      { id: "matt6-1-34", reference: "Matthew 6:1-34", url: "https://www.biblegateway.com/passage/?search=Matthew+6%3A1-34&version=NLT" },
      { id: "john12-23-33", reference: "John 12:23-33", url: "https://www.biblegateway.com/passage/?search=John+12%3A23-33&version=NLT" },
      { id: "john15-1-9", reference: "John 15:1-9", url: "https://www.biblegateway.com/passage/?search=John+15%3A1-9&version=NLT" },
      { id: "john15-16-17", reference: "John 15:16-17", url: "https://www.biblegateway.com/passage/?search=John+15%3A16-17&version=NLT" },
      { id: "gal5-16-26", reference: "Galatians 5:16-26", url: "https://www.biblegateway.com/passage/?search=Galatians+5%3A16-26&version=NLT" },
      { id: "1pet1-22-25", reference: "1 Peter 1:22-25", url: "https://www.biblegateway.com/passage/?search=1+Peter+1%3A22-25&version=NLT" },
      { id: "1john3-1-10", reference: "1 John 3:1-10", url: "https://www.biblegateway.com/passage/?search=1+John+3%3A1-10&version=NLT" },
    ],
  },
  4: {
    pages: "181–228",
    chapterTitle: "Level 4 — People Development Leadership",
    passages: [
      { id: "gen1-26-28", reference: "Genesis 1:26-28", url: "https://www.biblegateway.com/passage/?search=Genesis+1%3A26-28&version=NKJV" },
      { id: "deut6-6-25", reference: "Deuteronomy 6:6-25", url: "https://www.biblegateway.com/passage/?search=Deuteronomy+6%3A6-25&version=NKJV" },
      { id: "judges2-7-19", reference: "Judges 2:7-19", url: "https://www.biblegateway.com/passage/?search=Judges+2%3A7-19&version=NKJV" },
      { id: "matt28-18-20", reference: "Matthew 28:18-20", url: "https://www.biblegateway.com/passage/?search=Matthew+28%3A18-20&version=NKJV" },
      { id: "luke5-8-11", reference: "Luke 5:8-11", url: "https://www.biblegateway.com/passage/?search=Luke+5%3A8-11&version=NKJV" },
      { id: "1pet5-12-14", reference: "1 Peter 5:12-14", url: "https://www.biblegateway.com/passage/?search=1+Peter+5%3A12-14&version=NKJV" },
      { id: "acts2-1-6", reference: "Acts 2:1-6", url: "https://www.biblegateway.com/passage/?search=Acts+2%3A1-6&version=NKJV" },
      { id: "acts4-13-22", reference: "Acts 4:13-22", url: "https://www.biblegateway.com/passage/?search=Acts+4%3A13-22&version=NKJV" },
      { id: "acts9-1-22", reference: "Acts 9:1-22", url: "https://www.biblegateway.com/passage/?search=Acts+9%3A1-22&version=NKJV" },
      { id: "acts11-19-26", reference: "Acts 11:19-26", url: "https://www.biblegateway.com/passage/?search=Acts+11%3A19-26&version=NKJV" },
      { id: "2tim2-1-2", reference: "2 Timothy 2:1-2", url: "https://www.biblegateway.com/passage/?search=2+Timothy+2%3A1-2&version=NKJV" },
      { id: "2tim3-1-7", reference: "2 Timothy 3:1-7", url: "https://www.biblegateway.com/passage/?search=2+Timothy+3%3A1-7&version=NKJV" },
    ],
  },
  5: {
    pages: "229–286",
    chapterTitle: "Level 5 — Pinnacle Leadership",
    passages: [
      { id: "matt11-1-30", reference: "Matthew 11:1-30", url: "https://www.biblegateway.com/passage/?search=Matthew+11%3A1-30&version=NLT" },
      { id: "matt14-1-12", reference: "Matthew 14:1-12", url: "https://www.biblegateway.com/passage/?search=Matthew+14%3A1-12&version=NLT" },
      { id: "acts6-1-15", reference: "Acts 6:1-15", url: "https://www.biblegateway.com/passage/?search=Acts+6%3A1-15&version=NLT" },
      { id: "acts7-1-60", reference: "Acts 7:1-60", url: "https://www.biblegateway.com/passage/?search=Acts+7%3A1-60&version=NLT" },
      { id: "acts12-1-25", reference: "Acts 12:1-25", url: "https://www.biblegateway.com/passage/?search=Acts+12%3A1-25&version=NLT" },
      { id: "2tim4-1-22", reference: "2 Timothy 4:1-22", url: "https://www.biblegateway.com/passage/?search=2+Timothy+4%3A1-22&version=NLT" },
    ],
  },
};

export const LEVEL_UP_COURSE_WEEK_SUMMARIES = [
  { week: 1, readingId: 601, path: "/level-up-leadership-week1", label: "Position Leadership", pages: "1–81" },
  { week: 2, readingId: 602, path: "/level-up-leadership-week2", label: "Permission Leadership", pages: "85–129" },
  { week: 3, readingId: 603, path: "/level-up-leadership-week3", label: "Production Leadership", pages: "133–178" },
  { week: 4, readingId: 604, path: "/level-up-leadership-week4", label: "People Development Leadership", pages: "181–228" },
  { week: 5, readingId: 605, path: "/level-up-leadership-week5", label: "Pinnacle Leadership", pages: "229–286" },
  { week: 6, readingId: 606, path: "/level-up-leadership-week6", label: "Integration & Application", pages: null },
] as const;
