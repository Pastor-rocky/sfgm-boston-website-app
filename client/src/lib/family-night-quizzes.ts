/** Family Night quiz slugs and numeric IDs (220+) */
export const FAMILY_NIGHT_QUIZ_SLUGS: Record<string, number> = {
  "family-night-faith-week-1": 220,
};

export function isFamilyNightQuizParam(param: string | undefined): boolean {
  if (!param) return false;
  if (param in FAMILY_NIGHT_QUIZ_SLUGS) return true;
  const n = Number(param);
  return !Number.isNaN(n) && n >= 220 && n < 230;
}

export function getFamilyNightReturnPath(): string {
  return "/family-night";
}
