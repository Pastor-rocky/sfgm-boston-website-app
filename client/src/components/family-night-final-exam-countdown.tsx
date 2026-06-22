import { useEffect, useState } from "react";
import {
  formatFinalExamCountdown,
  getFinalExamCountdownParts,
  type FinalExamCountdown,
} from "@shared/family-night";

export function useFinalExamCountdown(): FinalExamCountdown {
  const [parts, setParts] = useState(() => getFinalExamCountdownParts());

  useEffect(() => {
    const tick = () => setParts(getFinalExamCountdownParts());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return parts;
}

type FamilyNightFinalExamCountdownProps = {
  className?: string;
  showOpensLabel?: boolean;
};

export default function FamilyNightFinalExamCountdown({
  className = "",
  showOpensLabel = true,
}: FamilyNightFinalExamCountdownProps) {
  const countdown = useFinalExamCountdown();

  if (countdown.isOpen) {
    return null;
  }

  return (
    <div className={className}>
      {showOpensLabel ? (
        <p className="text-xs text-amber-200/90 mb-2">Opens Wednesday at 9:00 PM ET</p>
      ) : null}
      <div className="inline-flex items-center gap-2 rounded-lg bg-black/30 border border-amber-400/30 px-3 py-2">
        <span className="text-[10px] uppercase tracking-wider text-amber-300/80">Starts in</span>
        <span className="font-mono text-lg font-semibold text-amber-100 tabular-nums">
          {formatFinalExamCountdown(countdown)}
        </span>
      </div>
    </div>
  );
}
