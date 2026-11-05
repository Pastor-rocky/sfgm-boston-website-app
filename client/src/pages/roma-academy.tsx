import { useEffect, useState } from "react";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const CLASSROOM = "https://roma-academy-classroom.pages.dev/";

type Family = {
  parentFirstName?: string;
  parentLastName?: string;
  children?: { fullName: string; dateOfBirth: string; grade?: string }[];
};

export default function RomaAcademyPortal() {
  const { isAuthenticated } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [handoff, setHandoff] = useState(CLASSROOM);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/roma/family", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.family) setFamily(data.family);
      })
      .catch(() => {});
    fetch("/api/roma/classroom-handoff", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.url) setHandoff(data.url);
      })
      .catch(() => setNote("Open the classroom below; sign in on Forms if needed."));
  }, [isAuthenticated]);

  const parent = family
    ? `${family.parentFirstName || ""} ${family.parentLastName || ""}`.trim()
    : "";

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-800">
          SFGM Boston · Family classroom
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Roma Academy</h1>
        <p className="mt-3 text-slate-600">
          Register once with parent name, email, phone, and each child’s name and date of birth.
          District forms in the classroom fill from that account — you sign and send.
        </p>

        {parent ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="font-semibold text-emerald-950">Signed in as {parent}</p>
            {family?.children?.length ? (
              <ul className="mt-2 list-inside list-disc text-sm text-emerald-900">
                {family.children.map((c) => (
                  <li key={c.fullName}>
                    {c.fullName}
                    {c.dateOfBirth ? ` · born ${c.dateOfBirth}` : ""}
                    {c.grade ? ` · ${c.grade}` : ""}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/roma-academy/register">
              <Button className="bg-amber-500 text-amber-950 hover:bg-amber-600">
                Create family account
              </Button>
            </Link>
            <Link href="/roma-academy/login">
              <Button variant="outline">Sign in</Button>
            </Link>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Open the classroom</h2>
          <p className="mt-2 text-sm text-slate-600">
            Lessons, Cast to a TV or second tablet, textbooks, and Forms. On iPad: Share → Add to
            Home Screen.
          </p>
          {note ? <p className="mt-2 text-xs text-slate-500">{note}</p> : null}
          <Button
            className="mt-4"
            onClick={() => {
              window.location.href = handoff;
            }}
          >
            Enter Roma Academy Classroom
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
