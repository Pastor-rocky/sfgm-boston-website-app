import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import InstructorPortalShell from "@/components/instructor-portal/portal-shell";
import { useInstructorAccess } from "@/hooks/useInstructorAccess";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Users,
  MessageSquare,
  Award,
  GraduationCap,
  AlertCircle,
  BarChart3,
  BookOpen,
  Shield,
  UserPlus,
  ChevronRight,
  Clock,
  Church,
  Layers,
} from "lucide-react";

type DashboardStats = {
  role: string;
  deanAccess: boolean;
  totalStudents: number;
  studentsWithEnrollments: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  totalCourses: number;
  pendingEssays: number;
  certificatesIssued: number;
  certificatesPending: number;
  churches: { name: string; count: number }[];
  courseEnrollmentCounts: {
    courseId: number;
    courseName: string;
    enrollments: number;
    active: number;
    completed: number;
  }[];
  recentEnrollments: {
    studentName: string;
    courseName: string;
    status: string;
    enrolledAt: string;
  }[];
  pendingEssayPreview: {
    id: number;
    studentName: string;
    courseName: string;
    wordCount: number;
    submittedAt: string;
  }[];
};

export default function InstructorPortalHome() {
  useInstructorAccess();
  const { user } = useAuth();
  const role = ((user as { role?: string } | null)?.role ?? "").toLowerCase();
  const email = ((user as { email?: string } | null)?.email ?? "").toLowerCase();
  const isDean = role === "dean" || role === "admin" || email === "pastor_rocky@sfgmboston.com";
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "Instructor";

  const { data: stats, isLoading, isError, refetch } = useQuery<DashboardStats>({
    queryKey: ["/api/instructor/dashboard/stats"],
    queryFn: async () => {
      const r = await fetch("/api/instructor/dashboard/stats", { credentials: "include" });
      if (!r.ok) throw new Error(`Dashboard stats failed (${r.status})`);
      return r.json();
    },
    retry: 1,
  });

  const { data: fallbackStudents = [] } = useQuery({
    queryKey: ["/api/instructor/students"],
    queryFn: async () => {
      const r = await fetch("/api/instructor/students", { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load students");
      return r.json();
    },
    enabled: isError || (!isLoading && !stats),
  });

  const { data: fallbackEssays = [] } = useQuery({
    queryKey: ["/api/instructor/essay-submissions"],
    queryFn: async () => {
      const r = await fetch("/api/instructor/essay-submissions", { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load essays");
      return r.json();
    },
    enabled: isError || (!isLoading && !stats),
  });

  const s: DashboardStats | null =
    stats ??
    (fallbackStudents.length || fallbackEssays.length
      ? {
          role: isDean ? "dean" : "instructor",
          deanAccess: isDean,
          totalStudents: fallbackStudents.length,
          studentsWithEnrollments: fallbackStudents.filter(
            (st: { enrollmentCount?: number }) => (st.enrollmentCount ?? 0) > 0,
          ).length,
          totalEnrollments: fallbackStudents.reduce(
            (n: number, st: { enrollmentCount?: number }) => n + (st.enrollmentCount ?? 0),
            0,
          ),
          activeEnrollments: fallbackStudents.reduce(
            (n: number, st: { activeEnrollments?: number }) => n + (st.activeEnrollments ?? 0),
            0,
          ),
          completedEnrollments: fallbackStudents.reduce(
            (n: number, st: { completedEnrollments?: number }) =>
              n + (st.completedEnrollments ?? 0),
            0,
          ),
          totalCourses: 0,
          pendingEssays: fallbackEssays.filter((e: { status: string }) => e.status === "submitted")
            .length,
          certificatesIssued: 0,
          certificatesPending: 0,
          churches: [],
          courseEnrollmentCounts: [],
          recentEnrollments: [],
          pendingEssayPreview: fallbackEssays
            .filter((e: { status: string }) => e.status === "submitted")
            .slice(0, 6)
            .map((e: any) => ({
              id: e.id,
              studentName: e.studentName,
              courseName: e.courseName,
              wordCount: e.wordCount,
              submittedAt: e.submittedAt,
            })),
        }
      : null);

  const commandActions = useMemo(() => {
    if (!s) return [];
    const items = [
      {
        href: "/instructor-portal/essays",
        label: "Essay Inbox",
        description:
          s.pendingEssays === 0
            ? "No final exam essays waiting"
            : `${s.pendingEssays} essay${s.pendingEssays === 1 ? "" : "s"} awaiting your review`,
        icon: FileText,
        badge: s.pendingEssays > 0 ? s.pendingEssays : undefined,
        accent: "from-amber-500 to-orange-600",
      },
      {
        href: "/instructor-portal/certificates",
        label: "Issue Certificate",
        description:
          s.certificatesPending === 0
            ? `${s.certificatesIssued} certificate${s.certificatesIssued === 1 ? "" : "s"} issued to date`
            : `${s.certificatesPending} completed course${s.certificatesPending === 1 ? "" : "s"} need a certificate`,
        icon: Award,
        badge: s.certificatesPending > 0 ? s.certificatesPending : undefined,
        accent: "from-emerald-500 to-teal-600",
      },
      {
        href: "/instructor-portal/students",
        label: isDean ? "All Students" : "My Students",
        description: `${s.totalStudents} student${s.totalStudents === 1 ? "" : "s"} · ${s.totalEnrollments} course enrollment${s.totalEnrollments === 1 ? "" : "s"}`,
        icon: Users,
        badge: s.totalStudents > 0 ? s.totalStudents : undefined,
        accent: "from-[#0b4f6c] to-cyan-700",
      },
      {
        href: "/instructor-portal/messages",
        label: "Messages",
        description: `Contact any of your ${s.studentsWithEnrollments} enrolled student${s.studentsWithEnrollments === 1 ? "" : "s"}`,
        icon: MessageSquare,
        accent: "from-violet-500 to-purple-600",
      },
      {
        href: "/deacon-certificate-generator",
        label: "Deacon Course Certificates",
        description: "Generate Deaconship Course completion awards",
        icon: GraduationCap,
        accent: "from-blue-500 to-indigo-600",
      },
      {
        href: "/bible-school",
        label: "Bible School",
        description: `${s.totalCourses} active Bible School course${s.totalCourses === 1 ? "" : "s"} on the site`,
        icon: BookOpen,
        accent: "from-slate-600 to-slate-800",
      },
      {
        href: "/admin-panel",
        label: "Admin Panel",
        description: "Manage user accounts, roles, and church assignments",
        icon: Shield,
        accent: "from-purple-600 to-fuchsia-700",
        show: isDean,
      },
      {
        href: "/instructor-portal/dean-tools",
        label: "Dean Tools",
        description: "Zoom, Google Calendar, CSV export, integration status",
        icon: Shield,
        accent: "from-indigo-600 to-blue-700",
        show: isDean,
      },
      {
        href: "/instructor-portal/applications",
        label: "Instructor Applications",
        description: "Review teach-with-us applications from SFGM churches",
        icon: UserPlus,
        accent: "from-rose-500 to-pink-600",
        show: isDean,
      },
      {
        href: "/instructor-application",
        label: "Apply to Teach",
        description: "Public application form for prospective instructors",
        icon: UserPlus,
        accent: "from-rose-400 to-pink-500",
        show: !isDean,
      },
    ];
    return items.filter((i) => i.show !== false);
  }, [s, isDean]);

  if (isLoading && !s) {
    return (
      <InstructorPortalShell title="Loading…" subtitle="Pulling live numbers from the database">
        <p className="text-slate-600">Loading dashboard…</p>
      </InstructorPortalShell>
    );
  }

  if (!s) {
    return (
      <InstructorPortalShell title="Dashboard unavailable" subtitle="Could not load statistics">
        <p className="text-slate-600 mb-4">
          The dashboard could not reach the server. Try refreshing the page.
        </p>
        <Button onClick={() => refetch()} className="bg-[#0b4f6c] hover:bg-[#093d54]">
          Retry
        </Button>
      </InstructorPortalShell>
    );
  }

  return (
    <InstructorPortalShell
      title={s.deanAccess ? "Dean Command Center" : "Instructor Dashboard"}
      subtitle={
        s.deanAccess
          ? `${displayName} — full Bible School access across ${s.churches.length} church${s.churches.length === 1 ? "" : "es"} and ${s.totalCourses} courses.`
          : `${displayName} — ${s.totalStudents} students across your assigned courses.`
      }
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b4f6c] via-[#0d5f7f] to-[#093d54] text-white p-6 md:p-8 mb-8 shadow-xl">
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            {s.deanAccess ? (
              <Badge className="mb-3 bg-amber-400 text-amber-950 hover:bg-amber-400">Dean access</Badge>
            ) : null}
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {s.totalStudents} students · {s.totalEnrollments} enrollments
            </h2>
            <p className="text-white/80 mt-2">
              {s.activeEnrollments} active · {s.completedEnrollments} completed · {s.pendingEssays}{" "}
              essays pending · {s.certificatesIssued} certificates issued
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            {[
              { label: "Students", value: s.totalStudents, icon: Users },
              { label: "Enrollments", value: s.totalEnrollments, icon: Layers },
              { label: "Churches", value: s.churches.length, icon: Church },
              { label: "Essays due", value: s.pendingEssays, icon: FileText },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-center"
              >
                <stat.icon className="h-4 w-4 mx-auto mb-1 text-white/70" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-wide text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {s.courseEnrollmentCounts.length > 0 ? (
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#0b4f6c]" />
              Enrollments by course
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {s.courseEnrollmentCounts
                .filter((c) => c.enrollments > 0)
                .sort((a, b) => b.enrollments - a.enrollments)
                .map((c) => (
                  <div
                    key={c.courseId}
                    className="flex justify-between items-center rounded-lg border px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-slate-800 truncate pr-2">{c.courseName}</span>
                    <span className="text-slate-500 shrink-0">
                      {c.enrollments} enrolled ({c.active} active)
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick actions</h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {commandActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Card className="group h-full cursor-pointer border-slate-200 hover:border-[#0b4f6c]/40 hover:shadow-lg transition-all overflow-hidden">
                  <div className={`h-1.5 bg-gradient-to-r ${action.accent}`} />
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${action.accent} text-white`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {action.badge != null ? (
                        <Badge className="bg-rose-500 hover:bg-rose-500 text-white">{action.badge}</Badge>
                      ) : null}
                    </div>
                    <p className="font-semibold text-slate-900">{action.label}</p>
                    <p className="text-sm text-slate-600 mt-1 leading-snug">{action.description}</p>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#0b4f6c] mt-3" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-amber-200/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Essays awaiting review
              {s.pendingEssays > 0 ? (
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 ml-auto">
                  {s.pendingEssays}
                </Badge>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {s.pendingEssayPreview.length === 0 ? (
              <p className="text-slate-600 text-sm py-6 text-center">
                No pending essays in the database right now.
              </p>
            ) : (
              s.pendingEssayPreview.map((essay) => (
                <div
                  key={essay.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50/50 p-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{essay.studentName}</p>
                    <p className="text-sm text-slate-600">{essay.courseName}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {essay.wordCount} words · {new Date(essay.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <Link href="/instructor-portal/essays">
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700 shrink-0">
                      Review
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Latest enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            {s.recentEnrollments.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">No enrollments in the database yet.</p>
            ) : (
              <ul className="space-y-3">
                {s.recentEnrollments.map((item, i) => (
                  <li key={i} className="text-sm border-b pb-2 last:border-0">
                    <p className="font-medium text-slate-800">{item.studentName}</p>
                    <p className="text-slate-600">{item.courseName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.status} ·{" "}
                      {item.enrolledAt
                        ? new Date(item.enrolledAt).toLocaleDateString()
                        : "date unknown"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {s.churches.length > 0 ? (
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Students by SFGM church</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {s.churches.map((c) => (
                <Badge key={c.name} variant="outline" className="text-sm py-1 px-3">
                  {c.name}: {c.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </InstructorPortalShell>
  );
}
