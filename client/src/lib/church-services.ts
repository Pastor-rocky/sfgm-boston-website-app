/** Canonical SFGM Boston service schedule — keep in sync across footer, hero, events, etc. */

export const CHURCH_ADDRESS = "6 Bourbon St., Peabody, MA 01960";

export type ChurchService = {
  id: string;
  label: string;
  dayLabel: string;
  time: string;
  footerLine: string;
  icon: string;
  description?: string;
  href?: string;
  /** 0 = Sunday … 6 = Saturday */
  dayOfWeek?: number;
  hour?: number;
  minute?: number;
};

export const CHURCH_SERVICES: ChurchService[] = [
  {
    id: "street-ministry",
    label: "Street Ministry",
    dayLabel: "Sundays",
    time: "11:00 AM",
    footerLine: "Street Ministry - Sunday 11:00 AM",
    icon: "fas fa-road",
    description: "Outreach and ministry in the community every Sunday morning.",
    dayOfWeek: 0,
    hour: 11,
    minute: 0,
  },
  {
    id: "sunday-worship",
    label: "Sunday Worship",
    dayLabel: "Sundays",
    time: "7:30 PM",
    footerLine: "Sunday Worship - 7:30 PM",
    icon: "fas fa-church",
    description: "Live worship with inspiring messages and community fellowship.",
    href: "/past-services",
    dayOfWeek: 0,
    hour: 19,
    minute: 30,
  },
  {
    id: "family-night",
    label: "Wednesday Midweek Family Night",
    dayLabel: "Wednesdays",
    time: "9:00 PM",
    footerLine: "Wednesday Midweek Family Night - 9:00 PM",
    icon: "fas fa-users",
    description:
      "Midweek Family Night teachings with weekly quizzes and a monthly speed leaderboard.",
    href: "/family-night",
    dayOfWeek: 3,
    hour: 21,
    minute: 0,
  },
  {
    id: "young-mens-bible-study",
    label: "Young Men's Bible Study & Studying for Service",
    dayLabel: "Fridays",
    time: "9:00 PM",
    footerLine: "Friday Young Men's Bible Study & Studying for Service - 9:00 PM",
    icon: "fas fa-male",
    description:
      "Young men's Bible study and Studying for Service — growing in the Word and preparing to serve.",
    dayOfWeek: 5,
    hour: 21,
    minute: 0,
  },
  {
    id: "womens-bible-study",
    label: "Women's Bible Study",
    dayLabel: "Saturdays",
    time: "9:00 PM",
    footerLine: "Women's Bible Study - Saturdays 9:00 PM",
    icon: "fas fa-female",
    description:
      "A dedicated time in the Word for women to study, pray, and encourage one another.",
    dayOfWeek: 6,
    hour: 21,
    minute: 0,
  },
];

/** Optional programs (not shown in footer unless added here) */
export const CHURCH_PROGRAMS: ChurchService[] = [];

export const FOOTER_SERVICE_LINES: string[] = CHURCH_SERVICES.map((s) => s.footerLine);

export function formatServiceSchedule(service: ChurchService): string {
  if (service.dayLabel && service.time) {
    return `${service.dayLabel} at ${service.time} — ${CHURCH_ADDRESS}`;
  }
  if (service.dayLabel) {
    return `${service.dayLabel} — ${CHURCH_ADDRESS}`;
  }
  return `${service.label} — ${service.time}`;
}

export function getServiceById(id: string): ChurchService | undefined {
  return [...CHURCH_SERVICES, ...CHURCH_PROGRAMS].find((s) => s.id === id);
}

/** Countdown helper: next occurrence of a weekly service */
export function getNextServiceDate(
  dayOfWeek: number,
  hour: number,
  minute: number,
  from: Date = new Date(),
): Date {
  const next = new Date(from);
  const currentDay = from.getDay();
  const beforeServiceToday =
    currentDay === dayOfWeek &&
    (from.getHours() < hour ||
      (from.getHours() === hour && from.getMinutes() < minute));

  if (beforeServiceToday) {
    next.setHours(hour, minute, 0, 0);
    return next;
  }

  let daysUntil = dayOfWeek - currentDay;
  if (daysUntil <= 0) {
    daysUntil += 7;
  }
  next.setDate(from.getDate() + daysUntil);
  next.setHours(hour, minute, 0, 0);
  return next;
}

export type ServiceCountdown = {
  days: number;
  hours: number;
  minutes: number;
  isHappeningNow: boolean;
  nextDate: Date;
};

export function getServiceCountdown(
  service: ChurchService,
  from: Date = new Date(),
): ServiceCountdown | null {
  if (
    service.dayOfWeek === undefined ||
    service.hour === undefined ||
    service.minute === undefined
  ) {
    return null;
  }

  const nextDate = getNextServiceDate(
    service.dayOfWeek,
    service.hour,
    service.minute,
    from,
  );
  const diff = nextDate.getTime() - from.getTime();

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      isHappeningNow: true,
      nextDate,
    };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    isHappeningNow: false,
    nextDate,
  };
}

export function formatCountdownParts(countdown: ServiceCountdown): string {
  if (countdown.isHappeningNow) return "Happening now!";
  return `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m`;
}
