import { useEffect, useState } from "react";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import {
  CHURCH_ADDRESS,
  CHURCH_SERVICES,
  getServiceCountdown,
  type ChurchService,
  type ServiceCountdown,
} from "@/lib/church-services";

const SERVICE_META: Record<
  string,
  { type: string; color: string; location: string }
> = {
  "street-ministry": {
    type: "Street Ministry",
    color: "bg-teal-500",
    location: "Community outreach locations",
  },
  "sunday-worship": {
    type: "Weekly Service",
    color: "bg-blue-500",
    location: "SFGM Boston Sanctuary",
  },
  "family-night": {
    type: "Family Night",
    color: "bg-purple-500",
    location: CHURCH_ADDRESS,
  },
  "young-mens-bible-study": {
    type: "Men's Ministry",
    color: "bg-indigo-500",
    location: CHURCH_ADDRESS,
  },
  "womens-bible-study": {
    type: "Women's Ministry",
    color: "bg-pink-500",
    location: CHURCH_ADDRESS,
  },
};

function CountdownDisplay({ countdown }: { countdown: ServiceCountdown }) {
  if (countdown.isHappeningNow) {
    return (
      <div className="rounded-xl bg-green-500/20 border border-green-400/40 px-4 py-3 text-center">
        <p className="text-green-300 font-bold text-lg">Happening now!</p>
      </div>
    );
  }

  const units = [
    { label: "Days", value: countdown.days },
    { label: "Hours", value: countdown.hours },
    { label: "Minutes", value: countdown.minutes },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {units.map((unit) => (
        <div
          key={unit.label}
          className="rounded-xl bg-slate-900/50 border border-white/10 px-2 py-3 text-center"
        >
          <div className="text-2xl md:text-3xl font-bold text-white tabular-nums">
            {String(unit.value).padStart(2, "0")}
          </div>
          <div className="text-xs uppercase tracking-wide text-gray-400 mt-1">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function ServiceEventCard({
  service,
  now,
}: {
  service: ChurchService;
  now: Date;
}) {
  const meta = SERVICE_META[service.id] ?? {
    type: "Service",
    color: "bg-slate-500",
    location: CHURCH_ADDRESS,
  };
  const countdown = getServiceCountdown(service, now);

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <i className={`${service.icon} text-white`}></i>
            </div>
            <CardTitle className="text-white text-lg leading-snug">
              {service.label}
            </CardTitle>
          </div>
          <Badge className={`${meta.color} text-white border-0 shrink-0`}>
            {meta.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center text-gray-300">
            <Calendar className="h-4 w-4 mr-2 text-blue-400 shrink-0" />
            <span className="text-sm">{service.dayLabel}</span>
          </div>
          <div className="flex items-center text-gray-300">
            <Clock className="h-4 w-4 mr-2 text-green-400 shrink-0" />
            <span className="text-sm">{service.time}</span>
          </div>
          <div className="flex items-center text-gray-300">
            <MapPin className="h-4 w-4 mr-2 text-red-400 shrink-0" />
            <span className="text-sm">{meta.location}</span>
          </div>
        </div>

        {service.description && (
          <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>
        )}

        <div>
          <p className="text-xs uppercase tracking-wide text-purple-300 font-semibold mb-2">
            Next service in
          </p>
          {countdown ? (
            <CountdownDisplay countdown={countdown} />
          ) : (
            <p className="text-gray-400 text-sm">Schedule coming soon</p>
          )}
        </div>

        {service.href && (
          <Link
            href={service.href}
            className="inline-flex items-center text-amber-400 hover:text-amber-300 transition-colors text-sm font-medium"
          >
            <i className="fas fa-arrow-right mr-2"></i>
            View more
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export default function Events() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            <i className="fas fa-calendar-check mr-4 text-pink-400"></i>
            Weekly Services
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Countdowns to our regular services at SFGM Boston. All are welcome.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {CHURCH_SERVICES.map((service) => (
            <ServiceEventCard key={service.id} service={service} now={now} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm border-purple-500/30 max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-white text-2xl font-bold mb-4">
                <i className="fas fa-heart mr-2 text-red-400"></i>
                Come As You Are
              </h3>
              <p className="text-gray-300 text-lg mb-6">
                Join us for worship, fellowship, and spiritual growth at{" "}
                {CHURCH_ADDRESS}.
              </p>
              <div className="flex flex-col md:flex-row justify-center gap-4">
                <Link
                  href="/contact"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  Contact Us
                </Link>
                <Link
                  href="/past-services"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <i className="fas fa-video mr-2"></i>
                  Watch Past Services
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
