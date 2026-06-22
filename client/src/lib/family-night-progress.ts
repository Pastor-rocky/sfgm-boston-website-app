import { CURRENT_FAMILY_NIGHT_CYCLE } from "./family-night-config";

const cycleId = CURRENT_FAMILY_NIGHT_CYCLE.id;

function storageKey(userId: string, contentId: number): string {
  return `familyNight:${cycleId}:${userId}:video:${contentId}`;
}

export function isFamilyNightVideoWatched(userId: string | undefined, contentId: number): boolean {
  if (!userId) return false;
  try {
    return localStorage.getItem(storageKey(userId, contentId)) === "1";
  } catch {
    return false;
  }
}

export function markFamilyNightVideoWatched(userId: string, contentId: number): void {
  try {
    localStorage.setItem(storageKey(userId, contentId), "1");
  } catch {
    // ignore quota errors
  }
}

export function getFamilyNightWatchedIds(userId: string | undefined): number[] {
  if (!userId) return [];
  const prefix = `familyNight:${cycleId}:${userId}:video:`;
  const ids: number[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix) && localStorage.getItem(key) === "1") {
        const id = parseInt(key.slice(prefix.length), 10);
        if (!Number.isNaN(id)) ids.push(id);
      }
    }
  } catch {
    return [];
  }
  return ids;
}

export function allTeachingsWatched(userId: string | undefined): boolean {
  if (!userId) return false;
  return CURRENT_FAMILY_NIGHT_CYCLE.weeks.every((w) =>
    w.noVideo || !w.videoUrl ? true : isFamilyNightVideoWatched(userId, w.contentId),
  );
}
