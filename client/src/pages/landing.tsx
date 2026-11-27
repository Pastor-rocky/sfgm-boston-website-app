import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import EventsSection from "@/components/events-section";
import AboutSection from "@/components/about-section";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-[200px_1fr] md:py-14">
          <Link href="/introduction-to-prophecy" className="mx-auto block w-full max-w-[200px]">
            <img
              src="/introduction-to-prophecy-front.jpg"
              alt="Introduction to Prophecy, by Teacher Larry Kaslov and Pastor Rocky Kaslov"
              className="w-full rounded-md shadow-2xl transition duration-200 hover:scale-[1.02]"
            />
          </Link>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Introduction to Prophecy
            </h1>
            <p className="mt-3 text-lg text-slate-200">
              Decoding the Divine Timeline. Read the book and listen to each chapter.
            </p>
            <p className="mt-2 text-sm text-slate-400">
              By Teacher Larry Kaslov · Co-authored by Pastor Rocky Kaslov
            </p>
            <div className="mt-6">
              <Link href="/introduction-to-prophecy">
                <Button className="bg-amber-500 px-8 py-6 text-base font-semibold text-slate-950 hover:bg-amber-400">
                  <i className="fas fa-book-open mr-3"></i>
                  Open the book
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="mx-auto grid max-w-6xl items-center gap-8 border-t border-white/10 px-4 py-10 sm:px-6 md:grid-cols-[200px_1fr] md:py-14">
          <Link href="/forever-changed" className="mx-auto block w-full max-w-[200px]">
            <img
              src="/forever-changed-cover.jpg"
              alt="Forever Changed, SFGM Boston"
              className="w-full rounded-md shadow-2xl transition duration-200 hover:scale-[1.02]"
            />
          </Link>
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-bold leading-tight sm:text-5xl">Forever Changed</h2>
            <p className="mt-3 text-lg text-slate-200">
              SFGM Boston. Listen to the album, song by song.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link href="/forever-changed">
                <Button className="bg-amber-500 px-8 py-6 text-base font-semibold text-slate-950 hover:bg-amber-400">
                  <i className="fas fa-play mr-3"></i>
                  Play the album
                </Button>
              </Link>
              <a
                href="https://images.sfgmboston.com/sfgm-public/forever-changed/Forever-Changed.zip"
                className="inline-flex items-center rounded-md border border-amber-400 px-8 py-6 text-base font-semibold text-amber-200 hover:bg-white/10"
              >
                <i className="fas fa-download mr-3"></i>
                Download the album
              </a>
            </div>
          </div>
        </div>
      </section>
      <HeroSection />
      <AboutSection />
      <EventsSection />
      
      {/* Dual school entry — Bible School + Roma Academy classroom */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Sovereign Grace · Boston
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Choose your school</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              One membership family. Two learning homes — Bible School here, Roma Academy classroom
              next door.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* SFGM Bible School — live */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
                Open now
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">SFGM Bible School</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Adult discipleship courses, Bible University tracks, and your existing student portal.
              </p>
              <div className="mt-6">
                {isAuthenticated ? (
                  <Link href="/bible-school">
                    <Button className="btn-primary w-full px-6 py-4 text-base shadow-lg sm:w-auto">
                      <i className="fas fa-graduation-cap mr-3"></i>
                      Enter Bible School
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={() => {
                      window.location.href = "/login";
                    }}
                    className="btn-primary w-full px-6 py-4 text-base shadow-lg sm:w-auto"
                  >
                    <i className="fas fa-sign-in-alt mr-3"></i>
                    Bible School Login
                  </Button>
                )}
              </div>
            </div>

            {/* SFGM Roma Academy — classroom app */}
            <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-8 shadow-sm">
              <span className="absolute right-4 top-4 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                Open
              </span>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-800">
                Family classroom
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">SFGM Roma Academy</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Preschool through Twelfth Grade — daily lessons, teacher cards, student screens, and
                Cast to a second tablet or TV. Open on a computer or tablet; on iPad use Share → Add
                to Home Screen for an app icon.
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => {
                    window.location.href = "/roma-academy";
                  }}
                  className="btn-primary w-full px-6 py-4 text-base shadow-lg sm:w-auto"
                >
                  <i className="fas fa-chalkboard-teacher mr-3"></i>
                  Open Roma Academy Classroom
                </Button>
                <p className="mt-3 text-xs text-slate-500">
                  Private family school. On a tablet: open the classroom, then Share → Add to Home
                  Screen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
