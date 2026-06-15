import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { getAudioUrl } from "@/lib/audio-storage";
import { getManOfGodChapter, MAN_OF_GOD_COVER, MAN_OF_GOD_COURSE_URL } from "@/lib/man-of-god-config";
import { ManOfGodGraciousContentManContent } from "@/components/man-of-god-gracious-content-man-content";

export default function ManOfGodCh8() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chapter = getManOfGodChapter(8)!;
  const audioSrc = getAudioUrl(chapter.audioFile);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [audioSrc]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href={MAN_OF_GOD_COURSE_URL}>
            <Button variant="ghost" className="mb-4">
              ← Back to Course
            </Button>
          </Link>
        </div>

        <Card className="mb-8 bg-gradient-to-r from-emerald-700 to-emerald-900 border-none shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <img
                src={MAN_OF_GOD_COVER}
                alt="SFGM Man of God Course"
                className="w-24 h-auto rounded shadow-lg"
              />
              <div className="flex-1">
                <h3 className="text-white text-2xl font-bold mb-1">SFGM Man of God Course</h3>
                <p className="text-white/90 text-xl font-semibold">Week {chapter.week}: {chapter.title}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mb-4">
              <Button
                onClick={() => skip(-15)}
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
                className="bg-white text-emerald-800 hover:bg-white/90 rounded-full h-14 w-14"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
              </Button>
              <Button
                onClick={() => skip(15)}
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
                onValueChange={handleSeek}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-white/90 text-sm">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <Volume2 className="h-4 w-4 text-white" />
              <Slider
                value={[volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-24 cursor-pointer"
              />
            </div>

            <audio ref={audioRef} src={audioSrc} preload="metadata" />
          </CardContent>
        </Card>

        <Card className="shadow-xl border-emerald-200">
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none">
              <ManOfGodGraciousContentManContent />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
