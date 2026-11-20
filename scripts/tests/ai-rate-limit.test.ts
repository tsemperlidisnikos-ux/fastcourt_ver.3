import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  consumeRateLimit,
  resetRateLimitBucketsForTests,
} from "../../src/lib/ai/rate-limit.ts";

describe("AI rate limit", () => {
  it("allows requests under the limit then blocks", () => {
    resetRateLimitBucketsForTests();
    const key = "test:caller";
    const now = 1_000_000;
    assert.equal(consumeRateLimit(key, 2, 60_000, now).ok, true);
    assert.equal(consumeRateLimit(key, 2, 60_000, now + 10).ok, true);
    const blocked = consumeRateLimit(key, 2, 60_000, now + 20);
    assert.equal(blocked.ok, false);
    if (!blocked.ok) assert.ok(blocked.retryAfterSec >= 1);
  });

  it("resets after the window", () => {
    resetRateLimitBucketsForTests();
    const key = "test:window";
    const now = 5_000_000;
    consumeRateLimit(key, 1, 1_000, now);
    assert.equal(consumeRateLimit(key, 1, 1_000, now + 50).ok, false);
    assert.equal(consumeRateLimit(key, 1, 1_000, now + 1_001).ok, true);
  });
});
