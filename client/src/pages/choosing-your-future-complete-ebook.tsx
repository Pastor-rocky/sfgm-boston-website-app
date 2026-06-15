import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import {
  choosingYourFutureChapters,
  type ChoosingYourFutureBlock,
  type ChoosingYourFutureChapter,
} from "@shared/choosing-your-future-content";

function getChapterDisplayTitle(chapter: ChoosingYourFutureChapter): string {
  if (chapter.title === "Introduction") return "Introduction";
  if (chapter.title === "Conclusion") return "Conclusion";
  if (chapter.subtitle) return `${chapter.title}: ${chapter.subtitle}`;
  return chapter.title;
}

function getChapterHeading(chapter: ChoosingYourFutureChapter): string {
  if (chapter.title === "Introduction") return "Introduction";
  if (chapter.title === "Conclusion") return "Conclusion";
  if (chapter.subtitle) return `${chapter.title.toUpperCase()}: ${chapter.subtitle.toUpperCase()}`;
  return chapter.title.toUpperCase();
}

function renderBlock(block: ChoosingYourFutureBlock, index: number) {
  if (block.type === "heading") {
    return (
      <h3 key={index} className="text-2xl font-bold text-indigo-900 mt-8 mb-4">
        {block.text}
      </h3>
    );
  }

  if (block.type === "scripture") {
    return (
      <blockquote
        key={index}
        className="border-l-4 border-indigo-500 pl-4 italic text-gray-800 my-6 bg-indigo-50 p-4 rounded"
      >
        <p className="font-semibold text-indigo-900 mb-3 not-italic">{block.reference}</p>
        <p className="leading-relaxed">{block.text}</p>
      </blockquote>
    );
  }

  if (block.text.startsWith("• ")) {
    return (
      <div
        key={index}
        className="bg-violet-50 border-l-4 border-violet-400 p-4 my-4 rounded"
      >
        <p className="text-gray-800 leading-relaxed">{block.text}</p>
      </div>
    );
  }

  return (
    <p key={index} className="mb-4 text-gray-800 leading-relaxed text-base sm:text-lg">
      {block.text}
    </p>
  );
}

export default function ChoosingYourFutureCompleteEbook() {
  const [, setLocation] = useLocation();
  const [currentChapter, setCurrentChapter] = useState(1);

  const currentChapterData = choosingYourFutureChapters[currentChapter - 1];
  const chapterLabel = getChapterDisplayTitle(currentChapterData);
  const coverUrl =
    "https://img1.wsimg.com/isteam/ip/cc1ec5d5-2d90-49e2-809f-329d72f697cd/IMG_1972.PNG/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:400,cg:true";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button
            onClick={() => setLocation("/textbook-catalog")}
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Catalog
          </Button>
        </div>

        <div className="mb-8">
          <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 border-none shadow-2xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={coverUrl}
                  alt="Choosing Your Future"
                  className="w-20 h-auto rounded shadow-lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-xl sm:text-2xl font-bold mb-1">
                    Choosing Your Future
                  </h3>
                  <p className="text-white/80 text-sm sm:text-base mb-1">
                    The Whole Truth About Fortune Telling
                  </p>
                  <p className="text-white/90 text-base sm:text-lg font-semibold">
                    {chapterLabel}
                  </p>
                  <p className="text-white/70 text-sm mt-1">by Anthony Lee</p>
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
                  {choosingYourFutureChapters.map((chapter) => (
                    <SelectItem key={chapter.id} value={chapter.id.toString()}>
                      {getChapterDisplayTitle(chapter)}
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
              <h2 className="text-3xl font-bold text-indigo-900 mb-2">
                {getChapterHeading(currentChapterData)}
              </h2>
              {currentChapterData.blocks.map((block, index) => renderBlock(block, index))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
