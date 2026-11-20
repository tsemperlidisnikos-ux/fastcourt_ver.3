/**
 * One-shot: move src into features/ + shared/ and rewrite imports.
 * Run from repo root: node scripts/migrate-feature-architecture.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function movePath(fromRel, toRel) {
  const from = path.join(SRC, fromRel);
  const to = path.join(SRC, toRel);
  if (!fs.existsSync(from)) {
    console.warn("SKIP missing:", fromRel);
    return;
  }
  ensureDir(path.dirname(to));
  if (fs.existsSync(to)) {
    // merge directory contents
    if (fs.statSync(from).isDirectory() && fs.statSync(to).isDirectory()) {
      for (const name of fs.readdirSync(from)) {
        movePath(path.join(fromRel, name), path.join(toRel, name));
      }
      try {
        fs.rmdirSync(from);
      } catch {
        /* not empty */
      }
      return;
    }
    console.warn("SKIP exists:", toRel);
    return;
  }
  fs.renameSync(from, to);
  console.log("MOVE", fromRel, "->", toRel);
}

function moveDirContents(fromRel, toRel, { only, exclude } = {}) {
  const from = path.join(SRC, fromRel);
  if (!fs.existsSync(from)) {
    console.warn("SKIP missing dir:", fromRel);
    return;
  }
  ensureDir(path.join(SRC, toRel));
  for (const name of fs.readdirSync(from)) {
    if (only && !only.some((p) => name === p || name.startsWith(p))) continue;
    if (exclude && exclude.some((p) => name === p || name.startsWith(p))) continue;
    movePath(path.join(fromRel, name), path.join(toRel, name));
  }
}

// --- Physical moves ---------------------------------------------------------

// Shared kernel
movePath("lib/config.ts", "shared/lib/config.ts");
movePath("lib/supabase", "shared/lib/supabase");
movePath("lib/cloud", "shared/lib/cloud");
movePath("lib/ai", "shared/lib/ai");
movePath("lib/print", "shared/lib/print");
movePath("lib/viewport", "shared/lib/viewport");
movePath("lib/ui", "shared/lib/ui");
movePath("lib/pwa", "shared/lib/pwa");
movePath("lib/landing", "shared/lib/landing");
movePath("lib/fastdraw", "shared/lib/fastdraw");
movePath("components/shell", "shared/ui/shell");
movePath("components/ui", "shared/ui/kit");
movePath("components/pwa", "shared/ui/pwa");
movePath("stores/dialog-store.ts", "shared/model/dialog-store.ts");

// Shared hooks
for (const h of [
  "useClientMounted.ts",
  "useCloudEnabled.ts",
  "useCoarsePointer.ts",
  "useDeviceClass.ts",
  "useDraggablePanel.ts",
  "useModalA11y.ts",
]) {
  movePath(`hooks/${h}`, `shared/hooks/${h}`);
}

// Shared styles (global / cross-cutting)
for (const s of [
  "app-error.css",
  "fc-laptop-lock.css",
  "fc-pwa.css",
  "fc-primary-actions.css",
  "overflow-menus.css",
  "welcome.css",
  "fd-ui.css",
]) {
  movePath(`styles/${s}`, `shared/styles/${s}`);
}

// Auth
movePath("components/auth", "features/auth/ui");
movePath("lib/auth", "features/auth/lib");
movePath("stores/auth-store.ts", "features/auth/model/auth-store.ts");
for (const t of ["auth.ts", "signup.ts", "admin-user.ts", "team-org.ts"]) {
  movePath(`types/${t}`, `features/auth/model/${t}`);
}

// Billing
movePath("components/billing", "features/billing/ui");
movePath("lib/billing", "features/billing/lib");
for (const t of ["billing-config.ts", "payment-methods.ts"]) {
  movePath(`types/${t}`, `features/billing/model/${t}`);
}
movePath("hooks/usePublicBillingConfig.ts", "features/billing/hooks/usePublicBillingConfig.ts");
movePath("styles/billing-ui.css", "features/billing/styles/billing-ui.css");

