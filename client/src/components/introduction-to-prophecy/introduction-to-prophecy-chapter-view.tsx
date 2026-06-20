import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, ClipboardList, ArrowRight } from "lucide-react";
import { getAudioUrl } from "@/lib/audio-storage";
import {
  INTRODUCTION_TO_PROPHECY_AUDIO_FILES,
  introductionToProphecyChapters,
} from "@shared/introduction-to-prophecy-content";
import {
  getIntroductionToProphecyQuizLabel,
  getIntroductionToProphecyQuizUrl,
} from "@shared/introduction-to-prophecy-quizzes";
import {
  getProphecyChapterHeading,
  getProphecyChapterLabel,
  renderIntroductionToProphecyBlock,
} from "@/components/introduction-to-prophecy/prophecy-content-blocks";

const COVER_URL = "/introduction-to-prophecy-cover.png";

type Props = {
  chapterId: number;
};

export default function IntroductionToProphecyChapterView({ chapterId }: Props) {
  const [, setLocation] = useLocation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [coverError, setCoverError] = useState(false);

  const chapter = introductionToProphecyChapters.find((c) => c.id === chapterId);
  const audioFile = INTRODUCTION_TO_PROPHECY_AUDIO_FILES[chapterId];
  const chapterLabel = chapter ? getProphecyChapterLabel(chapter.title, chapter.subtitle) : "";
  const quizUrl = getIntroductionToProphecyQuizUrl(chapterId);
  const quizLabel = getIntroductionToProphecyQuizLabel(chapterId);
  const isIntroductionChapter = chapterId === 1;

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume]);

  if (!chapter) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <p>Chapter not found.</p>
      </div>
    );
  }

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play();
    setIsPlaying(!isPlaying);
  };

  const handleSkip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, duration));
  };

  const formatTime = (time: number) => {
    if (Number.isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const prevChapter = chapterId > 1 ? chapterId - 1 : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8 bg-gradient-to-r from-amber-700 to-amber-900 border-none shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-6">
              {coverError ? (
                <div className="w-24 h-32 rounded shadow-lg bg-slate-800 shrink-0" />
              ) : (
                <img
                  src={COVER_URL}
                  alt="Introduction to Prophecy"
                  className="w-24 h-auto rounded shadow-lg"
                  onError={() => setCoverError(true)}
                />
              )}
              <div className="flex-1">
                <h3 className="text-white text-2xl font-bold mb-1">Introduction to Prophecy</h3>
                <p className="text-white/90 text-xl font-semibold">{chapterLabel}</p>
                <p className="text-white/70 text-sm mt-1">by Teacher Larry Kaslov</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={() => handleSkip(-15)}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <SkipBack className="h-5 w-5" />
                  <span className="ml-1 text-xs">15</span>
                </Button>
                <Button
                  onClick={togglePlayPause}
                  size="lg"
                  className="bg-white text-amber-800 hover:bg-amber-50 rounded-full h-14 w-14"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                </Button>
                <Button
                  onClick={() => handleSkip(15)}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <span className="mr-1 text-xs">15</span>
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-2">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={([value]) => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = value;
                      setCurrentTime(value);
                    }
                  }}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-white/90 text-sm">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-center">
                <Volume2 className="h-4 w-4 text-white" />
                <Slider
                  value={[volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={([value]) => setVolume(value / 100)}
                  className="w-24"
                />
              </div>
            </div>

            <audio
              ref={audioRef}
              src={getAudioUrl(audioFile)}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-xl mb-8">
          <CardContent className="p-6 sm:p-8 prose max-w-none">
            <h2 className="text-3xl font-bold text-amber-900 mb-6">
              {getProphecyChapterHeading(chapter.title, chapter.subtitle)}
            </h2>
            {chapter.blocks.map((block, index) => renderIntroductionToProphecyBlock(block, index))}

            <div className="mt-10 pt-8 border-t border-amber-200 flex justify-end not-prose">
              {isIntroductionChapter ? (
                <Button
                  onClick={() => {
                    setLocation("/introduction-to-prophecy-ch2");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="bg-amber-700 hover:bg-amber-800 text-white"
                >
                  Go to Lesson 1
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => setLocation(quizUrl)}
                  className="bg-amber-700 hover:bg-amber-800 text-white"
                >
                  <ClipboardList className="mr-2 h-4 w-4" />
                  {quizLabel}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {prevChapter ? (
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              onClick={() => {
                setLocation(`/introduction-to-prophecy-ch${prevChapter}`);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Previous Chapter
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
