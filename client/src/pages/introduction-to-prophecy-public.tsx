import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

type Paragraph = { kind: "kicker" | "heading" | "title" | "p"; text: string };
type Chapter = { id: string; title: string; audio: string; paragraphs: Paragraph[] };
type Book = {
  title: string;
  subtitle: string;
  byline: string;
  note: string;
  cover: string;
  chapters: Chapter[];
};

export default function IntroductionToProphecyPublic() {
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState("");
  const [chapterId, setChapterId] = useState("00");
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("chapter");
    fetch("/book/introduction-to-prophecy.json")
      .then((response) => {
        if (!response.ok) throw new Error("The book did not load.");
        return response.json();
      })
      .then((data: Book) => {
        setBook(data);
        if (requested && data.chapters.some((chapter) => chapter.id === requested)) {
          setChapterId(requested);
        }
      })
      .catch(() => setError("The book did not load. Refresh the page and try again."));
  }, []);

  const chapter = book?.chapters.find((item) => item.id === chapterId) ?? book?.chapters[0];

  const openChapter = (id: string) => {
    setChapterId(id);
    const url = new URL(window.location.href);
    url.searchParams.set("chapter", id);
    window.history.replaceState({}, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !chapter?.audio) return;
    if (audio.dataset.loadedSrc === chapter.audio) return;
    audio.dataset.loadedSrc = chapter.audio;
    audio.src = chapter.audio;
  }, [chapter?.audio]);

  const playNextChapter = () => {
    if (!book || !chapter) return;
    const index = book.chapters.findIndex((item) => item.id === chapter.id);
    const next = book.chapters.slice(index + 1).find((item) => item.audio);
    const audio = audioRef.current;
    if (!next || !audio) return;
    audio.dataset.loadedSrc = next.audio;
    audio.src = next.audio;
    void audio.play().catch(() => {});
    setChapterId(next.id);
    const url = new URL(window.location.href);
    url.searchParams.set("chapter", next.id);
    window.history.replaceState({}, "", url);
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

        {error ? <p className="text-lg">{error}</p> : null}
        {!book && !error ? <p className="text-lg text-slate-300">Opening the book…</p> : null}

        {book && chapter ? (
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="lg:sticky lg:top-4 lg:self-start">
              <Link href="/introduction-to-prophecy">
                <img
                  src={book.cover}
                  alt="Introduction to Prophecy book cover"
                  className="mx-auto mb-4 w-40 rounded-md shadow-2xl"
                />
              </Link>
              <h1 className="text-center text-xl font-bold text-amber-100 lg:text-left">{book.title}</h1>
              <p className="mt-1 text-center text-sm text-slate-300 lg:text-left">{book.subtitle}</p>
              <label className="mt-4 block text-sm font-semibold text-amber-200 lg:hidden" htmlFor="chapter-select">
                Chapter
              </label>
              <select
                id="chapter-select"
                className="mt-2 w-full rounded-md border border-white/20 bg-slate-900 px-3 py-3 text-base lg:hidden"
                value={chapter.id}
                onChange={(event) => openChapter(event.target.value)}
              >
                {book.chapters.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
              <nav className="mt-4 hidden max-h-[70vh] space-y-1 overflow-y-auto pr-1 lg:block">
                {book.chapters.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openChapter(item.id)}
                    className={`block w-full rounded-md px-3 py-2 text-left text-sm ${
                      item.id === chapter.id
                        ? "bg-amber-500 text-slate-950 font-semibold"
                        : "text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </nav>
            </aside>

            <article>
              <h2 className="text-3xl font-bold text-white">{chapter.title}</h2>
              <p className="mt-2 text-sm text-slate-300">{book.byline}</p>

              {chapter.audio ? (
                <div className="mt-6 rounded-2xl border border-amber-400/30 bg-slate-900 p-4">
                  <p className="mb-2 text-sm font-semibold text-amber-100">Listen to this chapter</p>
                  <audio
                    ref={audioRef}
                    controls
                    preload="none"
                    className="w-full"
                    onEnded={playNextChapter}
                  >
                    Your browser cannot play this recording.
                  </audio>
                  <p className="mt-2 text-xs text-slate-400">
                    The next chapter starts when this one ends. Press pause to stay here.
                  </p>
                </div>
              ) : (
                <p className="mt-6 text-sm text-slate-300">This part is for reading.</p>
              )}

              <div className="mt-8 space-y-4 rounded-2xl bg-white px-5 py-8 text-slate-900 sm:px-8">
                {chapter.paragraphs.length === 0 ? (
                  <p className="text-lg leading-relaxed">Press play to hear the closing credits.</p>
                ) : (
                  chapter.paragraphs.map((paragraph, index) => {
                    if (paragraph.kind === "kicker") {
                      return (
                        <p key={index} className="text-sm font-bold uppercase tracking-[0.16em] text-amber-800">
                          {paragraph.text}
                        </p>
                      );
                    }
                    if (paragraph.kind === "heading") {
                      return (
                        <h3 key={index} className="pt-2 text-xl font-bold text-amber-950">
                          {paragraph.text}
                        </h3>
                      );
                    }
                    return (
                      <p key={index} className="text-lg leading-8">
                        {paragraph.text}
                      </p>
                    );
                  })
                )}
              </div>

              <div className="mt-6 flex justify-between gap-3">
                <ChapterJump
                  label="Previous"
                  target={book.chapters[book.chapters.findIndex((item) => item.id === chapter.id) - 1]}
                  onOpen={openChapter}
                />
                <ChapterJump
                  label="Next"
                  target={book.chapters[book.chapters.findIndex((item) => item.id === chapter.id) + 1]}
                  onOpen={openChapter}
                  align="end"
                />
              </div>
            </article>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

function ChapterJump({
  label,
  target,
  onOpen,
  align = "start",
}: {
  label: string;
  target?: Chapter;
  onOpen: (id: string) => void;
  align?: "start" | "end";
}) {
  if (!target) return <span />;
  return (
    <button
      type="button"
      onClick={() => onOpen(target.id)}
      className={`max-w-[46%] rounded-full border border-white/20 px-4 py-3 text-sm text-white hover:bg-white/10 ${
        align === "end" ? "text-right" : "text-left"
      }`}
    >
      <span className="block text-xs uppercase tracking-wide text-amber-200">{label}</span>
      {target.title}
    </button>
  );
}
