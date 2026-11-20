"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PLAYBANK_CATALOG,
  playbankEntryToStoredPlay,
  playbankLibraryId,
  type PlayBankCategory,
  type PlayBankEntry,
} from "@/lib/playbank/catalog";
import { stampPlayOwner } from "@/lib/library/play-ownership";
import { appNotice } from "@/stores/dialog-store";
import { useAuthStore } from "@/stores/auth-store";
import { useLibraryStore } from "@/stores/library-store";
import "@/styles/playbank.css";

const CATEGORIES: Array<PlayBankCategory | "All"> = [
  "All",
  "Half-court",
  "ATO",
  "BLOB",
  "SLOB",
  "Press break",
];

export function PlayBankView() {
  const router = useRouter();
  const sessionUser = useAuthStore((s) => s.session?.user);
  const items = useLibraryStore((s) => s.items);
  const savePlayDocument = useLibraryStore((s) => s.savePlayDocument);
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("All");
  const [busyId, setBusyId] = useState<string | null>(null);

  const ownedIds = useMemo(
    () => new Set(items.map((item) => item.id)),
    [items],
  );

  const visible = useMemo(
    () =>
      PLAYBANK_CATALOG.filter(
        (entry) => filter === "All" || entry.category === filter,
      ),
    [filter],
  );

  async function addEntry(entry: PlayBankEntry) {
    const id = playbankLibraryId(entry.catalogId);
    if (ownedIds.has(id)) {
      router.push(`/designer?item=${encodeURIComponent(id)}`);
      return;
    }
    setBusyId(entry.catalogId);
    try {
      let play = playbankEntryToStoredPlay(entry);
      if (sessionUser) play = stampPlayOwner(play, sessionUser);
      await savePlayDocument(play);
      appNotice("Added to library", `${entry.title} is in your Draw library.`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="fc-playbank" id="fc-playbank">
      <header className="fc-playbank-head">
        <div>
          <h1 className="fc-playbank-title">PlayBank</h1>
          <p className="fc-playbank-sub">
            Starter catalog of common sets. Add a copy to your library, then edit
            it in the designer.
          </p>
        </div>
      </header>

      <div className="fc-playbank-filters" role="tablist" aria-label="PlayBank categories">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={filter === category}
            className={`fc-playbank-filter${filter === category ? " is-active" : ""}`}
            onClick={() => setFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <ul className="fc-playbank-grid">
        {visible.map((entry) => {
          const inLibrary = ownedIds.has(playbankLibraryId(entry.catalogId));
          return (
            <li key={entry.catalogId} className="fc-playbank-card">
              <p className="fc-playbank-cat">{entry.category}</p>
              <h2 className="fc-playbank-name">{entry.title}</h2>
              <p className="fc-playbank-summary">{entry.summary}</p>
              <p className="fc-playbank-tags">{entry.tags.join(" · ")}</p>
              <button
                type="button"
                className="fc-playbank-add"
                disabled={busyId === entry.catalogId}
                onClick={() => void addEntry(entry)}
              >
                {inLibrary
                  ? "Open in designer"
                  : busyId === entry.catalogId
                    ? "Adding…"
                    : "Add to library"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
