import { useMutation, useQuery } from "@tanstack/react-query";
import InstructorPortalShell from "@/components/instructor-portal/portal-shell";
import LiveYouTubeEmbed from "@/components/live-youtube-embed";
import { useInstructorAccess } from "@/hooks/useInstructorAccess";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Camera, ExternalLink, Radio, Wifi, WifiOff, Youtube } from "lucide-react";
import type { LiveBroadcastConfig } from "@shared/live-broadcast";

type ObsStatus = {
  configured: boolean;
  connected: boolean;
  lastSeenMs: number | null;
  scenes: { name: string }[];
  currentScene: string | null;
  streaming: boolean | null;
  agentLabel: string | null;
};

export default function ObsControllerPage() {
  useInstructorAccess();
  const { toast } = useToast();

  const { data: status } = useQuery<ObsStatus>({
    queryKey: ["/api/obs/status"],
    refetchInterval: 1500,
    refetchOnMount: "always",
  });

  const { data: broadcast } = useQuery<LiveBroadcastConfig>({
    queryKey: ["/api/live-broadcast"],
    staleTime: 5_000,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.isLive) return 30_000;
      return data?.autoDetectEnabled ? 10_000 : 30_000;
    },
    refetchOnMount: "always",
  });

  const watchUrl = broadcast?.watchUrl ?? broadcast?.channelUrl;

  const switchScene = useMutation({
    mutationFn: async (sceneName: string) => {
      const res = await apiRequest("POST", "/api/obs/scene", { sceneName });
      return res.json();
    },
    onSuccess: (_data, sceneName) => {
      toast({ title: `Switching to ${sceneName}` });
    },
    onError: () => {
      toast({
        title: "Could not switch scene",
        description: "Make sure the church OBS agent is running on the streaming PC.",
        variant: "destructive",
      });
    },
  });

  const toggleStream = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/obs/stream/toggle", {});
      return res.json();
    },
    onSuccess: () => toast({ title: "Stream toggle sent" }),
    onError: () =>
      toast({
        title: "Could not toggle stream",
        description: "Church OBS agent offline?",
        variant: "destructive",
      }),
  });

  const connected = status?.connected;
  const scenes = status?.scenes ?? [];

  return (
    <InstructorPortalShell
      title="OBS Controller"
      subtitle="Switch camera scenes while watching the YouTube feed (what the audience sees)."
    >
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="rounded-xl overflow-hidden border bg-black aspect-video shadow-lg">
          <LiveYouTubeEmbed
            videoId={broadcast?.videoId ?? null}
            channelId={broadcast?.channelId}
            className="w-full h-full min-h-[200px]"
            keepAtLiveEdge={Boolean(broadcast?.videoId)}
            placeholder={
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center px-4">
                <Youtube className="h-10 w-10 text-red-500 mb-2" />
                <p className="font-medium text-white">
                  {broadcast?.autoDetectEnabled ? "Waiting for YouTube to go live" : "No stream yet"}
                </p>
                <p className="text-xs text-slate-400 mt-1 text-center max-w-xs">
                  {broadcast?.statusMessage || "Start streaming on YouTube — this preview updates automatically."}
                </p>
              </div>
            }
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>
            YouTube preview is delayed vs. sanctuary (~10–30s). Enable Low latency in YouTube Studio for a
            shorter gap; tap Live on the player if you drift behind.
          </p>
          {watchUrl ? (
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-red-600 hover:underline shrink-0"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open YouTube
            </a>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {connected ? (
            <Badge className="bg-emerald-600 hover:bg-emerald-600">
              <Wifi className="h-3.5 w-3.5 mr-1" />
              Church PC connected
            </Badge>
          ) : (
            <Badge variant="destructive">
              <WifiOff className="h-3.5 w-3.5 mr-1" />
              Church PC offline
            </Badge>
          )}
          {status?.streaming ? (
            <Badge className="bg-red-600 hover:bg-red-600">
              <Radio className="h-3.5 w-3.5 mr-1 animate-pulse" />
              Live
            </Badge>
          ) : null}
          {status?.currentScene ? (
            <Badge variant="outline">Now: {status.currentScene}</Badge>
          ) : null}
        </div>

        {!status?.configured ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950 text-sm">
            Add <code>OBS_AGENT_TOKEN</code> on Render, then run <code>npm run obs:agent</code> on the
            church streaming PC.
          </div>
        ) : null}

        {!connected ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
            <Camera className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="font-medium text-foreground mb-1">Waiting for church OBS PC</p>
            <p className="text-sm">
              On the streaming computer, run: <code className="text-xs">npm run obs:agent</code>
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {scenes.map((scene) => {
                const active = scene.name === status?.currentScene;
                return (
                  <Button
                    key={scene.name}
                    size="lg"
                    disabled={switchScene.isPending}
                    className={`h-20 text-base font-bold ${
                      active
                        ? "bg-amber-600 hover:bg-amber-700 ring-2 ring-amber-300"
                        : "bg-slate-800 hover:bg-slate-700"
                    }`}
                    onClick={() => switchScene.mutate(scene.name)}
                  >
                    {scene.name}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              className="w-full"
              disabled={toggleStream.isPending}
              onClick={() => toggleStream.mutate()}
            >
              {status?.streaming ? "Stop stream" : "Start stream"}
            </Button>
          </>
        )}

        <p className="text-xs text-muted-foreground text-center">
          iPad + church PC on same Wi‑Fi · Agent talks to OBS locally · This page sends commands through
          sfgmboston.com
        </p>
      </div>
    </InstructorPortalShell>
  );
}
