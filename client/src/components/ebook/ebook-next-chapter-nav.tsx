import type { Dispatch, SetStateAction } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChapterWithTitle = {
  title: string;
};

export function scrollEbookToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function getEbookNextChapterLabel(
  chapters: ChapterWithTitle[],
  currentChapter: number,
): string {
  return chapters[currentChapter]?.title ?? "";
}

export function goToNextEbookChapter(
  totalChapters: number,
  setCurrentChapter: Dispatch<SetStateAction<number>>,
) {
  setCurrentChapter((chapter) => {
    if (chapter >= totalChapters) {
      return chapter;
    }
    return chapter + 1;
  });
  scrollEbookToTop();
}

type EbookNextChapterNavProps = {
  currentChapter: number;
  totalChapters: number;
  nextChapterLabel: string;
  onGoToNextChapter: () => void;
  buttonClassName?: string;
  borderClassName?: string;
};

export function EbookNextChapterNav({
  currentChapter,
  totalChapters,
  nextChapterLabel,
  onGoToNextChapter,
  buttonClassName = "bg-slate-800 hover:bg-slate-900 text-white",
  borderClassName = "border-gray-200",
}: EbookNextChapterNavProps) {
  if (currentChapter >= totalChapters || !nextChapterLabel) {
    return null;
  }

  return (
    <div className={cn("mt-10 pt-8 border-t flex justify-end not-prose", borderClassName)}>
      <Button onClick={onGoToNextChapter} className={buttonClassName}>
        Continue to {nextChapterLabel}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