// Settings
movePath("components/settings", "features/settings/ui");
movePath("lib/settings", "features/settings/lib");
movePath("lib/admin", "features/settings/lib/admin");
movePath("stores/settings-store.ts", "features/settings/model/settings-store.ts");
for (const t of [
  "appearance-settings.ts",
  "default-fields.ts",
  "library-nav-modules.ts",
  "org-branding.ts",
  "pdf-branding.ts",
  "platform-features.ts",
  "platform-layout.ts",
  "user-settings.ts",
]) {
  movePath(`types/${t}`, `features/settings/model/${t}`);
}
movePath("hooks/useAppLogoSrc.ts", "features/settings/hooks/useAppLogoSrc.ts");
movePath("hooks/usePlatformFeatures.ts", "features/settings/hooks/usePlatformFeatures.ts");
movePath("styles/admin-settings.css", "features/settings/styles/admin-settings.css");
movePath("styles/fc-onboarding.css", "features/settings/styles/fc-onboarding.css");

// Designer
movePath("components/designer", "features/designer/ui");
movePath("lib/designer", "features/designer/lib");
movePath("stores/designer-store.ts", "features/designer/model/designer-store.ts");
movePath("stores/designer", "features/designer/model/designer");
movePath("types/designer.ts", "features/designer/model/designer.ts");
movePath("hooks/useFrameAnimationPlayback.ts", "features/designer/hooks/useFrameAnimationPlayback.ts");
movePath("hooks/usePlayAnimationDriver.ts", "features/designer/hooks/usePlayAnimationDriver.ts");
for (const s of [
  "designer-coach.css",
  "designer-ui-v240.css",
  "fastdraw-editor-ui.css",
  "fc-designer-base.css",
  "fc-modern-designer.css",
]) {
  movePath(`styles/${s}`, `features/designer/styles/${s}`);
}

// Film room
movePath("components/film-room", "features/film-room/ui");
movePath("lib/film-room", "features/film-room/lib");
movePath("stores/film-room-store.ts", "features/film-room/model/film-room-store.ts");
movePath("types/film-room.ts", "features/film-room/model/film-room.ts");
movePath("hooks/useAiAssistantStatus.ts", "features/film-room/hooks/useAiAssistantStatus.ts");
for (const s of [
  "fc-film-room.css",
  "fc-film-reel-share.css",
  "fc-film-scout-print.css",
  "fc-video-embed.css",
]) {
  movePath(`styles/${s}`, `features/film-room/styles/${s}`);
}

// Opponent scout
movePath("components/opponent-scout", "features/opponent-scout/ui");
movePath("lib/opponent-scout", "features/opponent-scout/lib");
movePath("types/opponent-scout.ts", "features/opponent-scout/model/opponent-scout.ts");
movePath("styles/fc-opponent-scout.css", "features/opponent-scout/styles/fc-opponent-scout.css");
movePath(
  "styles/fc-opponent-scout-print.css",
  "features/opponent-scout/styles/fc-opponent-scout-print.css",
);

// PlayBank
movePath("components/playbank", "features/playbank/ui");
movePath("lib/playbank", "features/playbank/lib");
movePath("styles/playbank.css", "features/playbank/styles/playbank.css");

// Share
movePath("components/share", "features/share/ui");
movePath("lib/share", "features/share/lib");
movePath("lib/players/share-to-players.ts", "features/share/lib/share-to-players.ts");
movePath("lib/players/player-share-messages.ts", "features/share/lib/player-share-messages.ts");
movePath("stores/share-store.ts", "features/share/model/share-store.ts");
for (const s of ["player-share.css", "player-portal.css"]) {
  movePath(`styles/${s}`, `features/share/styles/${s}`);
}

// Players
moveDirContents("components/library", "features/players/ui", {
  only: ["PlayersView.tsx", "PlayerContextMenu.tsx"],
});
movePath("lib/players/player-roster.ts", "features/players/lib/player-roster.ts");
movePath("lib/players/team-options.ts", "features/players/lib/team-options.ts");
movePath("types/player-roster.ts", "features/players/model/player-roster.ts");
movePath("styles/fc-players.css", "features/players/styles/fc-players.css");

// Practice (from library components + lib/practice)
moveDirContents("components/library", "features/practice/ui", {
  only: [
    "PracticeAddModal.tsx",
    "PracticeAddPlaybookModal.tsx",
    "PracticeDialogs.tsx",
    "PracticeItemRow.tsx",
    "PracticeLiveOverlay.tsx",
    "PracticePlannerView.tsx",
    "PracticePrintDocument.tsx",
    "PracticePrintOverlay.tsx",
    "PracticeReadScorecardPanel.tsx",
    "PracticeSheetDocument.tsx",
    "PracticeSheetInkLayer.tsx",
    "PracticeSheetOverlay.tsx",
    "PracticeTemplateModal.tsx",
  ],
});
movePath("lib/practice", "features/practice/lib");
for (const s of ["fc-practice.css", "fc-practice-live.css", "fc-practice-sheet.css"]) {
  movePath(`styles/${s}`, `features/practice/styles/${s}`);
}

