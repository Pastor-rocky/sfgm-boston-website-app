import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, BookOpen } from "lucide-react";
import { introductionToProphecyChapters } from "@shared/introduction-to-prophecy-content";
import {
  getProphecyChapterHeading,
  getProphecyChapterLabel,
  renderIntroductionToProphecyBlock,
} from "@/components/introduction-to-prophecy/prophecy-content-blocks";
import {
  EbookNextChapterNav,
  getEbookNextChapterLabel,
  goToNextEbookChapter,
} from "@/components/ebook/ebook-next-chapter-nav";

const COVER_URL = "/introduction-to-prophecy-cover.png";

export default function IntroductionToProphecyCompleteEbook() {
  const [, setLocation] = useLocation();
  const [currentChapter, setCurrentChapter] = useState(1);
  const [coverError, setCoverError] = useState(false);

  const currentChapterData = introductionToProphecyChapters[currentChapter - 1];
  const chapterLabel = getProphecyChapterLabel(
    currentChapterData.title,
    currentChapterData.subtitle,
  );
  const nextChapterLabel = getEbookNextChapterLabel(
    introductionToProphecyChapters.map((chapter) => ({
      title: getProphecyChapterLabel(chapter.title, chapter.subtitle),
    })),
    currentChapter,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex flex-wrap gap-3 items-center justify-between">
          <Button
            onClick={() => setLocation("/textbook-catalog")}
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Catalog
          </Button>
          <Button
            onClick={() => setLocation(`/introduction-to-prophecy-ch${currentChapter}`)}
            variant="outline"
            className="text-white border-white/30 hover:bg-white/10"
          >
            Open chapter audio page
          </Button>
        </div>

        <div className="mb-8">
          <Card className="bg-gradient-to-r from-amber-700 to-amber-900 border-none shadow-2xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-4 mb-4">
                {coverError ? (
                  <div className="w-20 h-28 rounded shadow-lg bg-slate-800 flex items-center justify-center shrink-0">
                    <BookOpen className="h-8 w-8 text-amber-200" />
                  </div>
                ) : (
                  <img
                    src={COVER_URL}
                    alt="Introduction to Prophecy"
                    className="w-20 h-auto rounded shadow-lg"
                    onError={() => setCoverError(true)}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-xl sm:text-2xl font-bold mb-1">
                    Introduction to Prophecy
                  </h3>
                  <p className="text-white/80 text-sm sm:text-base mb-1">
                    Decoding the Divine Timeline — A 9 Week Journey
                  </p>
                  <p className="text-white/90 text-base sm:text-lg font-semibold">{chapterLabel}</p>
                  <p className="text-white/70 text-sm mt-1">
                    by Teacher Larry Kaslov · co-author Pastor Rocky Kaslov
                  </p>
                </div>
              </div>

              <Select
                value={currentChapter.toString()}
                onValueChange={(value) => setCurrentChapter(parseInt(value, 10))}
              >
                <SelectTrigger className="w-full bg-white/10 text-white border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {introductionToProphecyChapters.map((chapter) => (
                    <SelectItem key={chapter.id} value={chapter.id.toString()}>
                      {getProphecyChapterLabel(chapter.title, chapter.subtitle)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white shadow-xl">
          <CardContent className="p-6 sm:p-8 prose max-w-none">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-amber-900 mb-2">
                {getProphecyChapterHeading(currentChapterData.title, currentChapterData.subtitle)}
              </h2>
              {currentChapterData.blocks.map((block, index) =>
                renderIntroductionToProphecyBlock(block, index),
              )}

              <EbookNextChapterNav
                currentChapter={currentChapter}
                totalChapters={introductionToProphecyChapters.length}
                nextChapterLabel={nextChapterLabel}
                onGoToNextChapter={() =>
                  goToNextEbookChapter(introductionToProphecyChapters.length, setCurrentChapter)
                }
                buttonClassName="bg-amber-700 hover:bg-amber-800 text-white"
                borderClassName="border-amber-200"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
