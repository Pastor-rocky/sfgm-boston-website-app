/**
 * Family Night prize boards (men's / women's) — separate from overall leader.
 * Overall rank includes everyone; a woman can hold the top overall spot.
 *
 * Priority: first-name list → profile gender → men's board (unknown names).
 * Feminine names override a wrong "Male" profile (common in this app).
 */

const FEMININE_FIRST_NAMES = new Set(
  [
    // SFGM Boston students & ministry
    "ashley",
    "audrey",
    "theresa",
    "teresa",
    "pebbles",
    "nikkie",
    "nikki",
    "niki",
    "hazel",
    "april",
    // Common feminine names
    "abigail",
    "alice",
    "amy",
    "andrea",
    "angela",
    "ann",
    "anna",
    "barbara",
    "betty",
    "brenda",
    "brittany",
    "carol",
    "carolyn",
    "cheryl",
    "christina",
    "deborah",
    "debra",
    "diana",
    "donna",
    "dorothy",
    "elizabeth",
    "emily",
    "evelyn",
    "faith",
    "frances",
    "gloria",
    "grace",
    "hannah",
    "heather",
    "helen",
    "hope",
    "jacqueline",
    "janet",
    "janice",
    "jean",
    "jennifer",
    "jessica",
    "joyce",
    "judith",
    "judy",
    "julia",
    "karen",
    "katherine",
    "kathryn",
    "kayla",
    "kelly",
    "kimberly",
    "lauren",
    "leah",
    "lillian",
    "linda",
    "lisa",
    "madison",
    "margaret",
    "maria",
    "martha",
    "mary",
    "megan",
    "melissa",
    "michelle",
    "natalie",
    "nancy",
    "nicole",
    "pamela",
    "patricia",
    "rachel",
    "rebecca",
    "rose",
    "ruth",
    "samantha",
    "sandra",
    "sara",
    "sharon",
    "sophia",
    "stephanie",
    "susan",
    "tiffany",
    "victoria",
  ].map((n) => n.toLowerCase()),
);

const MASCULINE_FIRST_NAMES = new Set(
  [
    // SFGM Boston students & ministry
    "angelo",
    "andrew",
    "anthony",
    "bear",
    "cody",
    "derek",
    "elijah",
    "joseph",
    "joshua",
    "joey",
    "luke",
    "nathan",
    "nick",
    "nickolas",
    "nicholas",
    "nickalas",
    "phillip",
    "philip",
    "rocky",
    "steve",
    "steven",
    // Common masculine names
    "aaron",
    "adam",
    "alan",
    "albert",
    "alexander",
    "benjamin",
    "bobby",
    "brandon",
    "brian",
    "bruce",
    "carl",
    "charles",
    "chris",
    "christopher",
    "daniel",
    "david",
    "dennis",
    "donald",
    "douglas",
    "edward",
    "eric",
    "eugene",
    "frank",
    "gary",
    "george",
    "gerald",
    "gregory",
    "harold",
    "henry",
    "jack",
    "james",
    "jason",
    "jeffrey",
    "jeremy",
    "jerry",
    "jesse",
    "jim",
    "jimmy",
    "john",
    "johnny",
    "jonathan",
    "jordan",
    "jose",
    "justin",
    "keith",
    "kenneth",
    "kevin",
    "larry",
    "lawrence",
    "louis",
    "mark",
    "martin",
    "matthew",
    "michael",
    "patrick",
    "paul",
    "peter",
    "philip",
    "ralph",
    "raymond",
    "richard",
    "robert",
    "roger",
    "ronald",
    "roy",
    "russell",
    "ryan",
    "samuel",
    "scott",
    "sean",
    "stephen",
    "steven",
    "terry",
    "thomas",
    "timothy",
    "tyler",
    "walter",
    "wayne",
    "william",
    "zachary",
  ].map((n) => n.toLowerCase()),
);

function normalizeFirstName(
  firstName: string | null | undefined,
  displayName?: string | null,
): string {
  const fromProfile = (firstName || "").trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  if (fromProfile) return fromProfile;
  return (displayName || "").trim().split(/\s+/)[0]?.toLowerCase() ?? "";
}

export type LeaderboardPrizeBoard = "women" | "men";

/** Which prize track (men's jerky / women's flowers) — not used for overall rank. */
export function classifyLeaderboardPrizeBoard(
  firstName: string | null | undefined,
  gender: string | null | undefined,
  displayName?: string | null,
): LeaderboardPrizeBoard {
  const token = normalizeFirstName(firstName, displayName);

  if (token && FEMININE_FIRST_NAMES.has(token)) return "women";
  if (token && MASCULINE_FIRST_NAMES.has(token)) return "men";
  if (gender === "Female") return "women";
  if (gender === "Male") return "men";

  // Unknown / unisex first name — men's prize board unless profile says Female
  return "men";
}

export function isFeminineFirstName(
  firstName: string | null | undefined,
  displayName?: string | null,
): boolean {
  const token = normalizeFirstName(firstName, displayName);
  return token ? FEMININE_FIRST_NAMES.has(token) : false;
}

export function isMasculineFirstName(
  firstName: string | null | undefined,
  displayName?: string | null,
): boolean {
  const token = normalizeFirstName(firstName, displayName);
  return token ? MASCULINE_FIRST_NAMES.has(token) : false;
}

export function isWomanForLeaderboard(
  firstName: string | null | undefined,
  gender: string | null | undefined,
  displayName?: string | null,
): boolean {
  return classifyLeaderboardPrizeBoard(firstName, gender, displayName) === "women";
}

export function isManForLeaderboard(
  firstName: string | null | undefined,
  gender: string | null | undefined,
  displayName?: string | null,
): boolean {
  return classifyLeaderboardPrizeBoard(firstName, gender, displayName) === "men";
}
