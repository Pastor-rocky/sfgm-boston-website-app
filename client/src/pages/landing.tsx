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
      
      {/* Enroll in Bible School Button Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {isAuthenticated ? (
              <Link href="/bible-school">
                <Button className="btn-primary px-8 py-4 text-lg shadow-lg">
                  <i className="fas fa-graduation-cap mr-3"></i>Enroll in Bible School
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={() => window.location.href = '/login'}
                className="btn-primary px-8 py-4 text-lg shadow-lg"
              >
                <i className="fas fa-graduation-cap mr-3"></i>Enroll in Bible School
              </Button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
