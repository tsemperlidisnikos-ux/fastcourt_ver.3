"use client";

import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useClientMounted } from "@/shared/hooks/useClientMounted";
import { CourtFrameThumbnail } from "@/features/designer/ui/CourtFrameThumbnail";
import { PresentationOverlay } from "@/features/library/ui/PresentationOverlay";
import { VideoEmbed } from "@/features/library/ui/VideoEmbed";
import { VideoWatchButton } from "@/features/library/ui/VideoWatchButton";
import { canInlineEmbedVideo } from "@/features/library/lib/video-url";
import { subscribePracticeLiveState } from "@/features/practice/lib/live-broadcast";
import { subscribePracticeLivePoll } from "@/features/practice/lib/practice-live-cloud";
import { subscribePracticeLiveWs } from "@/features/practice/lib/practice-live-ws";
import { shareMinifiedToStoredPlay } from "@/features/share/lib/share-link";
import { useShareStore } from "@/features/share/model/share-store";
import type { StoredPlay } from "@/features/library/model/library";
import "@/features/share/styles/player-share.css";

function formatPracticeDate(date: string) {
  if (!date) return "";
  const parsed = new Date(date);
  if (!Number.isFinite(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function PracticeShareOverlay() {
  const session = useShareStore((s) => s.practiceShareSession);
  const clearPracticeShareSession = useShareStore(
    (s) => s.clearPracticeShareSession,
  );
  const [presentPlay, setPresentPlay] = useState<StoredPlay | null>(null);
  const [liveIndex, setLiveIndex] = useState<number | null>(null);
  const [liveCompleted, setLiveCompleted] = useState<Set<number>>(new Set());
  const [liveCall, setLiveCall] = useState<string | null>(null);
  const mounted = useClientMounted();

  useEffect(() => {
    if (!session?.sessionId) return;
    const apply = (payload: {
      sessionId: string;
      currentIndex: number;
      completed: number[];
      liveCall?: string;
    }) => {
      if (payload.sessionId !== session.sessionId) return;
      setLiveIndex(payload.currentIndex);
      setLiveCompleted(new Set(payload.completed));
      setLiveCall(payload.liveCall?.trim() || null);
    };
    const stopLocal = subscribePracticeLiveState(apply);
    const stopCloud =
      session.syncToken
        ? subscribePracticeLivePoll(session.sessionId, session.syncToken, apply)
        : () => {};
    const stopWs =
      session.syncToken
        ? subscribePracticeLiveWs(session.sessionId, session.syncToken, apply)
        : () => {};
    return () => {
      stopLocal();
      stopCloud();
      stopWs();
    };
  }, [session?.sessionId, session?.syncToken]);

  const totalMin = useMemo(
    () =>
      session?.items.reduce((sum, item) => sum + (Number(item.durationMin) || 0), 0) ??
      0,
    [session],
  );

  if (!session || !mounted) return null;

  const metaParts = [
    formatPracticeDate(session.session.date),
    session.session.team,
    `${session.items.length} blocks`,
    `${totalMin} min`,
  ].filter(Boolean);

  return createPortal(
    <>
      <div className="practice-share-overlay" id="practice-share-overlay">
        <header className="practice-share-header">
          <div className="practice-share-badge">Practice plan</div>
          <h1 className="practice-share-title" id="practice-share-title">
            {session.session.title || "Practice"}
          </h1>
          <p className="practice-share-meta" id="practice-share-meta">
            {metaParts.join(" · ")}
          </p>
          {session.syncToken ? (
            <p className="practice-share-notes" id="practice-share-live-hint">
              Live follow is on — this screen tracks the coach&apos;s Start live
              session.
            </p>
          ) : null}
          {liveCall && liveIndex != null ? (
            <p className="practice-share-live-call" id="practice-share-live-call">
              Live call: <strong>{liveCall}</strong>
            </p>
          ) : null}
          {session.session.notes?.trim() ? (
            <p className="practice-share-notes" id="practice-share-notes">
              {session.session.notes}
            </p>
          ) : null}
          <button
            type="button"
            className="practice-close-btn"
            id="practice-share-close"
            style={{ marginTop: 16 }}
            onClick={clearPracticeShareSession}
          >
            ✕ Close
          </button>
        </header>
        <div className="practice-share-body" id="practice-share-list">
          {session.items.map((entry, index) => {
            const play = entry.play
              ? shareMinifiedToStoredPlay(entry.play, index)
              : null;
            const name = play?.title || entry.cueLabel || `Block ${index + 1}`;
            const kind = play?.type === "drill" ? "Drill" : play ? "Play" : "Block";
            const liveCurrent = liveIndex === index;
            const liveDone = liveCompleted.has(index);
            return (
              <article
                key={index}
                className={`practice-share-card${liveCurrent ? " is-live-current" : ""}${liveDone ? " is-live-done" : ""}`}
              >
                <div className="practice-share-card-num">{index + 1}</div>
                <div className="practice-share-card-thumb">
                  {play?.frames?.[0] ? (
                    <CourtFrameThumbnail
                      frame={play.frames[0]}
                      courtType={play.courtType}
                      size="sm"
                    />
                  ) : (
                    <span>{play ? "🏀" : "📋"}</span>
                  )}
                </div>
                <div className="practice-share-card-main">
                  <div className="practice-share-card-name">{name}</div>
                  <div className="practice-share-card-meta">
                    {kind} · {Number(entry.durationMin) || 0} min
                  </div>
                  {entry.notes ? (
                    <div className="practice-share-card-cue">{entry.notes}</div>
                  ) : null}
                  <div className="practice-share-card-actions">
                    {play?.frames?.length ? (
                      <button
                        type="button"
                        className="practice-share-action-btn"
                        onClick={() => setPresentPlay(play)}
                      >
                        View diagram
                      </button>
                    ) : null}
                    {entry.videoUrl ? (
                      <VideoWatchButton
                        videoUrl={entry.videoUrl}
                        title={play?.title || entry.cueLabel}
                        className="practice-share-action-btn practice-share-action-link"
                        variant="link"
                      />
                    ) : null}
                  </div>
                  {entry.videoUrl && canInlineEmbedVideo(entry.videoUrl) ? (
                    <VideoEmbed
                      videoUrl={entry.videoUrl}
                      title={play?.title || entry.cueLabel}
                      compact
                      className="practice-share-card-video"
                    />
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
      {presentPlay ? (
        <PresentationOverlay
          play={presentPlay}
          onClose={() => setPresentPlay(null)}
        />
      ) : null}
    </>,
    document.body,
  );
}
