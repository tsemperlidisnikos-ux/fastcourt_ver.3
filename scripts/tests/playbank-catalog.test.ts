import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PLAYBANK_CATALOG,
  isPlaybankLibraryId,
  playbankEntryToStoredPlay,
  playbankLibraryId,
} from "../../src/features/playbank/lib/catalog.ts";

describe("PlayBank catalog", () => {
  it("ships named starter sets", () => {
    assert.ok(PLAYBANK_CATALOG.length >= 6);
    const ids = PLAYBANK_CATALOG.map((entry) => entry.catalogId);
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(ids.includes("horns_flare"));
    assert.ok(ids.includes("spain_pnr"));
  });

  it("clones into a library play with a stable id", () => {
    const entry = PLAYBANK_CATALOG[0]!;
    const play = playbankEntryToStoredPlay(entry);
    assert.equal(play.id, playbankLibraryId(entry.catalogId));
    assert.equal(isPlaybankLibraryId(play.id), true);
    assert.equal(play.title, entry.title);
    assert.ok(play.frames[0]!.objects.length >= 5);
    assert.match(play.tags.join(","), /playbank/);
  });
});
