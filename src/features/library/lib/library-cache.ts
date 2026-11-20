import { EMPTY_ORGANIZER_META } from "@/shared/lib/cloud/library-meta-types";
import { applyLocalOrganizerMeta } from "@/shared/lib/cloud/library-meta-local";
import { getLibraryDb, replaceAllStoredPlays } from "@/features/library/lib/idb";
import {
  activateLibraryScope,
  getActiveLibraryOwnerUserId,
  getActiveSessionUserId,
} from "@/features/library/lib/library-scope";
import { setLibraryTombstones } from "@/features/library/lib/tombstones";
import type { SessionUser } from "@/features/auth/model/auth";

export { isCloudSessionUserId, shouldResetLibraryCache } from "@/features/library/lib/library-cache-policy";

const SEED_META_KEY = "seeded_mock_v1";

const ORGANIZER_META_KEYS = [
  "customSeasons_v6",
  "customTeams_v6",
  "customCategories_v6",
  "customFieldTags_v6",
  "customFieldTagColors_v1",
  "playData_sections_v1",
  "practicePlannerData_v1",
  "library_tombstones_v1",
  SEED_META_KEY,
] as const;

let cloudLibrarySession = false;

export function setCloudLibrarySession(active: boolean) {
  cloudLibrarySession = active;
}

export function shouldSkipMockLibrarySeed() {
  return cloudLibrarySession;
}

export function getLibraryCacheSessionUserId(): string | null {
  return getActiveSessionUserId();
}

export function getLibraryCacheOwnerUserId(): string | null {
  return getActiveLibraryOwnerUserId();
}

export async function setLibraryCacheIds(
  sessionUser: SessionUser,
  libraryOwnerUserId: string,
): Promise<void> {
  activateLibraryScope(sessionUser.id, libraryOwnerUserId, sessionUser);
}

export async function clearLocalLibraryCache(): Promise<void> {
  if (!getActiveLibraryOwnerUserId()) return;

  await replaceAllStoredPlays([]);
  await applyLocalOrganizerMeta({ ...EMPTY_ORGANIZER_META });
  await setLibraryTombstones([]);

  const db = await getLibraryDb();
  const tx = db.transaction("meta", "readwrite");
  for (const key of ORGANIZER_META_KEYS) {
    await tx.store.delete(key);
  }
  await tx.done;
}

export function prepareLibraryCacheForUser(
  sessionUser: SessionUser,
  libraryOwnerUserId: string,
): boolean {
  return activateLibraryScope(sessionUser.id, libraryOwnerUserId, sessionUser);
}
