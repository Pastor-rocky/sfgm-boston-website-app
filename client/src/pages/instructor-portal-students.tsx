import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import InstructorPortalShell from "@/components/instructor-portal/portal-shell";
import { useInstructorAccess } from "@/hooks/useInstructorAccess";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StudentRow = {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  sfgmChurch?: string;
  gpaPercent?: number | null;
  enrollmentCount?: number;
  activeEnrollments?: number;
  completedEnrollments?: number;
  enrolledCourses?: { id: number; name: string; status: string }[];
  deanView?: boolean;
};

export default function InstructorPortalStudents() {
  useInstructorAccess();
  const { user } = useAuth();
  const role = ((user as { role?: string } | null)?.role ?? "").toLowerCase();
  const email = ((user as { email?: string } | null)?.email ?? "").toLowerCase();
  const isDean = role === "dean" || role === "admin" || email === "pastor_rocky@sfgmboston.com";
  const [search, setSearch] = useState("");
  const [churchFilter, setChurchFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");

  const { data: students = [], isLoading } = useQuery<StudentRow[]>({
    queryKey: ["/api/instructor/students"],
    queryFn: async () => {
      const r = await fetch("/api/instructor/students", { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load students");
      return r.json();
    },
  });

  const churches = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.sfgmChurch) set.add(s.sfgmChurch);
    });
    return [...set].sort();
  }, [students]);

  const courses = useMemo(() => {
    const map = new Map<number, string>();
    students.forEach((s) => {
      (s.enrolledCourses || []).forEach((c) => map.set(c.id, c.name));
    });
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [students]);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const name = `${s.firstName || ""} ${s.lastName || ""}`.trim();
    const matchesSearch =
      !q ||
      name.toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.username || "").toLowerCase().includes(q);
    const matchesChurch = churchFilter === "all" || (s.sfgmChurch || "") === churchFilter;
    const matchesCourse =
      courseFilter === "all" ||
      (s.enrolledCourses || []).some((c) => String(c.id) === courseFilter);
    return matchesSearch && matchesChurch && matchesCourse;
  });

  const totalEnrollments = students.reduce((n, s) => n + (s.enrollmentCount || 0), 0);

  return (
    <InstructorPortalShell
      title={isDean ? `All Students (${students.length})` : `My Students (${students.length})`}
      subtitle={
        isDean
          ? `${students.length} accounts in the database · ${totalEnrollments} total course enrollments`
          : `${students.length} students enrolled in your courses`
      }
    >
      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        <Input
          placeholder="Search name, email, or username…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="lg:max-w-xs"
        />
        <Select value={churchFilter} onValueChange={setChurchFilter}>
          <SelectTrigger className="lg:w-56">
            <SelectValue placeholder="Church" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All churches ({churches.length})</SelectItem>
            {churches.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="lg:w-64">
            <SelectValue placeholder="Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses ({courses.length})</SelectItem>
            {courses.map(([id, name]) => (
              <SelectItem key={id} value={String(id)}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-slate-600">Loading students from database…</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-600">
            {students.length === 0
              ? "No student accounts found in the database."
              : "No students match your filters."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((student) => {
            const name =
              [student.firstName, student.lastName].filter(Boolean).join(" ") || student.username;
            return (
              <Card key={student.id}>
                <CardContent className="py-4 flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{name}</p>
                    <p className="text-sm text-slate-600">{student.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {student.sfgmChurch ? (
                        <Badge variant="outline">{student.sfgmChurch}</Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-400">
                          No church on file
                        </Badge>
                      )}
                      {(student.enrollmentCount ?? 0) > 0 ? (
                        <Badge className="bg-[#0b4f6c]/10 text-[#0b4f6c]">
                          {student.enrollmentCount} course
                          {student.enrollmentCount === 1 ? "" : "s"} · {student.activeEnrollments}{" "}
                          active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-500">
                          Not enrolled in a course
                        </Badge>
                      )}
                      {student.gpaPercent != null ? (
                        <Badge variant="outline">Quiz avg {student.gpaPercent}%</Badge>
                      ) : null}
                    </div>
                    {(student.enrolledCourses || []).length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {student.enrolledCourses!.map((c) => (
                          <Badge
                            key={`${student.id}-${c.id}`}
                            className={
                              c.status === "completed"
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                            }
                          >
                            {c.name} ({c.status})
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <Link href={`/instructor-portal/students/${student.id}`}>
                    <Button className="bg-[#0b4f6c] hover:bg-[#093d54] shrink-0">
                      Open chart
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </InstructorPortalShell>
  );
}
