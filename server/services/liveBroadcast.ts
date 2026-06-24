import {
  buildYouTubeEmbedUrl,
  buildYouTubeWatchUrl,
  DEFAULT_YOUTUBE_CHANNEL_URL,
  type LiveBroadcastConfig,
} from "../../shared/live-broadcast";
import { getYouTubeLiveSnapshot } from "./youtubeLiveDetect";

let runtimeVideoId: string | null = null;
let runtimeTitle: string | null = null;
let runtimeUpdatedAt = new Date().toISOString();

function envVideoId(): string | null {
  return process.env.YOUTUBE_LIVE_VIDEO_ID?.trim() || null;
}

function envChannelUrl(): string {
  return process.env.YOUTUBE_CHANNEL_URL?.trim() || DEFAULT_YOUTUBE_CHANNEL_URL;
}

export function getLiveBroadcastState(): LiveBroadcastConfig {
  const channelUrl = envChannelUrl();
  const youtube = getYouTubeLiveSnapshot();
  const channelId = youtube.channelId || process.env.YOUTUBE_CHANNEL_ID?.trim() || null;

  const manualVideoId = runtimeVideoId;
  const staticVideoId = envVideoId();
  const autoVideoId = youtube.autoDetectEnabled && youtube.isLive ? youtube.videoId : null;

  const videoId = manualVideoId || staticVideoId || autoVideoId;
  const isLive = Boolean(videoId) || (youtube.autoDetectEnabled && youtube.isLive);

  const source: LiveBroadcastConfig["source"] = manualVideoId
    ? "manual"
    : staticVideoId
      ? "env"
      : autoVideoId
        ? "auto"
        : channelId && !youtube.autoDetectEnabled
          ? "channel"
          : "none";

  const useChannelEmbed =
    !videoId &&
    Boolean(channelId) &&
    (!youtube.autoDetectEnabled || process.env.YOUTUBE_USE_CHANNEL_EMBED === "true");

  const embedUrl = buildYouTubeEmbedUrl(videoId, useChannelEmbed ? channelId : null);
  const watchUrl = buildYouTubeWatchUrl(videoId, channelUrl);

  const autoTitle = youtube.liveTitle?.trim() || null;

  return {
    title:
      runtimeTitle ||
      autoTitle ||
      process.env.YOUTUBE_LIVE_TITLE?.trim() ||
      "SFGM Boston Live",
    subtitle:
      process.env.YOUTUBE_LIVE_SUBTITLE?.trim() ||
      "Soldiers for God Ministry — live worship & Family Night",
    channelUrl,
    channelId,
    videoId,
    embedUrl,
    watchUrl,
    updatedAt: runtimeUpdatedAt,
    isLive,
    source,
    autoDetectEnabled: youtube.autoDetectEnabled,
    liveTitle: autoTitle,
    lastCheckedAt: youtube.checkedAt,
    statusMessage: buildStatusMessage(youtube, videoId, source),
  };
}

function buildStatusMessage(
  youtube: ReturnType<typeof getYouTubeLiveSnapshot>,
  videoId: string | null,
  source: LiveBroadcastConfig["source"],
): string {
  if (youtube.error && youtube.autoDetectEnabled && !videoId) {
    return "Auto-detect had a problem — checking again shortly.";
  }
  if (source === "auto" && videoId) {
    return "Live now — detected automatically from YouTube.";
  }
  if (source === "manual" && videoId) {
    return "Live stream set manually by host.";
  }
  if (youtube.autoDetectEnabled && !youtube.isLive) {
    return "Not live yet — the player will appear automatically when YouTube goes live.";
  }
  if (source === "channel") {
    return "Waiting for YouTube live stream on your channel.";
  }
  return "Connect YouTube once on Render for automatic live detection.";
}

export function setLiveBroadcastVideo(videoId: string | null, title?: string | null): LiveBroadcastConfig {
  runtimeVideoId = videoId;
  if (title !== undefined) {
    runtimeTitle = title?.trim() || null;
  }
  runtimeUpdatedAt = new Date().toISOString();
  return getLiveBroadcastState();
}

export function clearLiveBroadcastOverride(): LiveBroadcastConfig {
  runtimeVideoId = null;
  runtimeTitle = null;
  runtimeUpdatedAt = new Date().toISOString();
  return getLiveBroadcastState();
}
