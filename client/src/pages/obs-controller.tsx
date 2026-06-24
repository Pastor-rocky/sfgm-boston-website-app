import { useMutation, useQuery } from "@tanstack/react-query";
import InstructorPortalShell from "@/components/instructor-portal/portal-shell";
import { useInstructorAccess } from "@/hooks/useInstructorAccess";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Camera, Radio, Wifi, WifiOff } from "lucide-react";

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
      description="Control church camera scenes from your iPad on the same Wi‑Fi."
    >
      <div className="space-y-6 max-w-3xl mx-auto">
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
