import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPracticeLiveWsUrl } from "../../src/features/practice/lib/practice-live-ws.ts";

describe("practice live websocket url", () => {
  it("uses NEXT_PUBLIC_LIVE_WS_URL when set", () => {
    const prev = process.env.NEXT_PUBLIC_LIVE_WS_URL;
    process.env.NEXT_PUBLIC_LIVE_WS_URL = "ws://192.168.1.63:3001";
    try {
      assert.equal(getPracticeLiveWsUrl(), "ws://192.168.1.63:3001");
    } finally {
      if (prev === undefined) delete process.env.NEXT_PUBLIC_LIVE_WS_URL;
      else process.env.NEXT_PUBLIC_LIVE_WS_URL = prev;
    }
  });

  it("returns null on server without override (no window)", () => {
    const prevUrl = process.env.NEXT_PUBLIC_LIVE_WS_URL;
    const prevMode = process.env.NEXT_PUBLIC_LIVE_WS_MODE;
    delete process.env.NEXT_PUBLIC_LIVE_WS_URL;
    delete process.env.NEXT_PUBLIC_LIVE_WS_MODE;
    try {
      assert.equal(getPracticeLiveWsUrl(), null);
    } finally {
      if (prevUrl !== undefined) process.env.NEXT_PUBLIC_LIVE_WS_URL = prevUrl;
      if (prevMode !== undefined) process.env.NEXT_PUBLIC_LIVE_WS_MODE = prevMode;
    }
  });
});

