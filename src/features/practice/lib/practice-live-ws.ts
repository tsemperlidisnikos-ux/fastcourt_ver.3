import type { PracticeLiveBroadcast } from "@/features/practice/lib/live-broadcast";

export interface PracticeLiveWsState extends PracticeLiveBroadcast {
  updatedAt: string;
}

function liveWsPort() {
  return (
    process.env.NEXT_PUBLIC_LIVE_WS_PORT?.trim() ||
    process.env.LIVE_WS_PORT?.trim() ||
    "3001"
  );
}

/**
 * Resolve WS URL.
 * - Railway / production custom server: same host path `/practice-live`
 * - Local `npm run dev:live`: set NEXT_PUBLIC_LIVE_WS_MODE=port (+ PORT)
 * - Or set NEXT_PUBLIC_LIVE_WS_URL explicitly
 */
export function getPracticeLiveWsUrl(): string | null {
  const configured = process.env.NEXT_PUBLIC_LIVE_WS_URL?.trim();
  if (configured) return configured;
  if (typeof window === "undefined") return null;

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const mode = process.env.NEXT_PUBLIC_LIVE_WS_MODE?.trim().toLowerCase();

  if (mode === "port") {
    const host = window.location.hostname || "localhost";
    return `${protocol}//${host}:${liveWsPort()}/practice-live`;
  }

  // Same-origin (Railway / node server.js)
  return `${protocol}//${window.location.host}/practice-live`;
}

export function isPracticeLiveWsConfigured() {
  return Boolean(getPracticeLiveWsUrl());
}

type Publisher = {
  ws: WebSocket | null;
  url: string;
  sessionId: string;
  syncToken: string;
  queue: PracticeLiveBroadcast | null;
  opening: boolean;
};

let publisher: Publisher | null = null;

function ensurePublisher(sessionId: string, syncToken: string, url: string) {
  if (
    publisher &&
    publisher.url === url &&
    publisher.sessionId === sessionId &&
    publisher.syncToken === syncToken
  ) {
    return publisher;
  }
  try {
    publisher?.ws?.close();
  } catch {
    /* ignore */
  }
  publisher = {
    ws: null,
    url,
    sessionId,
    syncToken,
    queue: null,
    opening: false,
  };
  return publisher;
}

function flushPublisher(p: Publisher) {
  if (!p.ws || p.ws.readyState !== WebSocket.OPEN || !p.queue) return;
  p.ws.send(
    JSON.stringify({
      type: "state",
      sessionId: p.sessionId,
      syncToken: p.syncToken,
      payload: p.queue,
    }),
  );
}

function openPublisher(p: Publisher) {
  if (p.opening || (p.ws && p.ws.readyState <= WebSocket.OPEN)) return;
  p.opening = true;
  try {
    const ws = new WebSocket(p.url);
    p.ws = ws;
    ws.addEventListener("open", () => {
      p.opening = false;
      flushPublisher(p);
    });
    ws.addEventListener("close", () => {
      p.opening = false;
      if (publisher === p) p.ws = null;
    });
    ws.addEventListener("error", () => {
      p.opening = false;
      try {
        ws.close();
      } catch {
        /* ignore */
      }
    });
  } catch {
    p.opening = false;
    p.ws = null;
  }
}

export async function publishPracticeLiveWs(
  sessionId: string,
  syncToken: string,
  state: Omit<PracticeLiveBroadcast, "sessionId">,
): Promise<PracticeLiveWsState | null> {
  const url = getPracticeLiveWsUrl();
  if (!url || !sessionId || !syncToken) return null;

  const payload: PracticeLiveBroadcast = { sessionId, ...state };
  const p = ensurePublisher(sessionId, syncToken, url);
  p.queue = payload;
  if (p.ws && p.ws.readyState === WebSocket.OPEN) {
    flushPublisher(p);
  } else {
    openPublisher(p);
  }
  return {
    ...payload,
    updatedAt: new Date().toISOString(),
  };
}

export function subscribePracticeLiveWs(
  sessionId: string,
  syncToken: string,
  onChange: (state: PracticeLiveWsState) => void,
) {
  if (!sessionId || !syncToken) return () => {};
  const url = getPracticeLiveWsUrl();
  if (!url) return () => {};

  let active = true;
  let ws: WebSocket | null = null;
  let retryTimer = 0;
  let attempt = 0;

  const connect = () => {
    if (!active) return;
    try {
      ws = new WebSocket(url);
    } catch {
      scheduleRetry();
      return;
    }

    ws.addEventListener("open", () => {
      attempt = 0;
      ws?.send(
        JSON.stringify({
          type: "join",
          sessionId,
          syncToken,
        }),
      );
    });

    ws.addEventListener("message", (event) => {
      if (!active) return;
      let msg: {
        type?: string;
        state?: PracticeLiveWsState | null;
      };
      try {
        msg = JSON.parse(String(event.data));
      } catch {
        return;
      }
      if ((msg.type === "joined" || msg.type === "state") && msg.state) {
        if (msg.state.sessionId && msg.state.sessionId !== sessionId) return;
        onChange({
          sessionId,
          currentIndex: msg.state.currentIndex,
          completed: Array.isArray(msg.state.completed) ? msg.state.completed : [],
          liveCall: msg.state.liveCall,
          updatedAt: msg.state.updatedAt || new Date().toISOString(),
        });
      }
    });

    ws.addEventListener("close", () => {
      ws = null;
      scheduleRetry();
    });

    ws.addEventListener("error", () => {
      try {
        ws?.close();
      } catch {
        /* ignore */
      }
    });
  };

  const scheduleRetry = () => {
    if (!active) return;
    window.clearTimeout(retryTimer);
    const delay = Math.min(8000, 500 * 2 ** attempt);
    attempt += 1;
    retryTimer = window.setTimeout(connect, delay);
  };

  connect();

  return () => {
    active = false;
    window.clearTimeout(retryTimer);
    try {
      ws?.close();
    } catch {
      /* ignore */
    }
    ws = null;
  };
}
