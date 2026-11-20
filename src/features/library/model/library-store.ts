"use client";

import { create } from "zustand";
import { createRandomId } from "@/shared/lib/random-id";
import {
  blankStoredPlay,
  storedPlayToLibraryItem,
} from "@/features/library/lib/convert";
import { mergeCourtViewSettings } from "@/features/designer/lib/court-view-settings";
import {
  deleteStoredPlay,
  getMetaFlag,
  getStoredPlay,
  listStoredPlays,
  putStoredPlay,
  setMetaFlag,
} from "@/features/library/lib/idb";
import {
  getLibraryCacheOwnerUserId,
  shouldSkipMockLibrarySeed,
} from "@/features/library/lib/library-cache";
import { getActiveSessionUser } from "@/features/library/lib/library-scope";
import { scheduleCloudLibrarySync } from "@/shared/lib/cloud/library-sync";
import {
  filterPlaysForLibraryScope,
  stampPlayOwner,
} from "@/features/library/lib/play-ownership";
import { recordLibraryDeletion } from "@/features/library/lib/tombstones";
import { MOCK_LIBRARY } from "@/features/library/lib/mock-data";
import { removeStarterDemoPlays } from "@/features/library/lib/starter-plays/remove-starter-demo-plays";
import { ensureCounterLibrarySeedPlays } from "@/features/library/lib/starter-plays/seed-counter-library";
import { useAuthStore } from "@/features/auth/model/auth-store";
import type { LibraryItem, PlayDetailsValues, StoredPlay } from "@/features/library/model/library";

const SEED_META_KEY = "seeded_mock_v1";

interface LibraryState {
  items: LibraryItem[];
  loading: boolean;
  error: string | null;
  hydrated: boolean;
  refresh: () => Promise<void>;
  createPlay: (title?: string) => Promise<StoredPlay>;
  createPlayFromDetails: (details: PlayDetailsValues) => Promise<StoredPlay>;
  toggleFavorite: (id: string) => Promise<void>;
  duplicatePlay: (id: string) => Promise<StoredPlay | undefined>;
  removePlay: (id: string) => Promise<void>;
  getPlayDocument: (id: string) => Promise<StoredPlay | undefined>;
  savePlayDocument: (play: StoredPlay) => Promise<void>;
}

async function seedMockIfEmpty() {
  const session = useAuthStore.getState().session;
  if (shouldSkipMockLibrarySeed() || session?.cloud) return;

  const seeded = await getMetaFlag(SEED_META_KEY);
  if (seeded) return;

  const existing = await listStoredPlays();
  if (existing.length > 0) {
    await setMetaFlag(SEED_META_KEY, true);
    return;
  }

  const now = new Date().toISOString();
  const seeds: StoredPlay[] = MOCK_LIBRARY.map((item) => ({
    id: item.id,
    title: item.title,
    courtType: "half",
    frames: [
      {
        id: `frame-${item.id}`,
        name: "Frame 1",
        objects: [],
        actions: [],
        actionSequence: [],
      },
    ],
    type: item.type,
    season: "2025-26",
    team: item.tags[0] ?? "No Team",
    series: item.tags[1] ?? "",
    tags: item.tags,
    favorite: item.favorite,
    createdAt: now,
    updatedAt: item.updatedAt,
    source: "manual",
  }));

  for (const play of seeds) {
    await putStoredPlay(play);
  }
  await setMetaFlag(SEED_META_KEY, true);
}

async function visiblePlays(): Promise<StoredPlay[]> {
  const sessionUser =
    getActiveSessionUser() ?? useAuthStore.getState().session?.user ?? null;
  const plays = await listStoredPlays();
  if (!sessionUser) return plays;

  const libraryOwnerUserId =
    getLibraryCacheOwnerUserId() ?? sessionUser.id;
  return filterPlaysForLibraryScope(plays, sessionUser, libraryOwnerUserId);
}