// Game plan
moveDirContents("components/library", "features/game-plan/ui", {
  only: [
    "CoachDashboardView.tsx",
    "GameDayCounterStrip.tsx",
    "GameDayOffenseReadStrip.tsx",
    "GameDayOverlay.tsx",
    "GamePlanBenchPrintDocument.tsx",
    "GamePlanBenchPrintOverlay.tsx",
    "GamePlanCountersPanel.tsx",
    "GamePlanFilmEvidencePanel.tsx",
    "GamePlanHomeworkPanel.tsx",
    "GamePlanReadRecommendationsPanel.tsx",
    "GamePlanReadRollupPanel.tsx",
    "GamePlanSuggestModal.tsx",
    "GamePlanView.tsx",
    "OpponentBoardPanel.tsx",
    "TimeoutOverlay.tsx",
  ],
});
movePath("lib/game-plan", "features/game-plan/lib");
movePath("lib/coach", "features/game-plan/lib/coach");
for (const s of [
  "fc-game-plan.css",
  "fc-game-plan-share.css",
  "fc-game-day.css",
  "fc-coach-dashboard.css",
  "fc-timeout-mode.css",
  "fc-presentation.css",
]) {
  movePath(`styles/${s}`, `features/game-plan/styles/${s}`);
}

// Demo
movePath("components/demo", "features/demo/ui");
movePath("lib/demo", "features/demo/lib");
movePath("stores/counters-demo-store.ts", "features/demo/model/counters-demo-store.ts");
movePath("hooks/useCountersDemo.ts", "features/demo/hooks/useCountersDemo.ts");
movePath("styles/fc-counters-demo.css", "features/demo/styles/fc-counters-demo.css");

// Library (remaining library components + lib)
movePath("components/library", "features/library/ui");
movePath("lib/library", "features/library/lib");
movePath("stores/library-store.ts", "features/library/model/library-store.ts");
movePath("stores/organizer-store.ts", "features/library/model/organizer-store.ts");
movePath(
  "stores/playbook-print-config-store.ts",
  "features/library/model/playbook-print-config-store.ts",
);
for (const t of ["library.ts", "library-meta.ts", "playbook-print-config.ts"]) {
  movePath(`types/${t}`, `features/library/model/${t}`);
}
movePath("hooks/useLibraryNavModules.ts", "features/library/hooks/useLibraryNavModules.ts");
movePath("hooks/useLibrarySplitResizer.ts", "features/library/hooks/useLibrarySplitResizer.ts");
for (const s of [
  "fc-library.css",
  "fc-library-header.css",
  "fc-modern-library.css",
  "fc-fields.css",
  "fc-playbooks.css",
  "fc-playbook-print.css",
  "fc-playbook-print-settings.css",
  "fd-library-laptop.css",
  "fd-library-tablet.css",
]) {
  movePath(`styles/${s}`, `features/library/styles/${s}`);
}

// Landing components if any leftover
if (fs.existsSync(path.join(SRC, "components/landing"))) {
  movePath("components/landing", "features/landing/ui");
}
if (fs.existsSync(path.join(SRC, "components/admin"))) {
  movePath("components/admin", "features/settings/ui/admin");
}

// Cleanup empty dirs
for (const d of ["components", "lib", "stores", "hooks", "types", "styles"]) {
  const p = path.join(SRC, d);
  if (fs.existsSync(p)) {
    try {
      fs.rmSync(p, { recursive: true, force: true });
      console.log("RM leftover", d);
    } catch (e) {
      console.warn("Could not remove", d, e.message);
    }
  }
}

// --- Import rewrites --------------------------------------------------------

