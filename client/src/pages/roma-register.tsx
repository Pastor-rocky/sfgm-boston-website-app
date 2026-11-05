import { useState } from "react";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const GRADES = [
  "Preschool",
  "Kindergarten",
  "First Grade",
  "Second Grade",
  "Third Grade",
  "Fourth Grade",
  "Fifth Grade",
  "Sixth Grade",
  "Seventh Grade",
  "Eighth Grade",
  "Ninth Grade",
  "Tenth Grade",
  "Eleventh Grade",
  "Twelfth Grade",
];

type Child = { fullName: string; dateOfBirth: string; grade: string };

/** Age on Sept 1 of the current school year → suggested grade (parent may change). */
function gradeFromDob(iso: string): string {
  const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "Preschool";
  const birth = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const now = new Date();
  const startY = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  const cutoff = new Date(startY, 8, 1);
  let age = cutoff.getFullYear() - birth.getFullYear();
  if (
    cutoff.getMonth() < birth.getMonth() ||
    (cutoff.getMonth() === birth.getMonth() && cutoff.getDate() < birth.getDate())
  ) {
    age -= 1;
  }
  if (age >= 17) return "Twelfth Grade";
  if (age >= 16) return "Eleventh Grade";
  if (age >= 15) return "Tenth Grade";
  if (age >= 14) return "Ninth Grade";
  if (age >= 13) return "Eighth Grade";
  if (age >= 12) return "Seventh Grade";
  if (age >= 11) return "Sixth Grade";
  if (age >= 10) return "Fifth Grade";
  if (age >= 9) return "Fourth Grade";
  if (age >= 8) return "Third Grade";
  if (age >= 7) return "Second Grade";
  if (age >= 6) return "First Grade";
  if (age >= 5) return "Kindergarten";
  return "Preschool";
}

export default function RomaRegister() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    parentFirstName: "",
    parentLastName: "",
    parent2Name: "",
    email: "",
    phone: "",
    password: "",
    addressLine1: "",
    city: "",
    state: "MA",
    zip: "",
    schoolDistrict: "",
  });
  const [children, setChildren] = useState<Child[]>([
    { fullName: "", dateOfBirth: "", grade: "Preschool" },
  ]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/roma/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form, children }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      window.location.href = data.classroomUrl || data.user?.redirectUrl || "/roma-academy";
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Link href="/roma-academy" className="text-sm font-semibold text-slate-600 underline">
          ← Roma Academy
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Create family account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Email, phone, parent name, and each child’s name and date of birth. Used for login and to
          fill district forms in the classroom.
        </p>
        {error ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["parentFirstName", "Parent first name"],
                ["parentLastName", "Parent last name"],
                ["parent2Name", "Second parent (optional)"],
                ["email", "Email"],
                ["phone", "Phone"],
                ["password", "Password"],
                ["addressLine1", "Home address"],
                ["city", "City / town"],
                ["zip", "ZIP"],
                ["schoolDistrict", "School district (optional)"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className={key === "addressLine1" ? "sm:col-span-2" : ""}>
                <Label>{label}</Label>
                <Input
                  className="mt-1"
                  type={key === "password" ? "password" : key === "email" ? "email" : "text"}
                  required={!["parent2Name", "schoolDistrict", "addressLine1", "city", "zip"].includes(key)}
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Children</Label>
              <button
                type="button"
                className="text-sm font-semibold text-amber-900 underline"
                onClick={() =>
                  setChildren([...children, { fullName: "", dateOfBirth: "", grade: "Preschool" }])
                }
              >
                + Add child
              </button>
            </div>
            {children.map((c, i) => (
              <div key={i} className="mb-3 grid gap-2 rounded-xl border bg-white p-3 sm:grid-cols-3">
                <Input
                  placeholder="Full legal name"
                  required
                  value={c.fullName}
                  onChange={(e) => {
                    const next = [...children];
                    next[i] = { ...c, fullName: e.target.value };
                    setChildren(next);
                  }}
                />
                <Input
                  type="date"
                  required
                  value={c.dateOfBirth}
                  onChange={(e) => {
                    const dob = e.target.value;
                    const next = [...children];
                    next[i] = {
                      ...c,
                      dateOfBirth: dob,
                      grade: dob ? gradeFromDob(dob) : c.grade,
                    };
                    setChildren(next);
                  }}
                />
                <select
                  className="rounded-md border px-3 py-2 text-sm"
                  value={c.grade}
                  onChange={(e) => {
                    const next = [...children];
                    next[i] = { ...c, grade: e.target.value };
                    setChildren(next);
                  }}
                  title="Suggested from date of birth — change if needed"
                >
                  {GRADES.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <Button type="submit" disabled={busy} className="bg-amber-500 text-amber-950">
            {busy ? "Creating…" : "Create account & open classroom"}
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
