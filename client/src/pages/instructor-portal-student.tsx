import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import InstructorPortalShell from "@/components/instructor-portal/portal-shell";
import { useInstructorAccess } from "@/hooks/useInstructorAccess";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function InstructorPortalStudentChart() {
  useInstructorAccess();
  const [, params] = useRoute("/instructor-portal/students/:id");
  const studentId = params?.id || "";

  const { data: students = [] } = useQuery({
    queryKey: ["/api/instructor/students"],
    queryFn: async () => {
      const r = await fetch("/api/instructor/students", { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load students");
      return r.json();
    },
    enabled: !!studentId,
  });

  const { data: gradesData } = useQuery({
    queryKey: ["/api/instructor/students", studentId, "grades"],
    queryFn: async () => {
      const r = await fetch(`/api/instructor/students/${studentId}/grades`, {
        credentials: "include",
      });
      if (!r.ok) throw new Error("Failed to load grades");
      return r.json();
    },
    enabled: !!studentId,
  });

  const { data: essays = [] } = useQuery({
    queryKey: ["/api/instructor/essay-submissions"],
    queryFn: async () => {
      const r = await fetch("/api/instructor/essay-submissions", { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load essays");
      return r.json();
    },
    enabled: !!studentId,
  });

  const student = students.find((s: { id: string }) => s.id === studentId);
  const studentEssays = essays.filter((e: { studentId: string }) => e.studentId === studentId);
  const grades = gradesData?.grades || [];

  if (!student && students.length > 0) {
    return (
      <InstructorPortalShell title="Student not found">
        <Link href="/instructor-portal/students">
          <Button variant="outline">Back to students</Button>
        </Link>
      </InstructorPortalShell>
    );
  }

  const name =
    student &&
    ([student.firstName, student.lastName].filter(Boolean).join(" ") || student.username);

  return (
    <InstructorPortalShell
      title={name || "Student chart"}
      subtitle={student?.sfgmChurch || student?.email || ""}
    >
      <div className="mb-6">
        <Link href="/instructor-portal/students">
          <Button variant="outline" size="sm">
            ← Back to students
          </Button>
        </Link>
        <Link href={`/instructor-portal/messages?studentId=${studentId}`}>
          <Button className="ml-2 bg-[#0b4f6c] hover:bg-[#093d54]" size="sm">
            Message student
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="essays">Essays</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-600">Email</CardTitle>
              </CardHeader>
              <CardContent className="text-sm font-medium">{student?.email || "—"}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-600">Phone</CardTitle>
              </CardHeader>
              <CardContent className="text-sm font-medium">{student?.phone || "—"}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-600">GPA</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {student?.gpa != null ? `${student.gpa}%` : "—"}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="grades">
          <Card>
            <CardContent className="py-4 space-y-3">
              {grades.length === 0 ? (
                <p className="text-slate-600 text-sm">No quiz attempts yet.</p>
              ) : (
                grades.map((g: any) => (
                  <div
                    key={`${g.quizId}-${g.completedAt}`}
                    className="flex justify-between items-center border-b pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{g.quizTitle}</p>
                      <p className="text-xs text-slate-500">
                        {g.completedAt ? new Date(g.completedAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                    <Badge className={g.passed ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}>
                      {g.scorePercent}%
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="essays">
          <Card>
            <CardContent className="py-4 space-y-3">
              {studentEssays.length === 0 ? (
                <p className="text-slate-600 text-sm">No essays submitted.</p>
              ) : (
                studentEssays.map((e: any) => (
                  <div key={e.id} className="border rounded-lg p-3">
                    <div className="flex justify-between gap-2">
                      <p className="font-medium">{e.courseName}</p>
                      <Badge>{e.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {e.wordCount} words · {new Date(e.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardContent className="py-4 space-y-3">
              {(student?.enrolledCourses || []).length === 0 ? (
                <p className="text-slate-600 text-sm">No enrollments.</p>
              ) : (
                student.enrolledCourses.map((course: any) => (
                  <div key={course.id} className="flex justify-between items-center border-b pb-3">
                    <div>
                      <p className="font-medium">{course.name || course.courseName}</p>
                      <p className="text-xs text-slate-500">Status: {course.status || "active"}</p>
                    </div>
                    <p className="font-semibold text-[#0b4f6c]">
                      {course.grade != null ? `${course.grade}%` : "—"}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </InstructorPortalShell>
  );
}
