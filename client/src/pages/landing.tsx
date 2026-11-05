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
