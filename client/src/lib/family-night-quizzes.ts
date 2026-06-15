/** Family Night quiz slugs and numeric IDs (220+) */
export const FAMILY_NIGHT_QUIZ_SLUGS: Record<string, number> = {
  "family-night-faith-week-1": 220,
  "family-night-faith-week-2": 232,
};

export function isFamilyNightQuizParam(param: string | undefined): boolean {
  if (!param) return false;
  if (param in FAMILY_NIGHT_QUIZ_SLUGS) return true;
  const n = Number(param);
  return !Number.isNaN(n) && Object.values(FAMILY_NIGHT_QUIZ_SLUGS).includes(n);
}

export function getFamilyNightReturnPath(): string {
  return "/family-night";
}
