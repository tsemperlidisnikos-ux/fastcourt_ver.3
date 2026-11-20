import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createPracticeLiveSyncToken,
  ensurePracticeLiveSyncToken,
} from "../../src/features/practice/lib/practice-live-cloud.ts";
import { encodePracticePayload } from "../../src/features/share/lib/share-link.ts";
import type { PracticeSession } from "../../src/features/library/model/library-meta.ts";

const session: PracticeSession = {
  id: "prac_live_1",
  date: "2026-09-12",
  title: "Friday practice",
  team: "U18",
  notes: "",
  items: [{ id: "i1", playId: "p1", durationMin: 10 }],
  createdAt: "2026-09-12T00:00:00.000Z",
  updatedAt: "2026-09-12T00:00:00.000Z",
};

describe("practice live sync token", () => {
  it("creates a token and keeps an existing one", () => {
    const token = createPracticeLiveSyncToken();
    assert.ok(token.length >= 8);
    assert.equal(
      ensurePracticeLiveSyncToken({ ...session, liveSyncToken: "keep-me" }),
      "keep-me",
    );
    assert.notEqual(ensurePracticeLiveSyncToken(session), "keep-me");
  });

  it("embeds sync token in practice share payload", () => {
    const token = "pl-share-token-1";
    const payload = encodePracticePayload(
      { ...session, liveSyncToken: token },
      [{ durationMin: 10, cueLabel: "Shell" }],
    );
    assert.equal(payload.type, "practice");
    if (payload.type === "practice") {
      assert.equal(payload.sessionId, session.id);
      assert.equal(payload.syncToken, token);
    }
  });
});
