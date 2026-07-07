import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import {
  LEVEL_UP_WEEK_READINGS,
  MAXWELL_BOOK_TITLE,
  MAXWELL_OFFLINE_NOTE,
} from "@/lib/level-up-week-readings";

type LevelUpRequiredReadingProps = {
  weekNumber: number;
};

export default function LevelUpRequiredReading({ weekNumber }: LevelUpRequiredReadingProps) {
  const config = LEVEL_UP_WEEK_READINGS[weekNumber];
  const storageKey = `level-up-week${weekNumber}-read-passages`;
  const [readPassages, setReadPassages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;
    try {
      setReadPassages(new Set(JSON.parse(saved)));
    } catch (e) {
      console.error("Error loading read passages:", e);
    }
  }, [storageKey]);

  useEffect(() => {
    if (readPassages.size > 0) {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(readPassages)));
    }
  }, [readPassages, storageKey]);

  const handlePassageClick = (passageId: string, url: string) => {
    setReadPassages((prev) => new Set([...Array.from(prev), passageId]));
    window.open(url, "_blank");
  };

  if (!config) return null;

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
        <h4 className="text-lg font-semibold text-purple-900 mb-2">{MAXWELL_BOOK_TITLE}</h4>
        <p className="text-purple-800 mb-2 text-sm">{MAXWELL_OFFLINE_NOTE}</p>
        <p className="text-purple-800">
          <strong>Pages {config.pages}:</strong> {config.chapterTitle}
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <h4 className="text-lg font-semibold text-blue-900 mb-3">Scripture Reading</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {config.passages.map((passage) => {
            const isRead = readPassages.has(passage.id);
            return (
              <Button
                key={passage.id}
                onClick={() => handlePassageClick(passage.id, passage.url)}
                variant="outline"
                title={passage.reference}
                className={`h-9 min-w-0 px-2 justify-center text-sm text-blue-700 border-blue-300 hover:bg-blue-100 ${
                  isRead ? "bg-green-50 border-green-400" : ""
                }`}
              >
                {isRead && <CheckCircle2 className="mr-1 h-3.5 w-3.5 shrink-0 text-green-600" />}
                <span className="truncate">{passage.reference}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