/** Longer prefixes first */
const IMPORT_REWRITES = [
  // stores / designer internals
  ["@/stores/designer/", "@/features/designer/model/designer/"],
  ["@/stores/designer-store", "@/features/designer/model/designer-store"],
  ["@/stores/library-store", "@/features/library/model/library-store"],
  ["@/stores/organizer-store", "@/features/library/model/organizer-store"],
  [
    "@/stores/playbook-print-config-store",
    "@/features/library/model/playbook-print-config-store",
  ],
  ["@/stores/film-room-store", "@/features/film-room/model/film-room-store"],
  ["@/stores/auth-store", "@/features/auth/model/auth-store"],
  ["@/stores/settings-store", "@/features/settings/model/settings-store"],
  ["@/stores/share-store", "@/features/share/model/share-store"],
  ["@/stores/counters-demo-store", "@/features/demo/model/counters-demo-store"],
  ["@/stores/dialog-store", "@/shared/model/dialog-store"],

  // types
  ["@/types/designer", "@/features/designer/model/designer"],
  ["@/types/film-room", "@/features/film-room/model/film-room"],
  ["@/types/opponent-scout", "@/features/opponent-scout/model/opponent-scout"],
  ["@/types/library-meta", "@/features/library/model/library-meta"],
  ["@/types/library-nav-modules", "@/features/settings/model/library-nav-modules"],
  ["@/types/library", "@/features/library/model/library"],
  ["@/types/playbook-print-config", "@/features/library/model/playbook-print-config"],
  ["@/types/player-roster", "@/features/players/model/player-roster"],
  ["@/types/auth", "@/features/auth/model/auth"],
  ["@/types/signup", "@/features/auth/model/signup"],
  ["@/types/admin-user", "@/features/auth/model/admin-user"],
  ["@/types/team-org", "@/features/auth/model/team-org"],
  ["@/types/billing-config", "@/features/billing/model/billing-config"],
  ["@/types/payment-methods", "@/features/billing/model/payment-methods"],
  ["@/types/appearance-settings", "@/features/settings/model/appearance-settings"],
  ["@/types/default-fields", "@/features/settings/model/default-fields"],
  ["@/types/org-branding", "@/features/settings/model/org-branding"],
  ["@/types/pdf-branding", "@/features/settings/model/pdf-branding"],
  ["@/types/platform-features", "@/features/settings/model/platform-features"],
  ["@/types/platform-layout", "@/features/settings/model/platform-layout"],
  ["@/types/user-settings", "@/features/settings/model/user-settings"],

  // hooks
  ["@/hooks/useFrameAnimationPlayback", "@/features/designer/hooks/useFrameAnimationPlayback"],
  ["@/hooks/usePlayAnimationDriver", "@/features/designer/hooks/usePlayAnimationDriver"],
  ["@/hooks/useLibraryNavModules", "@/features/library/hooks/useLibraryNavModules"],
  ["@/hooks/useLibrarySplitResizer", "@/features/library/hooks/useLibrarySplitResizer"],
  ["@/hooks/useAiAssistantStatus", "@/features/film-room/hooks/useAiAssistantStatus"],
  ["@/hooks/useAppLogoSrc", "@/features/settings/hooks/useAppLogoSrc"],
  ["@/hooks/usePlatformFeatures", "@/features/settings/hooks/usePlatformFeatures"],
  ["@/hooks/usePublicBillingConfig", "@/features/billing/hooks/usePublicBillingConfig"],
  ["@/hooks/useCountersDemo", "@/features/demo/hooks/useCountersDemo"],
  ["@/hooks/useClientMounted", "@/shared/hooks/useClientMounted"],
  ["@/hooks/useCloudEnabled", "@/shared/hooks/useCloudEnabled"],
  ["@/hooks/useCoarsePointer", "@/shared/hooks/useCoarsePointer"],
  ["@/hooks/useDeviceClass", "@/shared/hooks/useDeviceClass"],
  ["@/hooks/useDraggablePanel", "@/shared/hooks/useDraggablePanel"],
  ["@/hooks/useModalA11y", "@/shared/hooks/useModalA11y"],

  // practice / game-plan components that lived under library
  ...[
    "PracticeAddModal",
    "PracticeAddPlaybookModal",
    "PracticeDialogs",
    "PracticeItemRow",
    "PracticeLiveOverlay",
    "PracticePlannerView",
    "PracticePrintDocument",
    "PracticePrintOverlay",
    "PracticeReadScorecardPanel",
    "PracticeSheetDocument",
    "PracticeSheetInkLayer",
    "PracticeSheetOverlay",
    "PracticeTemplateModal",
  ].map((n) => [`@/components/library/${n}`, `@/features/practice/ui/${n}`]),
  ...[
    "CoachDashboardView",
    "GameDayCounterStrip",
    "GameDayOffenseReadStrip",
    "GameDayOverlay",
    "GamePlanBenchPrintDocument",
    "GamePlanBenchPrintOverlay",
    "GamePlanCountersPanel",
    "GamePlanFilmEvidencePanel",
    "GamePlanHomeworkPanel",
    "GamePlanReadRecommendationsPanel",
    "GamePlanReadRollupPanel",
    "GamePlanSuggestModal",
    "GamePlanView",
    "OpponentBoardPanel",
    "TimeoutOverlay",
  ].map((n) => [`@/components/library/${n}`, `@/features/game-plan/ui/${n}`]),
  ["@/components/library/PlayersView", "@/features/players/ui/PlayersView"],
  ["@/components/library/PlayerContextMenu", "@/features/players/ui/PlayerContextMenu"],

  // components
  ["@/components/designer/", "@/features/designer/ui/"],
  ["@/components/film-room/", "@/features/film-room/ui/"],
  ["@/components/opponent-scout/", "@/features/opponent-scout/ui/"],
  ["@/components/playbank/", "@/features/playbank/ui/"],
  ["@/components/share/", "@/features/share/ui/"],
  ["@/components/auth/", "@/features/auth/ui/"],
  ["@/components/billing/", "@/features/billing/ui/"],
  ["@/components/settings/", "@/features/settings/ui/"],
  ["@/components/demo/", "@/features/demo/ui/"],
  ["@/components/library/", "@/features/library/ui/"],
  ["@/components/shell/", "@/shared/ui/shell/"],
  ["@/components/ui/", "@/shared/ui/kit/"],
  ["@/components/pwa/", "@/shared/ui/pwa/"],

  // lib
  ["@/lib/designer/", "@/features/designer/lib/"],
  ["@/lib/film-room/", "@/features/film-room/lib/"],
  ["@/lib/opponent-scout/", "@/features/opponent-scout/lib/"],
  ["@/lib/playbank/", "@/features/playbank/lib/"],
  ["@/lib/practice/", "@/features/practice/lib/"],
  ["@/lib/game-plan/", "@/features/game-plan/lib/"],
  ["@/lib/coach/", "@/features/game-plan/lib/coach/"],
  ["@/lib/library/", "@/features/library/lib/"],
  ["@/lib/auth/", "@/features/auth/lib/"],
  ["@/lib/billing/", "@/features/billing/lib/"],
  ["@/lib/settings/admin/", "@/features/settings/lib/admin/"],
  ["@/lib/settings/", "@/features/settings/lib/"],
  ["@/lib/admin/", "@/features/settings/lib/admin/"],
  ["@/lib/demo/", "@/features/demo/lib/"],
  ["@/lib/share/", "@/features/share/lib/"],
  ["@/lib/players/share-to-players", "@/features/share/lib/share-to-players"],
  ["@/lib/players/player-share-messages", "@/features/share/lib/player-share-messages"],
  ["@/lib/players/", "@/features/players/lib/"],
  ["@/lib/supabase/", "@/shared/lib/supabase/"],
  ["@/lib/cloud/", "@/shared/lib/cloud/"],
  ["@/lib/ai/", "@/shared/lib/ai/"],
  ["@/lib/print/", "@/shared/lib/print/"],
  ["@/lib/viewport/", "@/shared/lib/viewport/"],
  ["@/lib/ui/", "@/shared/lib/ui/"],
  ["@/lib/pwa/", "@/shared/lib/pwa/"],
  ["@/lib/landing/", "@/shared/lib/landing/"],
  ["@/lib/fastdraw/", "@/shared/lib/fastdraw/"],
  ["@/lib/config", "@/shared/lib/config"],

  // styles — feature-specific first
  ["@/styles/playbank.css", "@/features/playbank/styles/playbank.css"],
  ["@/styles/player-share.css", "@/features/share/styles/player-share.css"],
  ["@/styles/player-portal.css", "@/features/share/styles/player-portal.css"],
  ["@/styles/admin-settings.css", "@/features/settings/styles/admin-settings.css"],
  ["@/styles/fc-onboarding.css", "@/features/settings/styles/fc-onboarding.css"],
  ["@/styles/billing-ui.css", "@/features/billing/styles/billing-ui.css"],
  ["@/styles/designer-coach.css", "@/features/designer/styles/designer-coach.css"],
  ["@/styles/designer-ui-v240.css", "@/features/designer/styles/designer-ui-v240.css"],
  ["@/styles/fastdraw-editor-ui.css", "@/features/designer/styles/fastdraw-editor-ui.css"],
  ["@/styles/fc-designer-base.css", "@/features/designer/styles/fc-designer-base.css"],
  ["@/styles/fc-modern-designer.css", "@/features/designer/styles/fc-modern-designer.css"],
  ["@/styles/fc-film-room.css", "@/features/film-room/styles/fc-film-room.css"],
  ["@/styles/fc-film-reel-share.css", "@/features/film-room/styles/fc-film-reel-share.css"],
  ["@/styles/fc-film-scout-print.css", "@/features/film-room/styles/fc-film-scout-print.css"],
  ["@/styles/fc-video-embed.css", "@/features/film-room/styles/fc-video-embed.css"],
  ["@/styles/fc-opponent-scout-print.css", "@/features/opponent-scout/styles/fc-opponent-scout-print.css"],
  ["@/styles/fc-opponent-scout.css", "@/features/opponent-scout/styles/fc-opponent-scout.css"],
  ["@/styles/fc-practice-live.css", "@/features/practice/styles/fc-practice-live.css"],
  ["@/styles/fc-practice-sheet.css", "@/features/practice/styles/fc-practice-sheet.css"],
  ["@/styles/fc-practice.css", "@/features/practice/styles/fc-practice.css"],
  ["@/styles/fc-game-plan-share.css", "@/features/game-plan/styles/fc-game-plan-share.css"],
  ["@/styles/fc-game-plan.css", "@/features/game-plan/styles/fc-game-plan.css"],
  ["@/styles/fc-game-day.css", "@/features/game-plan/styles/fc-game-day.css"],
  ["@/styles/fc-coach-dashboard.css", "@/features/game-plan/styles/fc-coach-dashboard.css"],
  ["@/styles/fc-timeout-mode.css", "@/features/game-plan/styles/fc-timeout-mode.css"],
  ["@/styles/fc-presentation.css", "@/features/game-plan/styles/fc-presentation.css"],
  ["@/styles/fc-counters-demo.css", "@/features/demo/styles/fc-counters-demo.css"],
  ["@/styles/fc-players.css", "@/features/players/styles/fc-players.css"],
  ["@/styles/fc-library-header.css", "@/features/library/styles/fc-library-header.css"],
  ["@/styles/fc-library.css", "@/features/library/styles/fc-library.css"],
  ["@/styles/fc-modern-library.css", "@/features/library/styles/fc-modern-library.css"],
  ["@/styles/fc-fields.css", "@/features/library/styles/fc-fields.css"],
  ["@/styles/fc-playbook-print-settings.css", "@/features/library/styles/fc-playbook-print-settings.css"],
  ["@/styles/fc-playbook-print.css", "@/features/library/styles/fc-playbook-print.css"],
  ["@/styles/fc-playbooks.css", "@/features/library/styles/fc-playbooks.css"],
  ["@/styles/fd-library-laptop.css", "@/features/library/styles/fd-library-laptop.css"],
  ["@/styles/fd-library-tablet.css", "@/features/library/styles/fd-library-tablet.css"],
  ["@/styles/app-error.css", "@/shared/styles/app-error.css"],
  ["@/styles/fc-laptop-lock.css", "@/shared/styles/fc-laptop-lock.css"],
  ["@/styles/fc-pwa.css", "@/shared/styles/fc-pwa.css"],
  ["@/styles/fc-primary-actions.css", "@/shared/styles/fc-primary-actions.css"],
  ["@/styles/overflow-menus.css", "@/shared/styles/overflow-menus.css"],
  ["@/styles/welcome.css", "@/shared/styles/welcome.css"],
  ["@/styles/fd-ui.css", "@/shared/styles/fd-ui.css"],
  ["@/styles/", "@/shared/styles/"],
];

