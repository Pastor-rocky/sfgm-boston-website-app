import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

const AUDIO_BASE = "https://images.sfgmboston.com/sfgm-public/forever-changed/";
const ALBUM_DOWNLOAD = `${AUDIO_BASE}Forever-Changed.zip`;

const tracks = [
  { id: "01", title: "Forever Changed", file: "in-his-presence.mp3" },
  { id: "02", title: "Kana Tsipav Tiro Anav", file: "when-im-on-my-knees.mp3" },
  { id: "03", title: "Worthy Is The Name", file: "worthy-is-the-name.mp3" },
  { id: "04", title: "O Christo", file: "o-christo.mp3" },
  { id: "05", title: "Medley", file: "medley.mp3" },
  { id: "06", title: "Your Ways", file: "i-dont-know.mp3" },
  { id: "07", title: "Come Like A Rushing Wind", file: "come-like-a-rushing-wind.mp3" },
  { id: "08", title: "The Room", file: "the-room.mp3" },
  { id: "09", title: "Shor Avri Tiro Duxo", file: "send-your-spirit.mp3" },
];

export default function ForeverChanged() {
  const [trackId, setTrackId] = useState(tracks[0].id);
  const audioRef = useRef<HTMLAudioElement>(null);
  const track = tracks.find((item) => item.id === trackId) ?? tracks[0];
  const src = `${AUDIO_BASE}${track.file}`;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.dataset.loadedSrc === src) return;
    audio.dataset.loadedSrc = src;
    audio.src = src;
  }, [src]);

  const openTrack = (id: string) => {
    setTrackId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const playNext = () => {
    const index = tracks.findIndex((item) => item.id === track.id);
    const next = tracks[index + 1];
    const audio = audioRef.current;
    if (!next || !audio) return;
    const nextSrc = `${AUDIO_BASE}${next.file}`;
    audio.dataset.loadedSrc = nextSrc;
    audio.src = nextSrc;
    void audio.play().catch(() => {});
    setTrackId(next.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Link href="/" className="text-sm text-amber-200 hover:text-white">
            ← Back to the home page
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-4 lg:self-start">
            <img
              src="/forever-changed-cover.jpg"
              alt="Forever Changed album cover"
              className="mx-auto mb-4 w-52 rounded-md shadow-2xl"
            />
            <h1 className="text-center text-xl font-bold text-amber-100 lg:text-left">Forever Changed</h1>
            <p className="mt-1 text-center text-sm text-slate-300 lg:text-left">
              SFGM Boston · The House Of Restoration Ministries
            </p>
            <a
              href={ALBUM_DOWNLOAD}
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400"
            >
              <i className="fas fa-download"></i>
              Download the album
            </a>
            <label className="mt-4 block text-sm font-semibold text-amber-200 lg:hidden" htmlFor="track-select">
              Song
            </label>
            <select
              id="track-select"
              className="mt-2 w-full rounded-md border border-white/20 bg-slate-900 px-3 py-3 text-base lg:hidden"
              value={track.id}
              onChange={(event) => openTrack(event.target.value)}
            >
              {tracks.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
            <nav className="mt-4 hidden space-y-1 lg:block">
              {tracks.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openTrack(item.id)}
                  className={`block w-full rounded-md px-3 py-2 text-left text-sm ${
                    item.id === track.id
                      ? "bg-amber-500 font-semibold text-slate-950"
                      : "text-slate-200 hover:bg-white/10"
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </nav>
          </aside>

          <article>
            <h2 className="text-3xl font-bold text-white">{track.title}</h2>
            <p className="mt-2 text-sm text-slate-300">Forever Changed</p>
            <div className="mt-6 rounded-2xl border border-amber-400/30 bg-slate-900 p-4">
              <p className="mb-2 text-sm font-semibold text-amber-100">Listen</p>
              <audio ref={audioRef} controls preload="none" className="w-full" onEnded={playNext}>
                Your browser cannot play this recording.
              </audio>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-400">
                  The next song starts when this one ends. Press pause to stay here.
                </p>
                <a
                  href={`${AUDIO_BASE}download/${track.id}.mp3`}
                  className="text-sm font-semibold text-amber-200 hover:text-white"
                >
                  <i className="fas fa-download mr-2"></i>
                  Download this song
                </a>
              </div>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
