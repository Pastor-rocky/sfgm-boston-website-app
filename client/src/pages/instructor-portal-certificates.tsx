import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import InstructorPortalShell from "@/components/instructor-portal/portal-shell";
import { useInstructorAccess } from "@/hooks/useInstructorAccess";
import { useAuth } from "@/hooks/useAuth";
import Certificate from "@/components/certificate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Award, CheckCircle2, Search } from "lucide-react";

type EligibleRow = {
  studentId: string;
  studentName: string;
  courseId: number;
  courseName: string;
  enrollmentStatus: string;
  hasCertificate: boolean;
  certificateNumber: string | null;
  sfgmChurch: string | null;
  readyForCert?: boolean;
};

type IssuedCert = {
  id: number;
  certificateNumber: string;
  studentName: string;
  courseTitle: string;
  issueDate: string;
  completionDate: string;
};

export default function InstructorPortalCertificates() {
  useInstructorAccess();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedKey, setSelectedKey] = useState("");
  const [finalGrade, setFinalGrade] = useState("");
  const [completionDate, setCompletionDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const instructorName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    "SFGM Instructor";

  const { data: eligible = [], isLoading } = useQuery<EligibleRow[]>({
    queryKey: ["/api/instructor/certificates/eligible"],
    queryFn: async () => {
      const r = await fetch("/api/instructor/certificates/eligible", { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load students");
      return r.json();
    },
  });

  const { data: issued = [] } = useQuery<IssuedCert[]>({
    queryKey: ["/api/instructor/certificates"],
    queryFn: async () => {
      const r = await fetch("/api/instructor/certificates", { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load certificates");
      return r.json();
    },
  });

  const pending = useMemo(
    () => eligible.filter((e) => e.readyForCert || (e.enrollmentStatus === "completed" && !e.hasCertificate)),
    [eligible],
  );

  const issueable = useMemo(
    () => eligible.filter((e) => !e.hasCertificate),
    [eligible],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return issueable.filter(
      (e) =>
        !q ||
        e.studentName.toLowerCase().includes(q) ||
        e.courseName.toLowerCase().includes(q) ||
        (e.sfgmChurch || "").toLowerCase().includes(q),
    );
  }, [issueable, search]);

  const selected = useMemo(() => {
    if (!selectedKey) return null;
    const [studentId, courseId] = selectedKey.split("|");
    return issueable.find(
      (e) => e.studentId === studentId && String(e.courseId) === courseId,
    );
  }, [selectedKey, issueable]);

  const issueMutation = useMutation({
    mutationFn: async () => {
      if (!selected) throw new Error("Select a student and course");
      return apiRequest("POST", "/api/instructor/certificates/issue", {
        studentId: selected.studentId,
        courseId: selected.courseId,
        finalGrade: finalGrade ? Number(finalGrade) : undefined,
        completionDate,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instructor/certificates/eligible"] });
      queryClient.invalidateQueries({ queryKey: ["/api/instructor/certificates"] });
      setSelectedKey("");
      setFinalGrade("");
      toast({
        title: "Certificate issued",
        description: "The student can view it under My Certificates and in their portal inbox.",
      });
    },
    onError: (err: Error) => {
      toast({ title: "Could not issue certificate", description: err.message, variant: "destructive" });
    },
  });

  const previewDate = completionDate
    ? new Date(completionDate + "T12:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <InstructorPortalShell
      title="Certificates"
      subtitle="Issue official Certificates of Completion to students who finished your courses."
    >
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardContent className="pt-6">
            <p className="text-sm text-emerald-800 font-medium">Completed, no certificate yet</p>
            <p className="text-3xl font-bold text-emerald-900">{pending.length}</p>
          </CardContent>
        </Card>
        <Card className="border-[#0b4f6c]/20 bg-[#0b4f6c]/5">
          <CardContent className="pt-6">
            <p className="text-sm text-[#0b4f6c] font-medium">Certificates issued</p>
            <p className="text-3xl font-bold text-[#0b4f6c]">{issued.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 font-medium">Course enrollments on file</p>
            <p className="text-3xl font-bold text-slate-900">{eligible.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-[#0b4f6c]" />
              Issue certificate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search student, course, or church…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <Label>Student & course</Label>
              <Select value={selectedKey} onValueChange={setSelectedKey}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoading ? "Loading…" : "Select enrollment"} />
                </SelectTrigger>
                <SelectContent>
                  {filtered.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      No pending certificates
                    </SelectItem>
                  ) : (
                    filtered.map((row) => (
                      <SelectItem
                        key={`${row.studentId}|${row.courseId}`}
                        value={`${row.studentId}|${row.courseId}`}
                      >
                        {row.studentName} — {row.courseName} ({row.enrollmentStatus})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Completion date</Label>
                <Input
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Final grade % (optional)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="e.g. 92"
                  value={finalGrade}
                  onChange={(e) => setFinalGrade(e.target.value)}
                />
              </div>
            </div>

            <Button
              className="w-full bg-[#0b4f6c] hover:bg-[#093d54]"
              disabled={!selected || issueMutation.isPending}
              onClick={() => issueMutation.mutate()}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Issue certificate of completion
            </Button>

            <p className="text-xs text-slate-500">
              The student receives a portal notification and can view the certificate under My
              Certificates.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live preview</CardTitle>
          </CardHeader>
          <CardContent>
            {selected ? (
              <div className="scale-[0.45] origin-top-left -mb-[280px]">
                <Certificate
                  studentName={selected.studentName}
                  courseName={selected.courseName}
                  completionDate={previewDate}
                  instructorName={instructorName}
                />
              </div>
            ) : (
              <p className="text-sm text-slate-600 py-12 text-center">
                Select a student and course to preview the certificate before issuing.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {issued.length > 0 ? (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recently issued</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {issued.slice(0, 8).map((cert) => (
              <div
                key={cert.id}
                className="flex flex-wrap items-center justify-between gap-2 border rounded-lg p-3"
              >
                <div>
                  <p className="font-medium">{cert.studentName}</p>
                  <p className="text-sm text-slate-600">{cert.courseTitle}</p>
                  <p className="text-xs text-slate-500">#{cert.certificateNumber}</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                  Issued {new Date(cert.issueDate).toLocaleDateString()}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </InstructorPortalShell>
  );
}
