import { useEffect, useRef } from "react";
import { getVideoEmbedUrl } from "@/lib/family-night-config";

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

type FamilyNightVideoPlayerProps = {
  videoUrl: string;
  isInstagram: boolean;
  title: string;
};

/** Compact phone-sized frame — centered on desktop, no horizontal scroll */
const PLAYER_SHELL =
  "mx-auto w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px]";

function getYouTubeVideoId(url: string): string | null {
  if (url.includes("youtu.be/")) {
    return url.split("youtu.be/")[1]?.split("?")[0] ?? null;
  }
  if (url.includes("youtube.com/watch")) {
    return url.split("v=")[1]?.split("&")[0] ?? null;
  }
  if (url.includes("youtube.com/embed/")) {
    return url.split("embed/")[1]?.split("?")[0] ?? null;
  }
  return null;
}

function loadInstagramEmbeds() {
  if (window.instgrm) {
    window.instgrm.Embeds.process();
    return;
  }

  const existing = document.querySelector('script[src*="instagram.com/embed.js"]');
  if (existing) {
    existing.addEventListener("load", () => window.instgrm?.Embeds.process());
    return;
  }

  const script = document.createElement("script");
  script.src = "https://www.instagram.com/embed.js";
  script.async = true;
  script.onload = () => window.instgrm?.Embeds.process();
  document.body.appendChild(script);
}

function clampInstagramIframe(container: HTMLDivElement | null) {
  if (!container) return;
  container.querySelectorAll("iframe").forEach((iframe) => {
    iframe.style.maxWidth = "100%";
    iframe.style.width = "100%";
    iframe.style.minWidth = "0";
    iframe.style.margin = "0 auto";
    iframe.style.display = "block";
  });
}

export default function FamilyNightVideoPlayer({
  videoUrl,
  isInstagram,
  title,
}: FamilyNightVideoPlayerProps) {
  const instagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isInstagram) return;
    loadInstagramEmbeds();
    const timers = [300, 900, 1500].map((ms) =>
      setTimeout(() => {
        window.instgrm?.Embeds.process();
        clampInstagramIframe(instagramRef.current);
      }, ms),
    );
    return () => timers.forEach(clearTimeout);
  }, [videoUrl, isInstagram]);

  if (isInstagram) {
    const permalink = videoUrl.replace(/\/$/, "");
    return (
      <div className={`${PLAYER_SHELL} overflow-hidden`}>
        <div
          ref={instagramRef}
          className="rounded-xl border border-white/10 bg-slate-950/80 p-2 sm:p-3 overflow-x-hidden"
        >
          <p className="text-purple-200 text-xs mb-2 text-center px-1">
            Watch here — sized for mobile and desktop
          </p>
          <div className="max-h-[min(62vh,480px)] sm:max-h-[min(58vh,520px)] overflow-y-auto overflow-x-hidden rounded-lg [&_.instagram-media]:!max-w-full [&_.instagram-media]:!min-w-0 [&_iframe]:!max-w-full [&_iframe]:!w-full">
            <blockquote
              className="instagram-media !mx-auto !w-full !max-w-full !min-w-0"
              data-instgrm-captioned
              data-instgrm-permalink={`${permalink}/`}
              data-instgrm-version="14"
              style={{
                background: "#FFF",
                border: 0,
                borderRadius: 8,
                margin: "0 auto",
                maxWidth: "100%",
                minWidth: 0,
                width: "100%",
                padding: 0,
              }}
            >
              <a href={permalink} target="_blank" rel="noopener noreferrer">
                {title}
              </a>
            </blockquote>
          </div>
        </div>
      </div>
    );
  }

  const youtubeId = getYouTubeVideoId(videoUrl);
  const embedSrc = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?rel=0`
    : getVideoEmbedUrl(videoUrl, false);

  return (
    <div className={PLAYER_SHELL}>
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/10 shadow-lg">
        <iframe
          src={embedSrc}
          title={title}
          className="h-full w-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}