function rewriteContent(text) {
  let out = text;
  // relative css in globals
  out = out.replaceAll('../styles/', '../shared/styles/');
  for (const [from, to] of IMPORT_REWRITES) {
    if (out.includes(from)) out = out.split(from).join(to);
  }
  // filesystem path strings in tests / check-config
  const pathPairs = [
    ["src/components/designer/", "src/features/designer/ui/"],
    ["src/components/film-room/", "src/features/film-room/ui/"],
    ["src/components/library/", "src/features/library/ui/"],
    ["src/components/auth/", "src/features/auth/ui/"],
    ["src/components/settings/", "src/features/settings/ui/"],
    ["src/components/pwa/", "src/shared/ui/pwa/"],
    ["src/components/billing/", "src/features/billing/ui/"],
    ["src/components/share/", "src/features/share/ui/"],
    ["src/components/playbank/", "src/features/playbank/ui/"],
    ["src/components/opponent-scout/", "src/features/opponent-scout/ui/"],
    ["src/components/demo/", "src/features/demo/ui/"],
    ["src/components/shell/", "src/shared/ui/shell/"],
    ["src/components/ui/", "src/shared/ui/kit/"],
    ["src/lib/designer/", "src/features/designer/lib/"],
    ["src/lib/film-room/", "src/features/film-room/lib/"],
    ["src/lib/library/", "src/features/library/lib/"],
    ["src/lib/practice/", "src/features/practice/lib/"],
    ["src/lib/game-plan/", "src/features/game-plan/lib/"],
    ["src/lib/coach/", "src/features/game-plan/lib/coach/"],
    ["src/lib/auth/", "src/features/auth/lib/"],
    ["src/lib/billing/", "src/features/billing/lib/"],
    ["src/lib/settings/", "src/features/settings/lib/"],
    ["src/lib/admin/", "src/features/settings/lib/admin/"],
    ["src/lib/playbank/", "src/features/playbank/lib/"],
    ["src/lib/share/", "src/features/share/lib/"],
    ["src/lib/players/", "src/features/players/lib/"],
    ["src/lib/demo/", "src/features/demo/lib/"],
    ["src/lib/opponent-scout/", "src/features/opponent-scout/lib/"],
    ["src/lib/supabase/", "src/shared/lib/supabase/"],
    ["src/lib/cloud/", "src/shared/lib/cloud/"],
    ["src/lib/ai/", "src/shared/lib/ai/"],
    ["src/lib/print/", "src/shared/lib/print/"],
    ["src/lib/viewport/", "src/shared/lib/viewport/"],
    ["src/lib/ui/", "src/shared/lib/ui/"],
    ["src/lib/pwa/", "src/shared/lib/pwa/"],
    ["src/lib/landing/", "src/shared/lib/landing/"],
    ["src/lib/fastdraw/", "src/shared/lib/fastdraw/"],
    ["src/lib/config", "src/shared/lib/config"],
    ["src/stores/designer/", "src/features/designer/model/designer/"],
    ["src/stores/designer-store.ts", "src/features/designer/model/designer-store.ts"],
    ["src/stores/library-store.ts", "src/features/library/model/library-store.ts"],
    ["src/stores/auth-store.ts", "src/features/auth/model/auth-store.ts"],
    ["src/stores/settings-store.ts", "src/features/settings/model/settings-store.ts"],
    ["src/stores/share-store.ts", "src/features/share/model/share-store.ts"],
    ["src/stores/film-room-store.ts", "src/features/film-room/model/film-room-store.ts"],
    ["src/stores/organizer-store.ts", "src/features/library/model/organizer-store.ts"],
    [
      "src/stores/playbook-print-config-store.ts",
      "src/features/library/model/playbook-print-config-store.ts",
    ],
    ["src/stores/counters-demo-store.ts", "src/features/demo/model/counters-demo-store.ts"],
    ["src/stores/dialog-store.ts", "src/shared/model/dialog-store.ts"],
    ["src/types/", "src/features/__types_fallback__/"], // placeholder — fix below per-file via @ already
    ["../../src/lib/", "../../src/features/__lib_fallback__/"],
  ];
  // Better path rewrites for scripts (order matters)
  const scriptPathPairs = [
    ["src/lib/practice/practice-live-cloud.ts", "src/features/practice/lib/practice-live-cloud.ts"],
    ["src/lib/share/share-link.ts", "src/features/share/lib/share-link.ts"],
    ["src/types/library-meta.ts", "src/features/library/model/library-meta.ts"],
    ["src/lib/settings/library-nav-modules.ts", "src/features/settings/lib/library-nav-modules.ts"],
    ["src/lib/cloud/merge-team-orgs.ts", "src/shared/lib/cloud/merge-team-orgs.ts"],
    ["src/lib/auth/team-organizations.ts", "src/features/auth/lib/team-organizations.ts"],
    ["src/lib/playbank/catalog.ts", "src/features/playbank/lib/catalog.ts"],
    ["src/lib/ai/rate-limit.ts", "src/shared/lib/ai/rate-limit.ts"],
    ["src/lib/library/counter-library-badge.ts", "src/features/library/lib/counter-library-badge.ts"],
    [
      "src/lib/admin/platform-diagnostic-types.ts",
      "src/features/settings/lib/admin/platform-diagnostic-types.ts",
    ],
    ["src/lib/settings/platform-features.ts", "src/features/settings/lib/platform-features.ts"],
    ["src/lib/game-plan/game-plan-items.ts", "src/features/game-plan/lib/game-plan-items.ts"],
    ["src/lib/supabase/env.ts", "src/shared/lib/supabase/env.ts"],
    ["src/lib/supabase/client.ts", "src/shared/lib/supabase/client.ts"],
    ["src/lib/designer/", "src/features/designer/lib/"],
    ["src/lib/film-room/", "src/features/film-room/lib/"],
    ["src/lib/library/", "src/features/library/lib/"],
    ["src/lib/practice/", "src/features/practice/lib/"],
    ["src/lib/game-plan/", "src/features/game-plan/lib/"],
    ["src/lib/auth/", "src/features/auth/lib/"],
    ["src/lib/billing/", "src/features/billing/lib/"],
    ["src/lib/settings/", "src/features/settings/lib/"],
    ["src/lib/admin/", "src/features/settings/lib/admin/"],
    ["src/lib/cloud/", "src/shared/lib/cloud/"],
    ["src/lib/ai/", "src/shared/lib/ai/"],
    ["src/lib/landing/", "src/shared/lib/landing/"],
    ["src/lib/config", "src/shared/lib/config"],
    ["src/components/designer/", "src/features/designer/ui/"],
    ["src/components/library/", "src/features/library/ui/"],
    ["src/components/auth/", "src/features/auth/ui/"],
    ["src/components/settings/", "src/features/settings/ui/"],
    ["src/components/film-room/", "src/features/film-room/ui/"],
    ["src/components/pwa/", "src/shared/ui/pwa/"],
    ["src/stores/", "src/features/__stores__/"], // handled by specific pairs above first
  ];

  // Apply specific script pairs for relative ../../src/...
  for (const [from, to] of scriptPathPairs) {
    if (out.includes(from)) out = out.split(from).join(to);
  }
  for (const [from, to] of pathPairs) {
    if (from.includes("__")) continue;
    if (out.includes(from)) out = out.split(from).join(to);
  }
  // Fix stores that became features/__stores__ incorrectly — undo if needed
  out = out.split("src/features/__stores__/designer-store.ts").join(
    "src/features/designer/model/designer-store.ts",
  );
  out = out.split("src/features/__stores__/library-store.ts").join(
    "src/features/library/model/library-store.ts",
  );
  out = out.split("src/features/__stores__/auth-store.ts").join(
    "src/features/auth/model/auth-store.ts",
  );
  out = out.split("src/features/__stores__/settings-store.ts").join(
    "src/features/settings/model/settings-store.ts",
  );
  out = out.split("src/features/__stores__/").join("src/stores/"); // leftover — rare

  return out;
}

const TEXT_EXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".cjs",
  ".css",
  ".md",
  ".json",
  ".yml",
  ".yaml",
]);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".next" || ent.name === ".git") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (TEXT_EXT.has(path.extname(ent.name))) files.push(p);
  }
  return files;
}

let changed = 0;
for (const file of walk(ROOT)) {
  if (file.includes("migrate-feature-architecture.mjs")) continue;
  const before = fs.readFileSync(file, "utf8");
  const after = rewriteContent(before);
  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    changed++;
  }
}

console.log("Rewrote", changed, "files");

// Write architecture note
ensureDir(path.join(SRC, "features"));
ensureDir(path.join(SRC, "shared"));
fs.writeFileSync(
  path.join(SRC, "ARCHITECTURE.md"),
  `# FastCourt source layout (v3)

- \`app/\` — Next.js routes & API only
- \`features/<domain>/{ui,lib,model,hooks,styles}\` — product modules
- \`shared/{ui,lib,model,hooks,styles}\` — cross-cutting kernel

Domains: auth, billing, settings, library, designer, practice, game-plan,
film-room, opponent-scout, playbank, players, share, demo.
`,
  "utf8",
);

console.log("DONE");
