/**
 * SFGM churches with city (abbreviated), state (abbreviated), and default instructor.
 * Used on registration and for instructor default per church.
 */
export interface SfgmChurch {
  church: string;
  city: string;
  state: string;
  defaultInstructor: string;
}

export const SFGM_CHURCHES: SfgmChurch[] = [
  { church: "SFGM Orlando", city: "Orlando", state: "FL", defaultInstructor: "Pastor Anthony Lee" },
  { church: "SFGM Ft. Lauderdale", city: "Ft. Lauderdale", state: "FL", defaultInstructor: "Pastor Mark" },
  { church: "SFGM Atlanta", city: "Atlanta", state: "GA", defaultInstructor: "Pastor Skippy" },
  { church: "SFGM Virginia", city: "Virginia", state: "VA", defaultInstructor: "Pastor Frank" },
  { church: "SFGM Baltimore", city: "Baltimore", state: "MD", defaultInstructor: "Pastor Aaron" },
  { church: "SFGM Columbus", city: "Columbus", state: "OH", defaultInstructor: "Pastor Kevin" },
  { church: "SFGM Pittsburgh", city: "Pittsburgh", state: "PA", defaultInstructor: "Pastor Tommy" },
  { church: "SFGM Cleveland", city: "Cleveland", state: "OH", defaultInstructor: "Pastor Gino" },
  { church: "SFGM New York", city: "New York", state: "NY", defaultInstructor: "Pastor Steve" },
  { church: "SFGM Dallas", city: "Dallas", state: "TX", defaultInstructor: "Pastor Angelo" },
  { church: "SFGM Detroit", city: "Detroit", state: "MI", defaultInstructor: "Pastor Nick" },
  { church: "SFGM Chicago Downtown", city: "Chicago", state: "IL", defaultInstructor: "Pastor David" },
  { church: "SFGM Chicago", city: "Chicago", state: "IL", defaultInstructor: "Pastor Kevin" },
  { church: "SFGM Boston", city: "Boston", state: "MA", defaultInstructor: "Pastor Rocky" },
  { church: "SFGM Arizona", city: "Phoenix", state: "AZ", defaultInstructor: "Pastor John" },
  { church: "SFGM Montana", city: "Billings", state: "MT", defaultInstructor: "Pastor Tiger" },
  { church: "SFGM Salt Lake City", city: "Salt Lake City", state: "UT", defaultInstructor: "Pastor Kevin" },
  { church: "SFGM Temecula", city: "Temecula", state: "CA", defaultInstructor: "Pastor Joe" },
  { church: "SFGM Boise", city: "Boise", state: "ID", defaultInstructor: "Pastor Robert" },
  { church: "SFGM Portland", city: "Portland", state: "OR", defaultInstructor: "Pastor Michael" },
  { church: "SFGM Arlington/Ft. Worth", city: "Arlington", state: "TX", defaultInstructor: "Pastor Angelo" },
];

export function formatChurchOption(c: SfgmChurch): string {
  return `${c.church} (${c.city}, ${c.state}) — ${c.defaultInstructor}`;
}

export function getChurchByValue(value: string): SfgmChurch | undefined {
  return SFGM_CHURCHES.find((c) => c.church === value);
}
