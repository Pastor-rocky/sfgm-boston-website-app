/**
 * Run on the church OBS PC (same machine as OBS):
 *   npm run obs:agent
 *
 * Requires OBS → Tools → WebSocket Server Settings → Enable.
 */
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", ".env") });

type ObsScene = { name: string };

type ObsCommand =
  | { id: string; action: "setScene"; sceneName: string }
  | { id: string; action: "toggleStream" };

const OBS_HOST = process.env.OBS_WS_HOST?.trim() || "127.0.0.1";
const OBS_PORT = process.env.OBS_WS_PORT?.trim() || "4455";
const OBS_PASSWORD = process.env.OBS_WS_PASSWORD?.trim() || "";
const AGENT_TOKEN = process.env.OBS_AGENT_TOKEN?.trim() || "";
const RELAY_URL = (process.env.OBS_RELAY_URL || process.env.APP_URL || "http://localhost:56000").replace(
  /\/$/,
  "",
);
const HEARTBEAT_MS = Number(process.env.OBS_AGENT_HEARTBEAT_MS || "800");
const AGENT_LABEL = process.env.OBS_AGENT_LABEL?.trim() || "Church OBS PC";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildObsAuth(password: string, salt: string, challenge: string): string {
  const secret = crypto.createHash("sha256").update(password + salt).digest();
  const auth = crypto.createHash("sha256").update(Buffer.concat([secret, Buffer.from(challenge)])).digest();
  return auth.toString("base64");
}

class ObsClient {
  private ws: WebSocket | null = null;
  private identified = false;
  private pending = new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();

  async connect(): Promise<void> {
    const url = `ws://${OBS_HOST}:${OBS_PORT}`;
    this.ws = new WebSocket(url);

    await new Promise<void>((resolve, reject) => {
      if (!this.ws) return reject(new Error("WebSocket missing"));
      this.ws.onopen = () => resolve();
      this.ws.onerror = () => reject(new Error(`Cannot connect to OBS at ${url}`));
    });

    this.ws.onmessage = (event) => this.handleMessage(String(event.data));
    this.ws.onclose = () => {
      this.identified = false;
    };

    await this.waitForIdentify();
  }

  private handleMessage(raw: string) {
    const msg = JSON.parse(raw) as { op: number; d: Record<string, unknown> };
    if (msg.op === 0) {
      void this.sendIdentify(msg.d);
      return;
    }
    if (msg.op === 2) {
      this.identified = true;
      return;
    }
    if (msg.op === 7) {
      const requestId = String(msg.d.requestId || "");
      const status = msg.d.requestStatus as { result?: boolean; comment?: string } | undefined;
      const pending = this.pending.get(requestId);
      if (!pending) return;
      this.pending.delete(requestId);
      if (status?.result) {
        pending.resolve(msg.d.responseData);
      } else {
        pending.reject(new Error(status?.comment || "OBS request failed"));
      }
    }
  }

  private async sendIdentify(hello: Record<string, unknown>) {
    if (!this.ws) return;
    const authInfo = hello.authentication as { challenge?: string; salt?: string } | undefined;
    const payload: Record<string, unknown> = {
      rpcVersion: 1,
      eventSubscriptions: 33,
    };
    if (authInfo?.challenge && authInfo?.salt && OBS_PASSWORD) {
      payload.authentication = buildObsAuth(OBS_PASSWORD, authInfo.salt, authInfo.challenge);
    }
    this.ws.send(JSON.stringify({ op: 1, d: payload }));
  }

  private async waitForIdentify(timeoutMs = 8000) {
    const start = Date.now();
    while (!this.identified) {
      if (Date.now() - start > timeoutMs) {
        throw new Error("OBS WebSocket identify timed out — check password in .env");
      }
      await sleep(100);
    }
  }

  private request<T>(requestType: string, requestData: Record<string, unknown> = {}): Promise<T> {
    if (!this.ws || !this.identified) {
      return Promise.reject(new Error("OBS not connected"));
    }
    const requestId = crypto.randomUUID();
    return new Promise<T>((resolve, reject) => {
      this.pending.set(requestId, {
        resolve: (v) => resolve(v as T),
        reject,
      });
      this.ws?.send(
        JSON.stringify({
          op: 6,
          d: { requestType, requestId, requestData },
        }),
      );
      setTimeout(() => {
        if (this.pending.has(requestId)) {
          this.pending.delete(requestId);
          reject(new Error(`OBS request timed out: ${requestType}`));
        }
      }, 5000);
    });
  }

  async getScenes(): Promise<ObsScene[]> {
    const data = await this.request<{ scenes?: Array<{ sceneName?: string }> }>("GetSceneList");
    return (data.scenes || [])
      .map((s) => s.sceneName)
      .filter((name): name is string => Boolean(name))
      .map((name) => ({ name }));
  }

  async getCurrentScene(): Promise<string | null> {
    const data = await this.request<{ currentProgramSceneName?: string }>("GetCurrentProgramScene");
    return data.currentProgramSceneName || null;
  }

  async getStreaming(): Promise<boolean | null> {
    try {
      const data = await this.request<{ outputActive?: boolean }>("GetStreamStatus");
      return Boolean(data.outputActive);
    } catch {
      return null;
    }
  }

  async setScene(sceneName: string) {
    await this.request("SetCurrentProgramScene", { sceneName });
  }

  async toggleStream() {
    const streaming = await this.getStreaming();
    if (streaming) {
      await this.request("StopStream");
    } else {
      await this.request("StartStream");
    }
  }

  isOpen() {
    return this.ws?.readyState === WebSocket.OPEN && this.identified;
  }
}

async function sendHeartbeat(payload: {
  scenes: ObsScene[];
  currentScene: string | null;
  streaming: boolean | null;
}): Promise<ObsCommand | null> {
  const res = await fetch(`${RELAY_URL}/api/obs/agent/heartbeat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: AGENT_TOKEN,
      scenes: payload.scenes,
      currentScene: payload.currentScene,
      streaming: payload.streaming,
      label: AGENT_LABEL,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Relay heartbeat failed (${res.status}): ${text}`);
  }
  const data = (await res.json()) as { command?: ObsCommand | null };
  return data.command ?? null;
}

async function main() {
  if (!AGENT_TOKEN) {
    throw new Error("OBS_AGENT_TOKEN is missing from .env");
  }

  console.log(`📡 SFGM OBS Church Agent`);
  console.log(`   Relay: ${RELAY_URL}`);
  console.log(`   OBS:   ws://${OBS_HOST}:${OBS_PORT}`);
  console.log(`   Label: ${AGENT_LABEL}`);

  const obs = new ObsClient();

  while (true) {
    try {
      if (!obs.isOpen()) {
        console.log("Connecting to OBS WebSocket…");
        await obs.connect();
        console.log("✅ Connected to OBS");
      }

      const scenes = await obs.getScenes();
      const currentScene = await obs.getCurrentScene();
      const streaming = await obs.getStreaming();
      const command = await sendHeartbeat({ scenes, currentScene, streaming });

      if (command?.action === "setScene") {
        console.log(`🎬 Switching scene → ${command.sceneName}`);
        await obs.setScene(command.sceneName);
      } else if (command?.action === "toggleStream") {
        console.log("📺 Toggling stream");
        await obs.toggleStream();
      }
    } catch (error) {
      console.error("Agent error:", error instanceof Error ? error.message : error);
      await sleep(3000);
    }

    await sleep(HEARTBEAT_MS);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
