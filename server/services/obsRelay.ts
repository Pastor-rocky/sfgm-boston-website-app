/**
 * In-memory relay between the church OBS PC agent and instructor iPad controller.
 */

export type ObsScene = {
  name: string;
};

export type ObsAgentCommand =
  | { id: string; action: "setScene"; sceneName: string }
  | { id: string; action: "toggleStream" };

export type ObsRelayStatus = {
  connected: boolean;
  lastSeenMs: number | null;
  scenes: ObsScene[];
  currentScene: string | null;
  streaming: boolean | null;
  agentLabel: string | null;
};

const AGENT_STALE_MS = 12_000;

let agentTokenValid = false;
let lastSeen = 0;
let scenes: ObsScene[] = [];
let currentScene: string | null = null;
let streaming: boolean | null = null;
let agentLabel: string | null = null;
let pendingCommand: ObsAgentCommand | null = null;

function expectedToken(): string | null {
  return process.env.OBS_AGENT_TOKEN?.trim() || null;
}

export function isObsRelayConfigured(): boolean {
  return Boolean(expectedToken());
}

export function verifyObsAgentToken(token: string | undefined): boolean {
  const expected = expectedToken();
  if (!expected || !token) return false;
  return token === expected;
}

export function recordObsAgentHeartbeat(payload: {
  scenes: ObsScene[];
  currentScene: string | null;
  streaming?: boolean | null;
  label?: string | null;
}): ObsAgentCommand | null {
  agentTokenValid = true;
  lastSeen = Date.now();
  scenes = payload.scenes;
  currentScene = payload.currentScene;
  streaming = payload.streaming ?? streaming;
  agentLabel = payload.label?.trim() || agentLabel;

  const cmd = pendingCommand;
  pendingCommand = null;
  return cmd;
}

export function getObsRelayStatus(): ObsRelayStatus {
  const connected = agentTokenValid && Date.now() - lastSeen < AGENT_STALE_MS;
  return {
    connected,
    lastSeenMs: lastSeen || null,
    scenes: connected ? scenes : [],
    currentScene: connected ? currentScene : null,
    streaming: connected ? streaming : null,
    agentLabel: connected ? agentLabel : null,
  };
}

export function queueObsSceneChange(sceneName: string): boolean {
  const status = getObsRelayStatus();
  if (!status.connected) return false;
  if (!status.scenes.some((s) => s.name === sceneName)) return false;

  pendingCommand = {
    id: `scene-${Date.now()}`,
    action: "setScene",
    sceneName,
  };
  return true;
}

export function queueObsStreamToggle(): boolean {
  if (!getObsRelayStatus().connected) return false;
  pendingCommand = {
    id: `stream-${Date.now()}`,
    action: "toggleStream",
  };
  return true;
}