function withPlayOwner(play: StoredPlay): StoredPlay {
  const sessionUser = useAuthStore.getState().session?.user;
  if (!sessionUser) return play;
  return stampPlayOwner(play, sessionUser);
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  items: [],
  loading: true,
  error: null,
  hydrated: false,

  refresh: async () => {
    set({ loading: true, error: null });
    try {
      const { ensureLibraryScopeReady } = await import("@/features/library/lib/library-scope");
      const ready = await ensureLibraryScopeReady();
      if (!ready) {
        set({ loading: true });
        return;
      }

      await seedMockIfEmpty();
      await removeStarterDemoPlays();
      await ensureCounterLibrarySeedPlays();
      const plays = await visiblePlays();
      set({
        items: plays.map(storedPlayToLibraryItem),
        loading: false,
        hydrated: true,
      });
      const { useOrganizerStore } = await import("@/features/library/model/organizer-store");
      useOrganizerStore.setState({ plays });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : "Library load failed.",
        hydrated: true,
      });
    }
  },

  createPlay: async (title = "New play") => {
    const play = withPlayOwner(blankStoredPlay(title));
    await putStoredPlay(play);
    await get().refresh();
    void scheduleCloudLibrarySync();
    return play;
  },

  createPlayFromDetails: async (details) => {
    const now = new Date().toISOString();
    const base = blankStoredPlay(details.title);
    const play: StoredPlay = withPlayOwner({
      ...base,
      title: details.title,
      courtType: details.courtType,
      courtView: mergeCourtViewSettings(details.courtView ?? base.courtView),
      type: details.type,
      season: details.season,
      team: details.team,
      series: details.series,
      tags: details.tags,
      playNotes: details.playNotes || undefined,
      videoUrl: details.videoUrl || undefined,
      defenseCounter: details.defenseCounter?.enabled
        ? {
            enabled: true,
            coverages: details.defenseCounter.coverages ?? [],
            vsPatterns: details.defenseCounter.vsPatterns ?? [],
            notes: details.defenseCounter.notes?.trim() || undefined,
          }
        : undefined,
      createdAt: now,
      updatedAt: now,
    });
    await putStoredPlay(play);
    await get().refresh();
    void scheduleCloudLibrarySync();
    return play;
  },

  toggleFavorite: async (id) => {
    const play = await getStoredPlay(id);
    if (!play) return;
    const updated = {
      ...play,
      favorite: !play.favorite,
      updatedAt: new Date().toISOString(),
    };
    await putStoredPlay(updated);
    await get().refresh();
    void scheduleCloudLibrarySync();
  },

  duplicatePlay: async (id) => {
    const play = await getStoredPlay(id);
    if (!play) return undefined;
    const now = new Date().toISOString();
    const copy: StoredPlay = withPlayOwner({
      ...(JSON.parse(JSON.stringify(play)) as StoredPlay),
      id: `play_${createRandomId()}`,
      title: play.title.trim() ? `${play.title} copy` : "Copy",
      favorite: false,
      createdAt: now,
      updatedAt: now,
      ownerUserId: undefined,
      ownerEmail: undefined,
    });
    await putStoredPlay(copy);
    await get().refresh();
    void scheduleCloudLibrarySync();
    return copy;
  },

  removePlay: async (id) => {
    await deleteStoredPlay(id);
    await recordLibraryDeletion(id, "play");
    await get().refresh();
    void scheduleCloudLibrarySync();
  },

  getPlayDocument: async (id) => {
    const play = await getStoredPlay(id);
    if (!play) return undefined;

    const sessionUser = useAuthStore.getState().session?.user;
    if (sessionUser) {
      const libraryOwnerUserId =
        getLibraryCacheOwnerUserId() ?? sessionUser.id;
      const visible = filterPlaysForLibraryScope(
        [play],
        sessionUser,
        libraryOwnerUserId,
      );
      if (!visible.length) return undefined;
    }

    if (play.lazyPending && play.fastDrawLazy) {
      const { decodeLazyPlay } = await import("@/features/library/lib/fdb-lazy");
      const decoded = await decodeLazyPlay(play);
      if (decoded) {
        await putStoredPlay(decoded);
        await get().refresh();
        return decoded;
      }
      return undefined;
    }
    return play;
  },

  savePlayDocument: async (play) => {
    const existing = await getStoredPlay(play.id);
    const updated = withPlayOwner({
      ...(existing ?? play),
      ...play,
      frames:
        Array.isArray(play.frames) && play.frames.length > 0
          ? play.frames
          : (existing?.frames ?? play.frames ?? []),
      updatedAt: new Date().toISOString(),
    });
    await putStoredPlay(updated);
    await get().refresh();
    void scheduleCloudLibrarySync();
  },
}));
