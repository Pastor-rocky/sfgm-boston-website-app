/** YouTube live broadcast helpers — embed on /live and /live-service */

export const DEFAULT_YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@sfgmbostonma";

export type LiveBroadcastSource = "auto" | "manual" | "env" | "channel" | "none";

export type LiveBroadcastConfig = {
  title: string;
  subtitle: string;
  channelUrl: string;
  channelId: string | null;
  videoId: string | null;
  embedUrl: string | null;
  watchUrl: string | null;
  updatedAt: string;
  isLive: boolean;
  source: LiveBroadcastSource;
  autoDetectEnabled: boolean;
  liveTitle: string | null;
  lastCheckedAt: string | null;
  statusMessage: string;
};

/** Extract a YouTube video ID from a URL or bare 11-character id. */
export function parseYouTubeVideoId(input: string | null | undefined): string | null {
  const raw = (input || "").trim();
  if (!raw) return null;

  if (/^[\w-]{11}$/.test(raw)) return raw;

  try {
    const url = raw.startsWith("http") ? new URL(raw) : new URL(`https://${raw}`);

    if (url.hostname.includes("youtu.be")) {
      return url.pathname.split("/").filter(Boolean)[0]?.slice(0, 11) ?? null;
    }

    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return v.slice(0, 11);
      const parts = url.pathname.split("/").filter(Boolean);
      const embedIdx = parts.indexOf("embed");
      if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1].slice(0, 11);
      const liveIdx = parts.indexOf("live");
      if (liveIdx >= 0 && parts[liveIdx + 1]) return parts[liveIdx + 1].slice(0, 11);
    }
  } catch {
    return null;
  }

  return null;
}

export function buildYouTubeEmbedUrl(
  videoId: string | null,
  channelId: string | null,
  options?: {
    playsinline?: boolean;
    enableJsApi?: boolean;
    origin?: string;
  },
): string | null {
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
    playsinline: options?.playsinline === false ? "0" : "1",
  });
  if (options?.enableJsApi) {
    params.set("enablejsapi", "1");
    if (options.origin) params.set("origin", options.origin);
  }

  const qs = params.toString();

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?${qs}`;
  }
  if (channelId) {
    return `https://www.youtube.com/embed/live_stream?channel=${channelId}&${qs}`;
  }
  return null;
}

export function buildYouTubeWatchUrl(videoId: string | null, channelUrl: string): string {
  if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
  return channelUrl;
}
