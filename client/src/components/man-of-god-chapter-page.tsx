import React, { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, ArrowLeft } from "lucide-react";
import { getAudioUrl } from "@/lib/audio-storage";
import {
  MAN_OF_GOD_COVER,
  MAN_OF_GOD_COURSE_URL,
  getManOfGodChapter,
} from "@/lib/man-of-god-config";

type ManOfGodChapterPageProps = {
  chapter: number;
  chapterText: string;
};

export default function ManOfGodChapterPage({ chapter, chapterText }: ManOfGodChapterPageProps) {
  const chapterData = getManOfGodChapter(chapter);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  if (!chapterData) {
    return null;
  }

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      0,
      Math.min((audioRef.current.currentTime || 0) + seconds, duration),
    );
  };

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const trimmedText = chapterText.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={() => {
              window.location.href = MAN_OF_GOD_COURSE_URL;
            }}
            variant="ghost"
            className="text-white hover:text-emerald-300 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
        </div>

        <Card className="mb-8 bg-gradient-to-r from-emerald-700 to-emerald-900 border-emerald-600">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <img
                src={MAN_OF_GOD_COVER}
                alt="SFGM Man of God Course Cover"
                className="w-24 h-auto rounded shadow-lg"
              />
              <div>
                <h3 className="text-white text-2xl font-bold">SFGM Man of God Course</h3>
                <p className="text-white/90 text-xl">
                  Week {chapter}: {chapterData.title}
                </p>
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
              <Button onClick={() => skip(-15)} size="sm" variant="ghost" className="text-white">
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button
                onClick={togglePlayPause}
                size="lg"
                className="bg-white text-emerald-800 rounded-full h-14 w-14"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              <Button onClick={() => skip(15)} size="sm" variant="ghost" className="text-white">
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-3 justify-center">
              <Volume2 className="h-4 w-4 text-white" />
              <Slider
                value={[volume]}
                max={1}
                step={0.01}
                onValueChange={([v]) => {
                  setVolume(v);
                  if (audioRef.current) audioRef.current.volume = v;
                }}
                className="w-24"
              />
            </div>

            <audio
              ref={audioRef}
              src={getAudioUrl(chapterData.audioFile)}
              onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
              onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-8">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold mb-6 text-emerald-900">
                Week {chapter}: {chapterData.title}
              </h2>
              {trimmedText ? (
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{chapterText}</div>
              ) : (
                <p className="text-gray-500 italic">
                  E-book text for this week has not been added yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
