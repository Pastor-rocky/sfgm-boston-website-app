/**
 * Polls YouTube Data API for the channel's current live stream.
 * Set once on Render — no manual URL paste each service.
 */

const YOUTUBE_API = "https://www.googleapis.com/youtube/v3";

export type YouTubeLiveSnapshot = {
  isLive: boolean;
  videoId: string | null;
  liveTitle: string | null;
  channelId: string | null;
  checkedAt: string;
  autoDetectEnabled: boolean;
  error: string | null;
};

let cachedChannelId: string | null = null;
let snapshot: YouTubeLiveSnapshot = {
  isLive: false,
  videoId: null,
  liveTitle: null,
  channelId: null,
  checkedAt: new Date().toISOString(),
  autoDetectEnabled: false,
  error: null,
};

let pollTimer: ReturnType<typeof setInterval> | null = null;

function apiKey(): string | null {
  return process.env.YOUTUBE_API_KEY?.trim() || null;
}

function channelHandle(): string | null {
  const raw = process.env.YOUTUBE_CHANNEL_HANDLE?.trim();
  if (!raw) return "sfgmbostonma";
  return raw.replace(/^@/, "");
}

function envChannelId(): string | null {
  return process.env.YOUTUBE_CHANNEL_ID?.trim() || null;
}

function pollIntervalMs(): number {
  const n = Number(process.env.YOUTUBE_LIVE_POLL_SECONDS || "45");
  if (Number.isNaN(n) || n < 20) return 45_000;
  return n * 1000;
}

function isAutoDetectConfigured(): boolean {
  return Boolean(apiKey() && (envChannelId() || channelHandle()));
}

async function youtubeGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const key = apiKey();
  if (!key) throw new Error("YOUTUBE_API_KEY is not set");

  const url = new URL(`${YOUTUBE_API}/${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  url.searchParams.set("key", key);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

async function resolveChannelId(): Promise<string | null> {
  if (cachedChannelId) return cachedChannelId;
  const fromEnv = envChannelId();
  if (fromEnv) {
    cachedChannelId = fromEnv;
    return fromEnv;
  }

  const handle = channelHandle();
  if (!handle || !apiKey()) return null;

  type ChannelsResponse = {
    items?: Array<{ id: string }>;
  };

  const data = await youtubeGet<ChannelsResponse>("channels", {
    part: "id",
    forHandle: handle,
  });

  const id = data.items?.[0]?.id ?? null;
  if (id) cachedChannelId = id;
  return id;
}

async function pollYouTubeLive(): Promise<YouTubeLiveSnapshot> {
  const enabled = isAutoDetectConfigured();
  if (!enabled) {
    snapshot = {
      ...snapshot,
      autoDetectEnabled: false,
      checkedAt: new Date().toISOString(),
    };
    return snapshot;
  }

  try {
    const channelId = await resolveChannelId();
    if (!channelId) {
      throw new Error("Could not resolve YouTube channel ID");
    }

    type SearchResponse = {
      items?: Array<{
        id?: { videoId?: string };
        snippet?: { title?: string };
      }>;
    };

    const search = await youtubeGet<SearchResponse>("search", {
      part: "snippet",
      channelId,
      eventType: "live",
      type: "video",
      maxResults: "1",
    });

    const item = search.items?.[0];
    const videoId = item?.id?.videoId ?? null;
    const liveTitle = item?.snippet?.title ?? null;

    snapshot = {
      isLive: Boolean(videoId),
      videoId,
      liveTitle,
      channelId,
      checkedAt: new Date().toISOString(),
      autoDetectEnabled: true,
      error: null,
    };
  } catch (error) {
    snapshot = {
      ...snapshot,
      autoDetectEnabled: true,
      checkedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : "YouTube live check failed",
    };
  }

  return snapshot;
}

export function getYouTubeLiveSnapshot(): YouTubeLiveSnapshot {
  return snapshot;
}

export async function refreshYouTubeLiveNow(): Promise<YouTubeLiveSnapshot> {
  return pollYouTubeLive();
}

export function startYouTubeLivePoller(): void {
  if (pollTimer) return;
  if (!isAutoDetectConfigured()) {
    console.log(
      "ℹ️  YouTube auto-live disabled — set YOUTUBE_API_KEY + YOUTUBE_CHANNEL_HANDLE on Render",
    );
    return;
  }

  console.log("📺 YouTube auto-live polling enabled");
  void pollYouTubeLive();
  pollTimer = setInterval(() => {
    void pollYouTubeLive();
  }, pollIntervalMs());
}

export function stopYouTubeLivePoller(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}
