import { useState } from "react";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RomaLogin() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/roma/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, password, keepLoggedIn: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      window.location.href = data.classroomUrl || "/roma-academy";
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="mx-auto max-w-md px-4 py-10">
        <Link href="/roma-academy" className="text-sm font-semibold text-slate-600 underline">
          ← Roma Academy
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Family sign in</h1>
        <p className="mt-2 text-sm text-slate-600">Use the email or phone from your family account.</p>
        {error ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div>
            <Label>Email or phone</Label>
            <Input
              className="mt-1"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              className="mt-1"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" disabled={busy} className="w-full bg-amber-500 text-amber-950">
            {busy ? "Signing in…" : "Sign in & open classroom"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          New family?{" "}
          <Link href="/roma-academy/register" className="font-semibold underline">
            Create an account
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
