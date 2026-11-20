"use client";

import { AnimationPlaybackControls } from "@/features/designer/ui/AnimationPlaybackControls";
import type { useFrameAnimationPlayback } from "@/features/designer/hooks/useFrameAnimationPlayback";

interface Props {
  playback: ReturnType<typeof useFrameAnimationPlayback>;
  disabled?: boolean;
}

/** Legacy court-bar wrapper — playback UI now lives on Action Timeline dock. */
export function CourtAnimationPlaybackBar({ playback, disabled = false }: Props) {
  return (
    <div className="ds-court-playback-bar" aria-hidden="true">
      <AnimationPlaybackControls playback={playback} disabled={disabled} />
    </div>
  );
}
