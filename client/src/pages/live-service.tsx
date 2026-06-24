import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  ExternalLink,
  Monitor,
  Radio,
  Trophy,
  Youtube,
} from "lucide-react";
import type { LiveBroadcastConfig } from "@shared/live-broadcast";

function useQueryVideoOverride() {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("video") || params.get("v");
  }, []);
}

export default function LiveService() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryVideo = useQueryVideoOverride();
  const [videoInput, setVideoInput] = useState("");
  const [titleInput, setTitleInput] = useState("");

  const role = ((user as { role?: string } | null)?.role || "").toLowerCase();
  const isInstructor = ["instructor", "admin", "dean"].includes(role);

  const { data: broadcast, isLoading } = useQuery<LiveBroadcastConfig>({
    queryKey: ["/api/live-broadcast"],
    staleTime: 5_000,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.autoDetectEnabled ? 20_000 : 60_000;
    },
    refetchOnMount: "always",
  });

  const effectiveVideoId = queryVideo || broadcast?.videoId || null;
  const embedUrl = effectiveVideoId
    ? `https://www.youtube.com/embed/${effectiveVideoId}?autoplay=1&rel=0&modestbranding=1`
    : broadcast?.embedUrl ?? null;
  const watchUrl = effectiveVideoId
    ? `https://www.youtube.com/watch?v=${effectiveVideoId}`
    : broadcast?.watchUrl ?? broadcast?.channelUrl;

  useEffect(() => {
    if (broadcast?.videoId && !videoInput) {
      setVideoInput(broadcast.videoId);
    }
    if (broadcast?.title && !titleInput) {
      setTitleInput(broadcast.title);
    }
  }, [broadcast?.title, broadcast?.videoId, titleInput, videoInput]);

  const setVideo = useMutation({
    mutationFn: async (payload: { videoUrl: string; title?: string }) => {
      const res = await apiRequest("POST", "/api/live-broadcast/video", payload);
      return res.json() as Promise<LiveBroadcastConfig>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/live-broadcast"], data);
      toast({
        title: "Live stream updated",
        description: data.videoId
          ? "The website player is now pointed at your YouTube stream."
          : "Stream cleared.",
      });
    },
    onError: () => {
      toast({
        title: "Could not update stream",
        description: "Log in as instructor and try again.",
        variant: "destructive",
      });
    },
  });

  const clearVideo = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/live-broadcast/clear", {});
      return res.json() as Promise<LiveBroadcastConfig>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/live-broadcast"], data);
      setVideoInput("");
      toast({ title: "Stream override cleared" });
    },
  });

  const handleSetStream = () => {
    if (!videoInput.trim()) return;
    setVideo.mutate({
      videoUrl: videoInput.trim(),
      title: titleInput.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className="bg-red-600 hover:bg-red-600">
                <Youtube className="h-3.5 w-3.5 mr-1" />
                Live Broadcast
              </Badge>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-300">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                {broadcast?.isLive ? "Live now" : broadcast?.autoDetectEnabled ? "Auto-watching YouTube" : "Awaiting stream"}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {broadcast?.title || "SFGM Boston Live"}
            </h1>
            <p className="text-purple-200/90 mt-2 max-w-2xl">
              {broadcast?.statusMessage ||
                "Watch our live stream here — powered by YouTube."}
            </p>
            {broadcast?.autoDetectEnabled ? (
              <p className="text-xs text-purple-300/70 mt-2">
                Auto-detect is on — when you go live on YouTube, this page updates by itself.
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/family-night/leaderboard?display=1">
              <Button variant="outline" className="border-amber-400/40 text-amber-100">
                <Trophy className="h-4 w-4 mr-2" />
                Leaderboard TV
              </Button>
            </Link>
            {watchUrl ? (
              <a href={watchUrl} target="_blank" rel="noopener noreferrer">
                <Button className="bg-red-600 hover:bg-red-700">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open on YouTube
                </Button>
              </a>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border-2 border-white/15 bg-black shadow-2xl aspect-video">
          {isLoading ? (
            <div className="h-full min-h-[280px] flex items-center justify-center text-purple-200">
              Loading player…
            </div>
          ) : embedUrl ? (
            <iframe
              key={embedUrl}
              title="SFGM Boston Live on YouTube"
              src={embedUrl}
              className="w-full h-full min-h-[280px] md:min-h-[420px]"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <div className="h-full min-h-[280px] md:min-h-[420px] flex flex-col items-center justify-center text-center px-6">
              <Youtube className="h-16 w-16 text-red-500 mb-4" />
              <p className="text-xl font-semibold text-white mb-2">
                {broadcast?.autoDetectEnabled ? "Waiting for YouTube to go live" : "Stream not connected yet"}
              </p>
              <p className="text-purple-200/80 max-w-md mb-6">
                {broadcast?.statusMessage ||
                  "Set up YouTube auto-detect once on Render — then just go live on YouTube as usual."}
              </p>
              <a href={broadcast?.channelUrl || "https://www.youtube.com/@sfgmbostonma"} target="_blank" rel="noopener noreferrer">
                <Button className="bg-red-600 hover:bg-red-700">
                  <Youtube className="h-4 w-4 mr-2" />
                  Go to SFGM YouTube
                </Button>
              </a>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Monitor className="h-4 w-4 text-purple-300" />
              Family Night tonight?
            </h2>
            <p className="text-sm text-purple-200/80 mb-3">
              Run the quiz game show leaderboard on a second screen while this page plays YouTube.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/family-night/leaderboard?host=1">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                  Host controls
                </Button>
              </Link>
              <Link href="/family-night">
                <Button size="sm" variant="outline" className="border-purple-400/40 text-purple-100">
                  Family Night home
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-white font-semibold mb-2">Quick tip</h2>
            <p className="text-sm text-purple-200/80">
              One-time Render setup: add <code className="text-amber-200">YOUTUBE_API_KEY</code> and{" "}
              <code className="text-amber-200">YOUTUBE_CHANNEL_HANDLE=sfgmbostonma</code>. After that,
              start streaming on YouTube — this page picks it up automatically.
            </p>
          </div>
        </div>

        {isInstructor ? (
          <details className="mt-6 rounded-2xl border border-white/15 bg-black/20 p-5">
            <summary className="cursor-pointer text-sm font-semibold text-purple-200">
              Manual override (optional — only if auto-detect fails)
            </summary>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-sm text-purple-200/80 mb-4">
                Paste a YouTube URL only if you need to force a specific stream.
              </p>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
              <Input
                value={videoInput}
                onChange={(e) => setVideoInput(e.target.value)}
                placeholder="https://youtube.com/watch?v=… or video ID"
                className="bg-black/30 border-white/20 text-white"
              />
              <Input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="Stream title (optional)"
                className="bg-black/30 border-white/20 text-white"
              />
              <Button
                className="bg-amber-600 hover:bg-amber-700"
                disabled={!videoInput.trim() || setVideo.isPending}
                onClick={handleSetStream}
              >
                Set stream
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-purple-100"
                disabled={clearVideo.isPending}
                onClick={() => clearVideo.mutate()}
              >
                Clear
              </Button>
            </div>
          </details>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
