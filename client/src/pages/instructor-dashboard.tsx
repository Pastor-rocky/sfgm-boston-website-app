import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";

export default function InstructorDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reviewId, setReviewId] = useState<number | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"approved" | "rejected">("approved");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [expandedEssay, setExpandedEssay] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  const role = ((user as any)?.role ?? "").toLowerCase();
  const isInstructor = ["instructor", "admin", "dean"].includes(role);
  const userName = (user as any)?.firstName || (user as any)?.username || "Instructor";

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/instructor/students"],
    queryFn: async () => {
      const r = await fetch("/api/instructor/students", {
        headers: {},
        credentials: "include",
      });
      if (!r.ok) throw new Error("Failed to fetch students");
      return r.json();
    },
    enabled: isAuthenticated && isInstructor,
  });

  const { data: essays = [], isLoading: essaysLoading } = useQuery({
    queryKey: ["/api/instructor/essay-submissions"],
    queryFn: async () => {
      const r = await fetch("/api/instructor/essay-submissions", {
        headers: {},
        credentials: "include",
      });
      if (!r.ok) throw new Error("Failed to fetch essays");
      return r.json();
    },
    enabled: isAuthenticated && isInstructor,
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      feedback,
    }: {
      id: number;
      status: "approved" | "rejected";
      feedback?: string;
    }) => {
      return apiRequest("PATCH", `/api/instructor/essay-submissions/${id}/review`, {
        status,
        feedback: feedback || undefined,
      });
    },
    onSuccess: () => {
      toast({ title: "Review submitted", description: "Essay review has been saved." });
      queryClient.invalidateQueries({ queryKey: ["/api/instructor/essay-submissions"] });
      setReviewId(null);
      setReviewFeedback("");
      setExpandedEssay(null);
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message || "Failed to submit review", variant: "destructive" });
    },
  });

  const openReview = (id: number, status: "approved" | "rejected") => {
    setReviewId(id);
    setReviewStatus(status);
    setReviewFeedback("");
  };

  const submitReview = () => {
    if (reviewId == null) return;
    reviewMutation.mutate({ id: reviewId, status: reviewStatus, feedback: reviewFeedback || undefined });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-900 flex items-center justify-center">
        <Card className="max-w-md mx-4 border-amber-500/20 bg-slate-800/90">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-lock text-2xl text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Sign in required</h1>
            <p className="text-slate-300 mb-6">You must be logged in to access the Instructor Dashboard.</p>
            <Link href="/login">
              <Button className="bg-amber-600 hover:bg-amber-700">Log in</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isInstructor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-900 flex items-center justify-center">
        <Card className="max-w-md mx-4 border-amber-500/20 bg-slate-800/90">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-ban text-2xl text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Access denied</h1>
            <p className="text-slate-300 mb-6">Instructor Dashboard is only available to instructors, admins, and deans.</p>
            <Link href="/dashboard">
              <Button variant="outline" className="border-slate-600 text-slate-300">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingEssays = (essays as any[]).filter((e) => (e.status || "").toLowerCase() === "submitted");
  const reviewedEssays = (essays as any[]).filter((e) => (e.status || "").toLowerCase() !== "submitted");
  const totalStudents = (students as any[]).length;
  const activeStudents = (students as any[]).filter((s) => !s.isBlocked).length;
  const totalCourses = new Set((students as any[]).flatMap((s) => (s.enrolledCourses || []).map((c: any) => c.id))).size;
  const avgGPA = (students as any[]).filter((s) => s.gpa != null).length > 0
    ? ((students as any[]).filter((s) => s.gpa != null).reduce((sum, s) => sum + (s.gpa || 0), 0) / (students as any[]).filter((s) => s.gpa != null).length * 100).toFixed(1)
    : null;

  const filteredStudents = (students as any[]).filter((s) => {
    const matchesSearch = searchTerm === "" || 
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "all" || 
      (s.enrolledCourses || []).some((c: any) => c.id.toString() === selectedCourse);
    return matchesSearch && matchesCourse;
  });

  const allCourses = Array.from(new Set((students as any[]).flatMap((s) => s.enrolledCourses || []))).map((c: any) => ({ id: c.id, name: c.name }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-900">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-amber-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(251,191,36,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 text-amber-300 px-4 py-1.5 text-sm font-medium mb-4">
                <i className="fas fa-chalkboard-teacher" />
                <span>Instructor Dashboard</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Welcome back, {userName}!
              </h1>
              <p className="text-lg text-amber-100/90">
                Manage your students, review essays, and track progress
              </p>
              {role === "instructor" && (
                <p className="text-sm text-amber-200/70 mt-2 flex items-center gap-2">
                  <i className="fas fa-info-circle" />
                  Showing only students enrolled in your assigned courses
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  <i className="fas fa-arrow-left mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Total Students</p>
                  <p className="text-3xl font-bold">{totalStudents}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/30 flex items-center justify-center">
                  <i className="fas fa-users text-2xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-600 to-amber-700 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium mb-1">Pending Essays</p>
                  <p className="text-3xl font-bold">{pendingEssays.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-500/30 flex items-center justify-center">
                  <i className="fas fa-file-alt text-2xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Active Courses</p>
                  <p className="text-3xl font-bold">{totalCourses}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/30 flex items-center justify-center">
                  <i className="fas fa-book text-2xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-1">Average GPA</p>
                  <p className="text-3xl font-bold">{avgGPA ? `${avgGPA}%` : "—"}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-500/30 flex items-center justify-center">
                  <i className="fas fa-chart-line text-2xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <i className="fas fa-bolt text-amber-400" />
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <Link href="/student-management">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <i className="fas fa-users mr-2" />
                    Manage Students
                  </Button>
                </Link>
                <Link href="/message-student">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <i className="fas fa-envelope mr-2" />
                    Message Students
                  </Button>
                </Link>
                <Link href="/admin-panel">
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    <i className="fas fa-shield-alt mr-2" />
                    Admin Panel
                  </Button>
                </Link>
                {pendingEssays.length > 0 && (
                  <Button
                    onClick={() => {
                      const tabs = document.querySelector('[role="tablist"]');
                      const essaysTab = tabs?.querySelector('[value="essays"]') as HTMLElement;
                      essaysTab?.click();
                      setTimeout(() => {
                        const firstPending = document.querySelector('[data-essay-id]');
                        firstPending?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <i className="fas fa-exclamation-circle mr-2" />
                    Review Essays ({pendingEssays.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <i className="fas fa-home mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <i className="fas fa-users mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="grades" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <i className="fas fa-chart-line mr-2" />
              Grades
            </TabsTrigger>
            <TabsTrigger value="essays" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <i className="fas fa-file-alt mr-2" />
              Essays {pendingEssays.length > 0 && (
                <Badge className="ml-2 bg-red-600 text-white">{pendingEssays.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <i className="fas fa-clock text-amber-400" />
                    Recent Essay Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {essaysLoading ? (
                    <div className="text-center py-8 text-slate-400">Loading…</div>
                  ) : pendingEssays.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">No pending essays</div>
                  ) : (
                    <div className="space-y-3">
                      {pendingEssays.slice(0, 5).map((e) => (
                        <div
                          key={e.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-white">{e.studentName}</p>
                            <p className="text-sm text-slate-400">{e.courseName}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {e.submittedAt ? new Date(e.submittedAt).toLocaleDateString() : ""}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700"
                            onClick={() => {
                              const tabs = document.querySelector('[role="tablist"]');
                              const essaysTab = tabs?.querySelector('[value="essays"]') as HTMLElement;
                              essaysTab?.click();
                              setTimeout(() => openReview(e.id, "approved"), 100);
                            }}
                          >
                            Review
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <i className="fas fa-user-graduate text-blue-400" />
                    Top Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {studentsLoading ? (
                    <div className="text-center py-8 text-slate-400">Loading…</div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">No students found</div>
                  ) : (
                    <div className="space-y-3">
                      {filteredStudents
                        .filter((s) => s.gpa != null)
                        .sort((a, b) => (b.gpa || 0) - (a.gpa || 0))
                        .slice(0, 5)
                        .map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-white">
                                {s.firstName} {s.lastName}
                              </p>
                              <p className="text-sm text-slate-400">{s.email}</p>
                            </div>
                            <Badge className="bg-blue-600 text-white">
                              {(s.gpa! * 100).toFixed(1)}%
                            </Badge>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-white">My Students</CardTitle>
                    <CardDescription className="text-slate-400">
                      View and manage your students. Open Student Management for messaging and more.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 max-w-xs"
                    />
                    {allCourses.length > 0 && (
                      <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="px-3 py-2 rounded-md bg-slate-700 border border-slate-600 text-white text-sm"
                      >
                        <option value="all">All Courses</option>
                        {allCourses.map((c) => (
                          <option key={c.id} value={c.id.toString()}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {studentsLoading ? (
                  <div className="text-center py-8 text-slate-400">Loading students…</div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">No students found.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStudents.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-medium text-white">
                              {s.firstName} {s.lastName}
                            </p>
                            <p className="text-sm text-slate-400">{s.email}</p>
                            {s.gpa != null && (
                              <p className="text-xs text-slate-500 mt-1">
                                GPA: {(s.gpa * 100).toFixed(1)}%
                              </p>
                            )}
                          </div>
                          {s.isBlocked && (
                            <Badge variant="destructive" className="bg-red-600">
                              <i className="fas fa-ban mr-1" />
                              Blocked
                            </Badge>
                          )}
                        </div>
                        {((s.enrolledCourses as any[]) || []).length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-slate-500 mb-1">Enrolled in:</p>
                            <div className="flex flex-wrap gap-1">
                              {((s.enrolledCourses as any[]) || []).slice(0, 2).map((c: any) => (
                                <Badge key={c.id} variant="outline" className="text-xs border-slate-600 text-slate-300">
                                  {c.name}
                                </Badge>
                              ))}
                              {((s.enrolledCourses as any[]) || []).length > 2 && (
                                <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                                  +{((s.enrolledCourses as any[]) || []).length - 2} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        <Link href="/student-management">
                          <Button size="sm" variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                            <i className="fas fa-user-cog mr-2" />
                            Manage
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-6">
                  <Link href="/student-management">
                    <Button className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto">
                      <i className="fas fa-users mr-2" />
                      Open Student Management
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Grades Overview</CardTitle>
                <CardDescription className="text-slate-400">
                  Students and their course grades. Use Student Management for full details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {studentsLoading ? (
                  <div className="text-center py-8 text-slate-400">Loading…</div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">No students found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700 hover:bg-slate-800/50">
                          <TableHead className="text-slate-300">Student</TableHead>
                          <TableHead className="text-slate-300">Email</TableHead>
                          <TableHead className="text-slate-300">Courses</TableHead>
                          <TableHead className="text-slate-300">GPA</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((s) => (
                          <TableRow key={s.id} className="border-slate-700 hover:bg-slate-800/50">
                            <TableCell className="font-medium text-white">
                              {s.firstName} {s.lastName}
                            </TableCell>
                            <TableCell className="text-slate-400">{s.email}</TableCell>
                            <TableCell>
                              {((s.enrolledCourses as any[]) || []).length ? (
                                <div className="flex flex-wrap gap-1">
                                  {((s.enrolledCourses as any[]) || []).map((c: any) => (
                                    <Badge
                                      key={c.id}
                                      variant="outline"
                                      className="text-xs border-slate-600 text-slate-300"
                                    >
                                      {c.name}: {c.grade ?? "In progress"}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {s.gpa != null ? (
                                <Badge className={s.gpa >= 0.7 ? "bg-green-600" : s.gpa >= 0.6 ? "bg-yellow-600" : "bg-red-600"}>
                                  {(s.gpa * 100).toFixed(1)}%
                                </Badge>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                <div className="mt-6">
                  <Link href="/student-management">
                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      <i className="fas fa-chart-line mr-2" />
                      Student Management
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="essays" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Essay Submissions</CardTitle>
                <CardDescription className="text-slate-400">
                  Final exam essays submitted by students. Approve or reject each submission. Diplomas are presented in person only.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {essaysLoading ? (
                  <div className="text-center py-8 text-slate-400">Loading essays…</div>
                ) : (essays as any[]).length === 0 ? (
                  <div className="text-center py-8 text-slate-400">No essay submissions yet.</div>
                ) : (
                  <div className="space-y-6">
                    {pendingEssays.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                            <i className="fas fa-exclamation-circle text-amber-400" />
                            Pending Review ({pendingEssays.length})
                          </h3>
                        </div>
                        <div className="space-y-4">
                          {pendingEssays.map((e) => (
                            <div
                              key={e.id}
                              data-essay-id={e.id}
                              className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-5 space-y-4"
                            >
                              <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                    <i className="fas fa-user text-amber-400" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-white">{e.studentName}</p>
                                    <p className="text-xs text-slate-400">{e.studentEmail}</p>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                  <Badge className="bg-blue-600 text-white mr-2">{e.courseName}</Badge>
                                  <Badge variant="outline" className="border-slate-600 text-slate-300">
                                    {e.wordCount} words
                                  </Badge>
                                </div>
                                <div className="text-xs text-slate-400">
                                  <i className="fas fa-clock mr-1" />
                                  {e.submittedAt ? new Date(e.submittedAt).toLocaleString() : ""}
                                </div>
                              </div>
                              
                              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-sm font-medium text-slate-300">Essay Text:</p>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setExpandedEssay(expandedEssay === e.id ? null : e.id)}
                                    className="text-amber-400 hover:text-amber-300"
                                  >
                                    {expandedEssay === e.id ? (
                                      <>
                                        <i className="fas fa-chevron-up mr-1" />
                                        Collapse
                                      </>
                                    ) : (
                                      <>
                                        <i className="fas fa-chevron-down mr-1" />
                                        Expand
                                      </>
                                    )}
                                  </Button>
                                </div>
                                <p className={`text-slate-300 whitespace-pre-wrap ${expandedEssay === e.id ? "" : "line-clamp-3"}`}>
                                  {e.essayText}
                                </p>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 flex-1"
                                  onClick={() => openReview(e.id, "approved")}
                                >
                                  <i className="fas fa-check mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="flex-1"
                                  onClick={() => openReview(e.id, "rejected")}
                                >
                                  <i className="fas fa-times mr-2" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {reviewedEssays.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-white text-lg mb-4 flex items-center gap-2">
                          <i className="fas fa-check-circle text-green-400" />
                          Reviewed ({reviewedEssays.length})
                        </h3>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-slate-700 hover:bg-slate-800/50">
                                <TableHead className="text-slate-300">Student</TableHead>
                                <TableHead className="text-slate-300">Course</TableHead>
                                <TableHead className="text-slate-300">Status</TableHead>
                                <TableHead className="text-slate-300">Reviewed</TableHead>
                                <TableHead className="text-slate-300">Feedback</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {reviewedEssays.map((e) => (
                                <TableRow key={e.id} className="border-slate-700 hover:bg-slate-800/50">
                                  <TableCell className="font-medium text-white">{e.studentName}</TableCell>
                                  <TableCell className="text-slate-400">{e.courseName}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={e.status === "approved" ? "default" : "destructive"}
                                      className={e.status === "approved" ? "bg-green-600" : "bg-red-600"}
                                    >
                                      {e.status === "approved" ? (
                                        <>
                                          <i className="fas fa-check mr-1" />
                                          Approved
                                        </>
                                      ) : (
                                        <>
                                          <i className="fas fa-times mr-1" />
                                          Rejected
                                        </>
                                      )}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-slate-400 text-sm">
                                    {e.reviewedAt ? new Date(e.reviewedAt).toLocaleString() : "—"}
                                  </TableCell>
                                  <TableCell className="text-slate-400 text-sm max-w-xs truncate">
                                    {e.feedback || "—"}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={reviewId != null} onOpenChange={(open) => !open && setReviewId(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <i className={`fas ${reviewStatus === "approved" ? "fa-check-circle text-green-400" : "fa-times-circle text-red-400"}`} />
              {reviewStatus === "approved" ? "Approve" : "Reject"} Essay Submission
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {reviewId && (
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <p className="text-sm text-slate-400 mb-2">Student Essay:</p>
                <p className="text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {(essays as any[]).find((e) => e.id === reviewId)?.essayText || ""}
                </p>
              </div>
            )}
            <div>
              <Label className="text-slate-300">Feedback (optional)</Label>
              <Textarea
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                placeholder="Add feedback for the student…"
                className="mt-1 min-h-[100px] bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewId(null)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              className={reviewStatus === "approved" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              onClick={submitReview}
              disabled={reviewMutation.isPending}
            >
              {reviewMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2" />
                  Saving…
                </>
              ) : reviewStatus === "approved" ? (
                <>
                  <i className="fas fa-check mr-2" />
                  Approve
                </>
              ) : (
                <>
                  <i className="fas fa-times mr-2" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
