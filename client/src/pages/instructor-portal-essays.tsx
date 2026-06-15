import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import InstructorPortalShell from "@/components/instructor-portal/portal-shell";
import { useInstructorAccess } from "@/hooks/useInstructorAccess";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Essay = {
  id: number;
  studentName: string;
  studentEmail: string | null;
  courseName: string;
  essayText: string;
  wordCount: number;
  submittedAt: string;
  status: string;
  feedback?: string | null;
};

export default function InstructorPortalEssays() {
  useInstructorAccess();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reviewId, setReviewId] = useState<number | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"approved" | "rejected">("approved");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: essays = [], isLoading } = useQuery<Essay[]>({
    queryKey: ["/api/instructor/essay-submissions"],
    queryFn: async () => {
      const r = await fetch("/api/instructor/essay-submissions", { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load essays");
      return r.json();
    },
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
        feedback,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instructor/essay-submissions"] });
      setReviewId(null);
      setReviewFeedback("");
      toast({ title: "Essay reviewed", description: "The student record has been updated." });
    },
    onError: () => {
      toast({ title: "Review failed", variant: "destructive" });
    },
  });

  const pending = essays.filter((e) => e.status === "submitted");
  const reviewed = essays.filter((e) => e.status !== "submitted");

  return (
    <InstructorPortalShell
      title="Essay Inbox"
      subtitle="Final exam essays are delivered here. Review, approve, or request changes without checking email."
    >
      <div className="mb-6 rounded-lg border border-[#0b4f6c]/20 bg-[#0b4f6c]/5 p-4 text-sm text-slate-700">
        When a student submits a final exam essay, it appears in this inbox immediately. Email is
        only used as an optional alert — the full essay lives here.
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Pending Review ({pending.length})
          </h2>
          {isLoading ? (
            <p className="text-slate-600">Loading essays…</p>
          ) : pending.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-slate-600">
                No essays waiting for review.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pending.map((essay) => (
                <Card key={essay.id} className="border-amber-200">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg">{essay.studentName}</CardTitle>
                        <p className="text-sm text-slate-600">{essay.courseName}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {essay.wordCount} words ·{" "}
                          {new Date(essay.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedId(expandedId === essay.id ? null : essay.id)}
                    >
                      {expandedId === essay.id ? "Hide essay" : "Read essay"}
                    </Button>
                    {expandedId === essay.id ? (
                      <div className="rounded-lg bg-slate-50 border p-4 text-sm whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                        {essay.essayText}
                      </div>
                    ) : null}
                    <div className="flex gap-2">
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => {
                          setReviewId(essay.id);
                          setReviewStatus("approved");
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setReviewId(essay.id);
                          setReviewStatus("rejected");
                        }}
                      >
                        Needs revision
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {reviewed.length > 0 ? (
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Reviewed ({reviewed.length})</h2>
            <div className="space-y-3">
              {reviewed.slice(0, 10).map((essay) => (
                <Card key={essay.id}>
                  <CardContent className="py-4 flex flex-wrap justify-between gap-2">
                    <div>
                      <p className="font-medium">{essay.studentName}</p>
                      <p className="text-sm text-slate-600">{essay.courseName}</p>
                    </div>
                    <Badge
                      className={
                        essay.status === "approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }
                    >
                      {essay.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <Dialog open={reviewId !== null} onOpenChange={() => setReviewId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {reviewStatus === "approved" ? "Approve essay" : "Request revision"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="feedback">Feedback for student (optional)</Label>
            <Textarea
              id="feedback"
              value={reviewFeedback}
              onChange={(e) => setReviewFeedback(e.target.value)}
              rows={4}
              placeholder="Share encouragement or what needs to be corrected…"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                reviewId &&
                reviewMutation.mutate({
                  id: reviewId,
                  status: reviewStatus,
                  feedback: reviewFeedback || undefined,
                })
              }
              disabled={reviewMutation.isPending}
            >
              Submit review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </InstructorPortalShell>
  );
}
