import {
  COUNTER_COVERAGE_LABELS,
  suggestDefensePlaysForCounter,
} from "@/features/film-room/lib/film-counter-playbook";
import type { FilmClipCounterSuggestion } from "@/features/film-room/lib/film-clip-analyze-types";
import type { DesignerCoachLinkedPlay } from "@/features/designer/lib/analyze-play-locally";
import type { StoredPlay } from "@/features/library/model/library";

export type CounterLoadMode = "replace" | "read";

export function counterReadFrameLabel(counter: FilmClipCounterSuggestion) {
  const coverageLabel = COUNTER_COVERAGE_LABELS[counter.coverage];
  return counter.title.trim() || `If ${coverageLabel}`;
}

export function resolveCounterDefensePlay(
  counter: FilmClipCounterSuggestion,
  libraryPlays: StoredPlay[],
  matchedPlays: DesignerCoachLinkedPlay[],
  excludePlayId: string,
): { playId: string; title: string; reason: string } | null {
  const fromMatched = matchedPlays[0];
  if (fromMatched) {
    return {
      playId: fromMatched.playId,
      title: fromMatched.title,
      reason: fromMatched.reason,
    };
  }

  const match = suggestDefensePlaysForCounter(
    libraryPlays,
    counter,
    new Set([excludePlayId]),
    1,
  )[0];
  if (!match) return null;

  return {
    playId: match.play.id,
    title: match.play.title,
    reason: match.reasons[0] ?? COUNTER_COVERAGE_LABELS[counter.coverage],
  };
}
