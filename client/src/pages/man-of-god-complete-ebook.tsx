import React, { useRef, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, SkipBack, SkipForward, ArrowLeft, Volume2 } from "lucide-react";
import { getAudioUrl } from "@/lib/audio-storage";
import {
  MAN_OF_GOD_CHAPTERS,
  MAN_OF_GOD_COVER,
  MAN_OF_GOD_COURSE_URL,
} from "@/lib/man-of-god-config";
import { ManOfGodIntroductionContent } from "@/components/man-of-god-introduction-content";
import { ManOfGodMatureManContent } from "@/components/man-of-god-mature-man-content";
import { ManOfGodBusinessManContent } from "@/components/man-of-god-business-man-content";
import { ManOfGodLeadingManContent } from "@/components/man-of-god-leading-man-content";
import { ManOfGodNewManContent } from "@/components/man-of-god-new-man-content";
import { ManOfGodHumbleManContent } from "@/components/man-of-god-humble-man-content";
import { ManOfGodFaithfulManContent } from "@/components/man-of-god-faithful-man-content";
import { ManOfGodGraciousContentManContent } from "@/components/man-of-god-gracious-content-man-content";
import { ManOfGodGiftedManContent } from "@/components/man-of-god-gifted-man-content";
import { ManOfGodRealManContent } from "@/components/man-of-god-real-man-content";
import {
  EbookNextChapterNav,
  getEbookNextChapterLabel,
  goToNextEbookChapter,
} from "@/components/ebook/ebook-next-chapter-nav";

const chapterTexts: Record<number, string> = {};

export default function ManOfGodCompleteEbook() {
  const [, setLocation] = useLocation();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [currentChapter, setCurrentChapter] = useState(1);

  const chapters = MAN_OF_GOD_CHAPTERS.map((c) => ({
    id: c.week,
    title: `Week ${c.week}: ${c.title}`,
    audioUrl: getAudioUrl(c.audioFile),
  }));

  const currentChapterData = chapters[currentChapter - 1];
  const nextChapterLabel = getEbookNextChapterLabel(chapters, currentChapter);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.src = currentChapterData.audioUrl;
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
    }
  }, [volume, currentChapter, currentChapterData.audioUrl]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSkip = (delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = Math.min(Math.max(0, audio.currentTime + delta), duration || audio.duration || 0);
    audio.currentTime = next;
    setCurrentTime(next);
  };

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const handleChapterChange = (chapterId: string) => {
    setCurrentChapter(parseInt(chapterId, 10));
  };

  const text = chapterTexts[currentChapter]?.trim() ?? "";

  const getChapterContent = () => {
    if (currentChapter === 1) {
      return <ManOfGodIntroductionContent />;
    }
    if (currentChapter === 2) {
      return <ManOfGodMatureManContent />;
    }
    if (currentChapter === 3) {
      return <ManOfGodBusinessManContent />;
    }
    if (currentChapter === 4) {
      return <ManOfGodLeadingManContent />;
    }
    if (currentChapter === 5) {
      return <ManOfGodNewManContent />;
    }
    if (currentChapter === 6) {
      return <ManOfGodHumbleManContent />;
    }
    if (currentChapter === 7) {
      return <ManOfGodFaithfulManContent />;
    }
    if (currentChapter === 8) {
      return <ManOfGodGraciousContentManContent />;
    }
    if (currentChapter === 9) {
      return <ManOfGodGiftedManContent />;
    }
    if (currentChapter === 10) {
      return <ManOfGodRealManContent />;
    }
    if (text) {
      return <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{chapterTexts[currentChapter]}</div>;
    }
    return <p className="text-gray-500 italic">E-book text for this week has not been added yet.</p>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900">
      <div className="sticky top-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Button
              onClick={() => setLocation(MAN_OF_GOD_COURSE_URL)}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
            <h1 className="text-xl font-bold text-white text-center flex-1">
              SFGM Man of God — Complete E-Book
            </h1>
            <div className="w-24 hidden sm:block" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8 bg-gradient-to-r from-emerald-700 to-emerald-900 border-emerald-600">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <img src={MAN_OF_GOD_COVER} alt="SFGM Man of God Course" className="w-24 h-auto rounded shadow-lg" />
              <div className="flex-1">
                <h3 className="text-white text-2xl font-bold">SFGM Man of God Course</h3>
                <Select value={String(currentChapter)} onValueChange={handleChapterChange}>
                  <SelectTrigger className="mt-2 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    {chapters.map((ch) => (
                      <SelectItem key={ch.id} value={String(ch.id)}>
                        {ch.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Slider
              value={[currentTime]}
              max={duration || 0}
              step={1}
              onValueChange={([v]) => {
                if (audioRef.current) audioRef.current.currentTime = v;
              }}
              className="mb-2"
            />
            <div className="flex justify-between text-white/70 text-sm mb-4">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            <div className="flex items-center justify-center gap-4 mb-4">
              <Button onClick={() => handleSkip(-15)} size="sm" variant="ghost" className="text-white">
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button
                onClick={handlePlayPause}
                size="lg"
                className="bg-white text-emerald-800 rounded-full h-14 w-14"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              <Button onClick={() => handleSkip(15)} size="sm" variant="ghost" className="text-white">
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-3 justify-center">
              <Volume2 className="h-4 w-4 text-white" />
              <Slider
                value={[volume]}
                max={1}
                step={0.01}
                onValueChange={([v]) => setVolume(v)}
                className="w-24"
              />
            </div>

            <audio
              ref={audioRef}
              onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
              onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-emerald-900">{currentChapterData.title}</h2>
            {getChapterContent()}
            <EbookNextChapterNav
              currentChapter={currentChapter}
              totalChapters={chapters.length}
              nextChapterLabel={nextChapterLabel}
              onGoToNextChapter={() => goToNextEbookChapter(chapters.length, setCurrentChapter)}
              buttonClassName="bg-emerald-700 hover:bg-emerald-800 text-white"
              borderClassName="border-emerald-200"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
