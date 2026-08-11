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
      
      {/* Dual school entry — Bible School live · Roma Academy Coming Soon */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Sovereign Grace · Boston
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Choose your school</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              One membership family. Two learning homes on sfgmboston.com — no separate domain.
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

            {/* SFGM Roma Academy — Coming Soon (not public yet) */}
            <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-8 shadow-sm">
              <span className="absolute right-4 top-4 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-950">
                Coming Soon
              </span>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-800">
                In development
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">SFGM Roma Academy</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Preschool–High School curriculum library, Flip Book lessons, and classroom presentation
                tools for families. Same SFGM membership — children&apos;s assessments and Bible courses
                for kids will live here when we open the doors.
              </p>
              <div className="mt-6">
                <Button
                  disabled
                  className="w-full cursor-not-allowed px-6 py-4 text-base opacity-70 sm:w-auto"
                  variant="secondary"
                >
                  <i className="fas fa-lock mr-3"></i>
                  Roma Academy Login — Coming Soon
                </Button>
                <p className="mt-3 text-xs text-slate-500">
                  Not available to the public yet. Beta testing stays private until the academy is
                  finished.
                </p>
                <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
                  Curriculum materials drawn from the Core Knowledge Foundation&apos;s openly licensed
                  resources at{" "}
                  <a
                    href="https://www.coreknowledge.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-slate-600"
                  >
                    coreknowledge.org
                  </a>
                  . Special thanks to the Core Knowledge® Foundation for making these materials
                  available to schools and families.
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
