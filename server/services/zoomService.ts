export interface ZoomMeeting {
  id: string;
  joinUrl: string;
  startUrl: string;
  password?: string;
}

function zoomEnabled(): boolean {
  return (process.env.ZOOM_ENABLED || "").toLowerCase() === "true";
}

function getZoomConfig() {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    return null;
  }

  return { accountId, clientId, clientSecret };
}

async function getZoomAccessToken(): Promise<string> {
  const config = getZoomConfig();
  if (!config) {
    throw new Error("Missing Zoom configuration");
  }

  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  const response = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(config.accountId)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Zoom auth failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("Zoom auth response missing access_token");
  }

  return data.access_token;
}

export async function createZoomMeeting(args: {
  topic: string;
  startTime?: Date;
  durationMinutes?: number;
  agenda?: string;
}): Promise<ZoomMeeting> {
  if (!zoomEnabled()) {
    throw new Error("Zoom is disabled (set ZOOM_ENABLED=true)");
  }

  const token = await getZoomAccessToken();
  const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic: args.topic,
      type: args.startTime ? 2 : 1,
      start_time: args.startTime?.toISOString(),
      duration: args.durationMinutes ?? 60,
      agenda: args.agenda,
      settings: {
        join_before_host: true,
        waiting_room: false,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Zoom meeting create failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as {
    id?: number | string;
    join_url?: string;
    start_url?: string;
    password?: string;
  };

  return {
    id: String(data.id ?? ""),
    joinUrl: data.join_url || "",
    startUrl: data.start_url || data.join_url || "",
    password: data.password,
  };
}

export function getZoomConfigStatus() {
  return {
    enabled: zoomEnabled(),
    configured: Boolean(getZoomConfig()),
  };
}
