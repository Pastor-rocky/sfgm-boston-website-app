import { Crown, Medal } from "lucide-react";

export type LeaderboardEntry = {
  rank: number;
  displayName: string;
  scorePercent: number;
  timeSpentMinutes: number;
};

export type LeaderboardChampions = {
  overall: LeaderboardEntry | null;
  men: LeaderboardEntry | null;
  women: LeaderboardEntry | null;
};

export function rankRowClass(rank: number, large = false): string {
  const base = large ? "px-4 py-3 text-base" : "px-2.5 py-2 text-sm";
  if (rank === 1) {
    return `${base} bg-gradient-to-r from-amber-500/35 to-yellow-600/20 border-amber-300/50 shadow-[0_0_12px_rgba(251,191,36,0.25)]`;
  }
  if (rank === 2) {
    return `${base} bg-gradient-to-r from-slate-400/25 to-slate-500/15 border-slate-300/40`;
  }
  if (rank === 3) {
    return `${base} bg-gradient-to-r from-orange-700/30 to-amber-800/20 border-orange-400/35`;
  }
  return `${base} bg-white/5 border-white/10`;
}

function rankBadgeClass(rank: number, large = false): string {
  const size = large ? "min-w-[2.5rem] px-2 py-1 text-sm" : "min-w-[2rem] px-1.5 py-0.5 text-xs";
  if (rank === 1) return `${size} bg-amber-400 text-amber-950`;
  if (rank === 2) return `${size} bg-slate-300 text-slate-900`;
  if (rank === 3) return `${size} bg-orange-400 text-orange-950`;
  return `${size} bg-purple-800/80 text-purple-100`;
}

export function LeaderboardList({
  title,
  entries,
  emptyMessage,
  accentClass = "text-amber-300",
  limit = 5,
  large = false,
}: {
  title: string;
  entries: LeaderboardEntry[];
  emptyMessage: string;
  accentClass?: string;
  limit?: number;
  large?: boolean;
}) {
  return (
    <div className={`rounded-xl border border-white/10 bg-black/25 ${large ? "p-4" : "p-3"}`}>
      <p
        className={`font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5 ${accentClass} ${
          large ? "text-xs" : "text-[11px]"
        }`}
      >
        <Medal className={`shrink-0 ${large ? "h-4 w-4" : "h-3.5 w-3.5"}`} />
        {title}
      </p>
      {entries.length === 0 ? (
        <p className={`text-purple-200/60 px-1 ${large ? "text-sm" : "text-xs"}`}>{emptyMessage}</p>
      ) : (
        <ol className="space-y-2">
          {entries.slice(0, limit).map((entry) => (
            <li
              key={`${title}-${entry.rank}-${entry.displayName}`}
              className={`flex items-center justify-between gap-2 rounded-lg border ${rankRowClass(entry.rank, large)}`}
            >
              <span className={`truncate text-white font-medium ${large ? "text-lg" : ""}`}>
                <span
                  className={`inline-flex justify-center rounded-md font-bold mr-2 ${rankBadgeClass(entry.rank, large)}`}
                >
                  #{entry.rank}
                </span>
                {entry.displayName}
              </span>
              <span
                className={`shrink-0 font-semibold text-amber-100/90 tabular-nums ${
                  large ? "text-sm" : "text-xs"
                }`}
              >
                {Math.round(entry.scorePercent)}%
                <span className="text-purple-200/70 font-normal"> · {entry.timeSpentMinutes}m</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function ChampionCard({
  label,
  champion,
  borderClass,
  labelClass,
  large = false,
}: {
  label: string;
  champion: LeaderboardEntry;
  borderClass: string;
  labelClass: string;
  large?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-gradient-to-br p-4 shadow-lg ${borderClass} ${
        large ? "p-5" : "mb-3 px-3 py-2"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Crown className={`text-amber-300 ${large ? "h-6 w-6" : "h-4 w-4"}`} />
        <p className={`font-bold uppercase tracking-widest ${labelClass} ${large ? "text-sm" : "text-[10px]"}`}>
          {label}
        </p>
      </div>
      <p className={`font-bold text-white ${large ? "text-3xl" : "text-sm"}`}>{champion.displayName}</p>
      <p className={`font-semibold text-amber-100 mt-1 ${large ? "text-lg" : "text-xs"}`}>
        {Math.round(champion.scorePercent)}%
        {large ? ` in ${champion.timeSpentMinutes} min` : ` · ${champion.timeSpentMinutes}m`}
      </p>
    </div>
  );
}

export function LeaderboardPanels({
  champions,
  overall,
  men,
  women,
  large = false,
  overallLimit = 8,
  prizeLimit = 5,
}: {
  champions: LeaderboardChampions;
  overall: LeaderboardEntry[];
  men: LeaderboardEntry[];
  women: LeaderboardEntry[];
  large?: boolean;
  overallLimit?: number;
  prizeLimit?: number;
}) {
  return (
    <div className="space-y-4">
      {champions.overall ? (
        <ChampionCard
          label="Overall leader"
          champion={champions.overall}
          borderClass="border-2 border-amber-300/50 from-amber-500/25 via-yellow-500/15 to-orange-600/10 shadow-[0_0_24px_rgba(251,191,36,0.2)]"
          labelClass="text-amber-200"
          large={large}
        />
      ) : null}

      <LeaderboardList
        title="Overall"
        entries={overall}
        emptyMessage="No final exam attempts yet."
        limit={overallLimit}
        large={large}
      />

      <div className={large ? "grid gap-4 md:grid-cols-2" : "space-y-4"}>
        <div>
          {champions.men ? (
            <ChampionCard
              label="Men's prize leader"
              champion={champions.men}
              borderClass="border-sky-400/35 from-sky-500/10 to-sky-600/5"
              labelClass="text-sky-200"
              large={large}
            />
          ) : null}
          <LeaderboardList
            title="Men's prize board"
            entries={men}
            emptyMessage="No men's entries yet."
            accentClass="text-sky-300"
            limit={prizeLimit}
            large={large}
          />
        </div>
        <div>
          {champions.women ? (
            <ChampionCard
              label="Women's prize leader"
              champion={champions.women}
              borderClass="border-pink-400/35 from-pink-500/10 to-pink-600/5"
              labelClass="text-pink-200"
              large={large}
            />
          ) : null}
          <LeaderboardList
            title="Women's prize board"
            entries={women}
            emptyMessage="No women's entries yet."
            accentClass="text-pink-300"
            limit={prizeLimit}
            large={large}
          />
        </div>
      </div>
    </div>
  );
}
