export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  location?: string;
  description?: string;
}

function calendarEnabled(): boolean {
  return (process.env.GOOGLE_CALENDAR_ENABLED || "").toLowerCase() === "true";
}

export function getGoogleCalendarEmbedUrl(): string | null {
  const embed = process.env.GOOGLE_CALENDAR_EMBED_URL?.trim();
  if (embed) return embed;

  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim();
  if (!calendarId) return null;

  return `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}&ctz=America%2FNew_York`;
}

function parseIcsDate(value: string): string {
  if (value.includes("T")) {
    const y = value.slice(0, 4);
    const m = value.slice(4, 6);
    const d = value.slice(6, 8);
    const h = value.slice(9, 11);
    const min = value.slice(11, 13);
    const sec = value.slice(13, 15);
    return new Date(`${y}-${m}-${d}T${h}:${min}:${sec}Z`).toISOString();
  }

  const y = value.slice(0, 4);
  const m = value.slice(4, 6);
  const d = value.slice(6, 8);
  return new Date(`${y}-${m}-${d}T12:00:00`).toISOString();
}

function unfoldIcsLines(text: string): string[] {
  const raw = text.replace(/\r\n/g, "\n").split("\n");
  const lines: string[] = [];
  for (const line of raw) {
    if (line.startsWith(" ") || line.startsWith("\t")) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
  }
  return lines;
}

export async function fetchPublicCalendarEvents(limit = 12): Promise<CalendarEvent[]> {
  if (!calendarEnabled()) return [];

  const icalUrl = process.env.GOOGLE_CALENDAR_ICAL_URL?.trim();
  if (!icalUrl) return [];

  const response = await fetch(icalUrl);
  if (!response.ok) {
    throw new Error(`Calendar feed failed (${response.status})`);
  }

  const text = await response.text();
  const lines = unfoldIcsLines(text);
  const events: CalendarEvent[] = [];
  let current: Partial<CalendarEvent> | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (line === "END:VEVENT" && current) {
      if (current.id && current.title && current.start) {
        events.push(current as CalendarEvent);
      }
      current = null;
      continue;
    }
    if (!current) continue;

    if (line.startsWith("UID:")) current.id = line.slice(4).trim();
    if (line.startsWith("SUMMARY:")) current.title = line.slice(8).trim();
    if (line.startsWith("DTSTART")) {
      const value = line.split(":").pop()?.trim() || "";
      current.start = parseIcsDate(value);
    }
    if (line.startsWith("DTEND")) {
      const value = line.split(":").pop()?.trim() || "";
      current.end = parseIcsDate(value);
    }
    if (line.startsWith("LOCATION:")) current.location = line.slice(9).trim();
    if (line.startsWith("DESCRIPTION:")) current.description = line.slice(12).trim();
  }

  const now = Date.now();
  return events
    .filter((event) => new Date(event.start).getTime() >= now - 24 * 60 * 60 * 1000)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, limit);
}

export function getGoogleCalendarConfigStatus() {
  return {
    enabled: calendarEnabled(),
    configured: Boolean(getGoogleCalendarEmbedUrl() || process.env.GOOGLE_CALENDAR_ICAL_URL),
  };
}
