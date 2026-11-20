"use client";

import "@/features/film-room/styles/fc-film-reel-share.css";
import { PwaBootstrap } from "@/shared/ui/pwa/PwaBootstrap";
import { AppLogoSync } from "@/features/settings/ui/AppLogoSync";
import { CourtWoodTextureBootstrap } from "@/features/designer/ui/CourtWoodTextureBootstrap";
import { TeamInviteBootstrap } from "@/features/auth/ui/TeamInviteBootstrap";
import { PlayerPortalOverlay } from "@/features/share/ui/PlayerPortalOverlay";
import { PlayerRosterModal } from "@/features/share/ui/PlayerRosterModal";
import { PlayerShareSendModal } from "@/features/share/ui/PlayerShareSendModal";
import { HomeworkShareOverlay } from "@/features/share/ui/HomeworkShareOverlay";
import { HomeworkAckBootstrap } from "@/features/share/ui/HomeworkAckBootstrap";
import { GamePlanShareOverlay } from "@/features/share/ui/GamePlanShareOverlay";
import { GameDayShareOverlay } from "@/features/share/ui/GameDayShareOverlay";
import { PracticeShareOverlay } from "@/features/share/ui/PracticeShareOverlay";
import { FilmReelShareOverlay } from "@/features/share/ui/FilmReelShareOverlay";
import { ShareBootstrap } from "@/features/share/ui/ShareBootstrap";
import { AppDialogHost } from "@/shared/ui/kit/AppDialogHost";
import { ContextMenuGuard } from "@/shared/ui/kit/ContextMenuGuard";
import { ViewportProfileProvider } from "@/shared/ui/shell/ViewportProfileProvider";

export function ShareProviders({ children }: { children: React.ReactNode }) {
  return (
    <ViewportProfileProvider>
      <AppLogoSync />
      <CourtWoodTextureBootstrap />
      <ContextMenuGuard />
      <AppDialogHost />
      <TeamInviteBootstrap />
      <ShareBootstrap />
      <HomeworkAckBootstrap />
      <PlayerPortalOverlay />
      <PlayerRosterModal />
      <PlayerShareSendModal />
      <PracticeShareOverlay />
      <GamePlanShareOverlay />
      <GameDayShareOverlay />
      <HomeworkShareOverlay />
      <FilmReelShareOverlay />
      <PwaBootstrap />
      {children}
    </ViewportProfileProvider>
  );
}
