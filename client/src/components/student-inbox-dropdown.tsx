import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

type StudentMessage = {
  id: number;
  instructorName: string;
  subject: string | null;
  body: string;
  sentAt: string;
  readAt: string | null;
  isUnread: boolean;
  channel: string;
};

function formatWhen(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function StudentInboxDropdown() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: messages = [], isLoading } = useQuery<StudentMessage[]>({
    queryKey: ["/api/student/messages"],
    queryFn: async () => {
      const r = await fetch("/api/student/messages", { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load messages");
      return r.json();
    },
    refetchInterval: open ? 30_000 : 60_000,
  });

  const unreadCount = messages.filter((m) => m.isUnread).length;

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PATCH", `/api/student/messages/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/student/messages"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", "/api/student/messages/read-all", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/student/messages"] });
    },
  });

  const openMessage = (message: StudentMessage) => {
    setExpandedId((prev) => (prev === message.id ? null : message.id));
    if (message.isUnread) {
      markReadMutation.mutate(message.id);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="relative border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm h-12 px-4"
          aria-label="Messages from your instructor"
        >
          <Mail className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">Instructor Messages</span>
          {unreadCount > 0 ? (
            <Badge className="ml-2 bg-amber-500 hover:bg-amber-500 text-white text-xs min-w-[1.25rem] h-5 px-1.5">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[min(24rem,calc(100vw-2rem))] p-0 overflow-hidden"
        sideOffset={8}
      >
        <div className="flex items-center justify-between border-b px-4 py-3 bg-slate-50">
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4 text-[#0b4f6c]" />
            <p className="font-semibold text-slate-900 text-sm">From your instructor</p>
          </div>
          {unreadCount > 0 ? (
            <button
              type="button"
              className="text-xs text-[#0b4f6c] hover:underline font-medium"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              Mark all read
            </button>
          ) : null}
        </div>

        <div className="max-h-[22rem] overflow-y-auto">
          {isLoading ? (
            <p className="px-4 py-8 text-sm text-slate-500 text-center">Loading messages…</p>
          ) : messages.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Mail className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No messages yet</p>
              <p className="text-xs text-slate-500 mt-1">
                When your instructor contacts you, it will appear here.
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const expanded = expandedId === message.id;
              return (
                <button
                  key={message.id}
                  type="button"
                  onClick={() => openMessage(message)}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b last:border-b-0 transition-colors hover:bg-slate-50",
                    message.isUnread && "bg-blue-50/60",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-[#0b4f6c] truncate">
                        {message.instructorName}
                      </p>
                      <p
                        className={cn(
                          "text-sm truncate mt-0.5",
                          message.isUnread ? "font-semibold text-slate-900" : "text-slate-800",
                        )}
                      >
                        {message.subject || "Message from your instructor"}
                      </p>
                      {!expanded ? (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 whitespace-pre-wrap">
                          {message.body}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap leading-relaxed">
                          {message.body}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[10px] text-slate-400">{formatWhen(message.sentAt)}</span>
                      {message.isUnread ? (
                        <span className="h-2 w-2 rounded-full bg-blue-500" aria-hidden />
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
