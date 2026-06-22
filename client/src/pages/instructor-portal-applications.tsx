import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import InstructorPortalShell from "@/components/instructor-portal/portal-shell";
import { useInstructorAccess } from "@/hooks/useInstructorAccess";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function InstructorPortalApplications() {
  useInstructorAccess();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notesById, setNotesById] = useState<Record<number, string>>({});

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["/api/instructor/applications"],
    queryFn: async () => {
      const r = await fetch("/api/instructor/applications", { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load applications");
      return r.json();
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      adminNotes,
    }: {
      id: number;
      status: "approved" | "rejected";
      adminNotes?: string;
    }) => {
      return apiRequest("PATCH", `/api/instructor/applications/${id}/review`, {
        status,
        adminNotes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instructor/applications"] });
      toast({ title: "Application updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Review failed", description: err.message, variant: "destructive" });
    },
  });

  const pending = applications.filter((a: any) => a.status === "pending");
  const reviewed = applications.filter((a: any) => a.status !== "pending");

  return (
    <InstructorPortalShell
      title="Instructor Applications"
      subtitle="Dean review queue — approve applicants to grant instructor access"
    >
      {isLoading ? (
        <p className="text-slate-600">Loading applications…</p>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-4">
              Pending ({pending.length})
            </h2>
            {pending.length === 0 ? (
              <p className="text-sm text-slate-600">No pending applications.</p>
            ) : (
              <div className="space-y-4">
                {pending.map((app: any) => (
                  <Card key={app.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex justify-between gap-2">
                        <span>
                          {app.firstName} {app.lastName}
                        </span>
                        <Badge>{app.sfgmChurch || "Church N/A"}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <p>
                        <strong>Email:</strong> {app.email} · <strong>Phone:</strong> {app.phone}
                      </p>
                      <p>
                        <strong>Course interest:</strong> {app.courseOfInterest || "—"}
                      </p>
                      <p>
                        <strong>Position:</strong> {app.churchPosition || "—"}
                      </p>
                      <p className="whitespace-pre-wrap">
                        <strong>Experience:</strong> {app.experience}
                      </p>
                      <p className="whitespace-pre-wrap">
                        <strong>Motivation:</strong> {app.motivation}
                      </p>
                      <Textarea
                        placeholder="Dean notes (optional)"
                        value={notesById[app.id] || ""}
                        onChange={(e) =>
                          setNotesById((prev) => ({ ...prev, [app.id]: e.target.value }))
                        }
                      />
                      <div className="flex gap-2">
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700"
                          disabled={reviewMutation.isPending}
                          onClick={() =>
                            reviewMutation.mutate({
                              id: app.id,
                              status: "approved",
                              adminNotes: notesById[app.id],
                            })
                          }
                        >
                          Approve & promote
                        </Button>
                        <Button
                          variant="outline"
                          disabled={reviewMutation.isPending}
                          onClick={() =>
                            reviewMutation.mutate({
                              id: app.id,
                              status: "rejected",
                              adminNotes: notesById[app.id],
                            })
                          }
                        >
                          Reject
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
              <h2 className="text-lg font-semibold mb-4">Reviewed</h2>
              <div className="space-y-3">
                {reviewed.map((app: any) => (
                  <div key={app.id} className="border rounded-lg p-3 text-sm flex justify-between gap-4">
                    <div>
                      <p className="font-medium">
                        {app.firstName} {app.lastName}
                      </p>
                      <p className="text-slate-500">{app.email}</p>
                    </div>
                    <Badge variant={app.status === "approved" ? "default" : "secondary"}>
                      {app.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </InstructorPortalShell>
  );
}
