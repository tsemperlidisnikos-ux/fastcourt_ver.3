import { createClient } from "@/lib/supabase/client";
import type { PracticeLiveBroadcast } from "@/lib/practice/live-broadcast";
import type { PracticeSession } from "@/types/library-meta";

export const PRACTICE_LIVE_POLL_MS = 2000;

export interface PracticeLiveCloudState extends PracticeLiveBroadcast {
  updatedAt: string;
}

export function createPracticeLiveSyncToken() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `pl_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function ensurePracticeLiveSyncToken(session: PracticeSession): string {
  return session.liveSyncToken?.trim() || createPracticeLiveSyncToken();
}

function parseCompleted(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((value): value is number => Number.isInteger(value) && value >= 0);
}

function parseLiveRpc(data: unknown): PracticeLiveCloudState | null {
  if (!data || typeof data !== "object") return null;
  const row = data as {
    ok?: boolean;
    currentIndex?: number;
    completed?: unknown;
    liveCall?: string | null;
    updatedAt?: string;
  };
  if (!row.ok || typeof row.currentIndex !== "number" || !row.updatedAt) return null;
  return {
    sessionId: "",
    currentIndex: Math.max(0, row.currentIndex),
    completed: parseCompleted(row.completed),
    liveCall: row.liveCall?.trim() || undefined,
    updatedAt: row.updatedAt,
  };
}

export async function publishPracticeLiveCloud(
  sessionId: string,
  syncToken: string,
  state: Omit<PracticeLiveBroadcast, "sessionId">,
): Promise<PracticeLiveCloudState | null> {
  const supabase = createClient();
  if (!supabase || !sessionId || !syncToken) return null;

  const { data, error } = await supabase.rpc("set_practice_live", {
    p_session_id: sessionId,
    p_sync_token: syncToken,
    p_current_index: state.currentIndex,
    p_completed: state.completed,
    p_live_call: state.liveCall ?? "",
  });

  if (error) {
    console.warn("FastCourt: set_practice_live failed", error.message);
    return null;
  }

  const parsed = parseLiveRpc(data);
  if (!parsed) return null;
  return { ...parsed, sessionId };
}

export async function fetchPracticeLiveCloud(
  sessionId: string,
  syncToken: string,
): Promise<PracticeLiveCloudState | null> {
  const supabase = createClient();
  if (!supabase || !sessionId || !syncToken) return null;

  const { data, error } = await supabase.rpc("get_practice_live", {
    p_session_id: sessionId,
    p_sync_token: syncToken,
  });

  if (error) {
    console.warn("FastCourt: get_practice_live failed", error.message);
    return null;
  }

  const parsed = parseLiveRpc(data);
  if (!parsed) return null;
  return { ...parsed, sessionId };
}

export function subscribePracticeLivePoll(
  sessionId: string,
  syncToken: string,
  onChange: (state: PracticeLiveCloudState) => void,
  intervalMs = PRACTICE_LIVE_POLL_MS,
) {
  if (!sessionId || !syncToken) return () => {};

  let active = true;
  let lastUpdatedAt = "";

  const tick = async () => {
    if (!active) return;
    const state = await fetchPracticeLiveCloud(sessionId, syncToken);
    if (!active || !state) return;
    if (state.updatedAt === lastUpdatedAt) return;
    lastUpdatedAt = state.updatedAt;
    onChange(state);
  };

  void tick();
  const timer = window.setInterval(() => {
    void tick();
  }, intervalMs);

  return () => {
    active = false;
    window.clearInterval(timer);
  };
}
