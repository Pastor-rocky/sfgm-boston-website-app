import { useEffect, useRef, type ReactNode } from "react";
import { buildYouTubeEmbedUrl } from "@shared/live-broadcast";
import { Youtube } from "lucide-react";

type YtPlayer = {
  playVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getDuration: () => number;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
          videoId?: string;
          playerVars?: Record<string, string | number>;
          events?: { onReady?: (event: { target: YtPlayer }) => void };
        },
      ) => YtPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiLoading = false;

function loadYouTubeIframeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (ytApiLoading) {
    return new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve();
      };
    });
  }

  ytApiLoading = true;
  return new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
}

function seekToLiveEdge(player: YtPlayer) {
  try {
    const duration = player.getDuration();
    if (duration && Number.isFinite(duration) && duration > 1) {
      player.seekTo(duration, true);
    }
  } catch {
    // Player not ready yet
  }
}

type LiveYouTubeEmbedProps = {
  videoId: string | null;
  channelId?: string | null;
  className?: string;
  title?: string;
  /** Periodically jump to the live edge so drift does not build up */
  keepAtLiveEdge?: boolean;
  placeholder?: ReactNode;
};

export default function LiveYouTubeEmbed({
  videoId,
  channelId = null,
  className = "w-full h-full",
  title = "SFGM Boston Live on YouTube",
  keepAtLiveEdge = false,
  placeholder,
}: LiveYouTubeEmbedProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YtPlayer | null>(null);

  const embedUrl =
    !keepAtLiveEdge && videoId
      ? buildYouTubeEmbedUrl(videoId, channelId, {
          playsinline: true,
          origin: typeof window !== "undefined" ? window.location.origin : undefined,
        })
      : !keepAtLiveEdge && channelId
        ? buildYouTubeEmbedUrl(null, channelId, { playsinline: true })
        : null;

  useEffect(() => {
    if (!keepAtLiveEdge || !videoId || !hostRef.current) return;

    let interval: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    const mountPlayer = async () => {
      await loadYouTubeIframeApi();
      if (cancelled || !hostRef.current || !window.YT?.Player) return;

      playerRef.current = new window.YT.Player(hostRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
          controls: 1,
        },
        events: {
          onReady: (event) => {
            event.target.playVideo();
            seekToLiveEdge(event.target);
            interval = setInterval(() => seekToLiveEdge(event.target), 15_000);
          },
        },
      });
    };

    void mountPlayer();

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [keepAtLiveEdge, videoId]);

  if (!videoId && !channelId) {
    return (
      <div
        className={`flex flex-col items-center justify-center text-center px-4 bg-slate-950 text-slate-300 ${className}`}
      >
        {placeholder ?? (
          <>
            <Youtube className="h-12 w-12 text-red-500 mb-3" />
            <p className="font-medium text-white">Waiting for YouTube stream</p>
            <p className="text-sm text-slate-400 mt-1">Starts automatically when you go live</p>
          </>
        )}
      </div>
    );
  }

  if (keepAtLiveEdge && videoId) {
    return <div ref={hostRef} className={className} />;
  }

  if (!embedUrl) return null;

  return (
    <iframe
      key={embedUrl}
      title={title}
      src={embedUrl}
      className={className}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
