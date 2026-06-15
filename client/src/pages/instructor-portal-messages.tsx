import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import InstructorPortalShell from "@/components/instructor-portal/portal-shell";
import { useInstructorAccess } from "@/hooks/useInstructorAccess";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function InstructorPortalMessages() {
  useInstructorAccess();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const [studentId, setStudentId] = useState("");
  const [channel, setChannel] = useState<"portal" | "email">("portal");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("studentId");
    if (id) setStudentId(id);
  }, [location]);

  const { data: students = [] } = useQuery({
    queryKey: ["/api/instructor/students"],
    queryFn: async () => {
      const r = await fetch("/api/instructor/students", { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load students");
      return r.json();
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/instructor/messages"],
    queryFn: async () => {
      const r = await fetch("/api/instructor/messages", { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load messages");
      return r.json();
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/instructor/messages/send", {
        studentId,
        channel,
        subject,
        body,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instructor/messages"] });
      setSubject("");
      setBody("");
      toast({
        title: channel === "email" ? "Email sent" : "Message saved",
        description: "Your message has been recorded in the portal.",
      });
    },
    onError: (err: Error) => {
      toast({ title: "Could not send message", description: err.message, variant: "destructive" });
    },
  });

  return (
    <InstructorPortalShell
      title="Messages"
      subtitle="Contact students from the portal. Email sends through SFGM; SMS coming soon."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Send a message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Student</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {[s.firstName, s.lastName].filter(Boolean).join(" ") || s.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Channel</Label>
              <Select value={channel} onValueChange={(v) => setChannel(v as "portal" | "email")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portal">Portal message (saved in chart)</SelectItem>
                  <SelectItem value="email">Email to student</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
            </div>
            <Button
              className="w-full bg-[#0b4f6c] hover:bg-[#093d54]"
              disabled={!studentId || !body.trim() || sendMutation.isPending}
              onClick={() => sendMutation.mutate()}
            >
              Send message
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Message history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[32rem] overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-sm text-slate-600">No messages yet.</p>
            ) : (
              messages.map((m: any) => (
                <div key={m.id} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">{m.studentName}</p>
                  <p className="text-xs text-slate-500">
                    {m.channel} · {new Date(m.sentAt).toLocaleString()}
                  </p>
                  {m.subject ? <p className="mt-1 font-medium">{m.subject}</p> : null}
                  <p className="mt-1 text-slate-700 whitespace-pre-wrap">{m.body}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </InstructorPortalShell>
  );
}
