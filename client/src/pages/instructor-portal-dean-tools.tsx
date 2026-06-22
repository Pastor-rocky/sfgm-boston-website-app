import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import InstructorPortalShell from "@/components/instructor-portal/portal-shell";
import { useInstructorAccess } from "@/hooks/useInstructorAccess";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

export default function InstructorPortalDeanTools() {
  useInstructorAccess();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const role = ((user as { role?: string } | null)?.role ?? "").toLowerCase();
  const email = ((user as { email?: string } | null)?.email ?? "").toLowerCase();
  const isDean = role === "dean" || role === "admin" || email === "pastor_rocky@sfgmboston.com";

  const [zoomTitle, setZoomTitle] = useState("");
  const [zoomDescription, setZoomDescription] = useState("");
  const [zoomScheduledAt, setZoomScheduledAt] = useState("");

  const { data: integrations } = useQuery({
    queryKey: ["/api/instructor/integrations/status"],
    queryFn: async () => {
      const r = await fetch("/api/instructor/integrations/status", { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load integration status");
      return r.json();
    },
    enabled: isDean,
  });

  const { data: calendar } = useQuery({
    queryKey: ["/api/instructor/calendar"],
    queryFn: async () => {
      const r = await fetch("/api/instructor/calendar", { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load calendar");
      return r.json();
    },
    enabled: isDean,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["/api/instructor/sessions"],
    queryFn: async () => {
      const r = await fetch("/api/instructor/sessions", { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load sessions");
      return r.json();
    },
    enabled: isDean,
  });

  const zoomMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/instructor/sessions/zoom", {
        title: zoomTitle,
        description: zoomDescription,
        scheduledAt: zoomScheduledAt || undefined,
        durationMinutes: 60,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instructor/sessions"] });
      setZoomTitle("");
      setZoomDescription("");
      setZoomScheduledAt("");
      toast({ title: "Zoom meeting created" });
    },
    onError: (err: Error) => {
      toast({ title: "Zoom failed", description: err.message, variant: "destructive" });
    },
  });

  if (!isDean) {
    return (
      <InstructorPortalShell title="Dean tools" subtitle="Restricted">
        <p className="text-slate-600">Dean or admin access is required for this page.</p>
        <Link href="/instructor-portal">
          <Button variant="outline" className="mt-4">
            Back to dashboard
          </Button>
        </Link>
      </InstructorPortalShell>
    );
  }

  return (
    <InstructorPortalShell
      title="Dean Tools"
      subtitle="Integrations, calendar, Zoom sessions, and school-wide exports"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Integration status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              SMS (Twilio):{" "}
              <Badge variant={integrations?.sms?.configured ? "default" : "secondary"}>
                {integrations?.sms?.configured ? "Configured" : "Not configured"}
              </Badge>
            </p>
            <p>
              Zoom:{" "}
              <Badge variant={integrations?.zoom?.configured ? "default" : "secondary"}>
                {integrations?.zoom?.configured ? "Configured" : "Not configured"}
              </Badge>
            </p>
            <p>
              Google Calendar:{" "}
              <Badge variant={integrations?.googleCalendar?.configured ? "default" : "secondary"}>
                {integrations?.googleCalendar?.configured ? "Configured" : "Not configured"}
              </Badge>
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <a href="/api/instructor/dean/export/students" download>
                Export all students (CSV)
              </a>
            </Button>
            <Link href="/instructor-portal/applications">
              <Button className="mt-2 w-full bg-[#0b4f6c] hover:bg-[#093d54]">
                Review instructor applications
              </Button>
            </Link>
            <Link href="/admin-panel">
              <Button variant="outline" className="mt-2 w-full">
                Open Admin Panel
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Zoom session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={zoomTitle} onChange={(e) => setZoomTitle(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={zoomDescription}
                onChange={(e) => setZoomDescription(e.target.value)}
              />
            </div>
            <div>
              <Label>Scheduled time (optional)</Label>
              <Input
                type="datetime-local"
                value={zoomScheduledAt}
                onChange={(e) => setZoomScheduledAt(e.target.value)}
              />
            </div>
            <Button
              className="w-full bg-[#0b4f6c] hover:bg-[#093d54]"
              disabled={!zoomTitle.trim() || zoomMutation.isPending}
              onClick={() => zoomMutation.mutate()}
            >
              Create Zoom meeting
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Zoom sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.length === 0 ? (
              <p className="text-sm text-slate-600">No sessions created yet.</p>
            ) : (
              sessions.map((session: any) => (
                <div key={session.id} className="border rounded-lg p-3 text-sm">
                  <p className="font-medium">{session.title}</p>
                  {session.scheduledAt ? (
                    <p className="text-slate-500">
                      {new Date(session.scheduledAt).toLocaleString()}
                    </p>
                  ) : null}
                  {session.joinUrl ? (
                    <a
                      href={session.joinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0b4f6c] underline mt-1 inline-block"
                    >
                      Join link
                    </a>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {calendar?.embedUrl ? (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Google Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <iframe
                title="SFGM Calendar"
                src={calendar.embedUrl}
                className="w-full h-[420px] border rounded-lg"
              />
            </CardContent>
          </Card>
        ) : calendar?.events?.length ? (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Upcoming events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {calendar.events.map((event: any) => (
                <div key={event.id} className="border rounded p-3 text-sm">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-slate-500">{new Date(event.start).toLocaleString()}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </InstructorPortalShell>
  );
}
