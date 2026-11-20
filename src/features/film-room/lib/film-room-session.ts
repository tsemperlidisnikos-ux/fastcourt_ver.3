import type { FilmRoomSession } from "@/features/film-room/model/film-room";
import { normalizeFilmBookmarks } from "@/features/film-room/lib/film-room-bookmarks";

/** Ensure optional fields exist for sessions saved before Level A. */
export function normalizeFilmRoomSession(session: FilmRoomSession): FilmRoomSession {
  return {
    ...session,
    events: Array.isArray(session.events) ? session.events : [],
    disruptions: Array.isArray(session.disruptions) ? session.disruptions : [],
    bookmarks: normalizeFilmBookmarks(session.bookmarks),
    analyses: Array.isArray(session.analyses) ? session.analyses : [],
  };
}
