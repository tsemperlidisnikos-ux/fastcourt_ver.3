export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number };

const buckets = new Map<string, number[]>();

export const AI_ANALYZE_RATE_LIMIT = { limit: 8, windowMs: 10 * 60 * 1000 };
export const AI_COACH_RATE_LIMIT = { limit: 20, windowMs: 10 * 60 * 1000 };

export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult {
  const cutoff = now - windowMs;
  const prev = (buckets.get(key) ?? []).filter((stamp) => stamp > cutoff);
  if (prev.length >= limit) {
    const oldest = prev[0] ?? now;
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }
  prev.push(now);
  buckets.set(key, prev);
  return { ok: true };
}

export function resetRateLimitBucketsForTests() {
  buckets.clear();
}
