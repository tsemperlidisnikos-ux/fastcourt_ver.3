/**
 * Feature domain map for health-check & full-app-check reports.
 * Each domain groups unit test files and core source modules.
 */

/** @type {Array<{id:string,name:string,tests:string[],modules?:string[]}>} */
export const FEATURE_DOMAINS = [
  {
    id: "infrastructure",
    name: "Infrastructure & Routes",
    tests: ["app-structure.test.ts", "env-config.test.ts"],
    modules: [
      "src/app/page.tsx",
      "src/app/login/page.tsx",
      "src/shared/lib/supabase/env.ts",
      "public/sw.js",
      "public/offline.html",
      "src/shared/ui/pwa/PwaBootstrap.tsx",
    ],
  },
  {
    id: "auth",
    name: "Auth & Access",
    tests: [
      "device-access.test.ts",
      "safe-next-path.test.ts",
      "stripe-access.test.ts",
      "team-invite.test.ts",
      "team-org-access.test.ts",
      "team-orgs-cloud-merge.test.ts",
    ],
    modules: [
      "src/features/auth/model/auth-store.ts",
      "src/features/auth/ui/LoginForm.tsx",
      "src/features/auth/lib/access.ts",
      "src/features/auth/lib/safe-next-path.ts",
    ],
  },
  {
    id: "library",
    name: "Library & Plays",
    tests: [
      "library-modules.test.ts",
      "library-merge.test.ts",
      "library-meta-merge.test.ts",
      "library-tombstones.test.ts",
      "library-play-ownership.test.ts",
      "library-user-isolation.test.ts",
      "library-backup-import.test.ts",
      "practice-missing-play.test.ts",
      "practice-templates.test.ts",
      "practice-live-sync.test.ts",
      "video-url.test.ts",
      "playbank-catalog.test.ts",
      "library-nav-modules.test.ts",
    ],
    modules: [
      "src/features/library/model/library-store.ts",
      "src/features/library/ui/LibraryScreen.tsx",
      "src/features/library/ui/DrawLibraryView.tsx",
      "src/features/library/lib/convert.ts",
      "src/features/library/lib/play-ownership.ts",
      "src/features/library/lib/library-cache-policy.ts",
      "src/features/settings/lib/library-backup.ts",
      "src/shared/lib/cloud/library-sync.ts",
      "src/features/practice/lib/practice-items.ts",
      "src/features/practice/lib/templates.ts",
      "src/features/practice/lib/practice-live-cloud.ts",
      "src/features/practice/lib/practice-live-ws.ts",
    ],
  },
  {
    id: "designer-lines",
    name: "Designer — Line Snap",
    tests: [
      "designer-dribble-geometry.test.ts",
      "designer-line-snap.test.ts",
      "designer-snap.test.ts",
      "screen-bar-geometry.test.ts",
    ],
    modules: [
      "src/features/designer/lib/player-edge-snap.ts",
      "src/features/designer/lib/action-geometry.ts",
    ],
  },
  {
    id: "designer-propagation",
    name: "Designer — Frame Propagation",
    tests: ["designer-propagation.test.ts", "frame-action-state.test.ts"],
    modules: [
      "src/features/designer/lib/action-propagation.ts",
      "src/features/designer/lib/frame-propagation.ts",
    ],
  },
  {
    id: "designer-visual",
    name: "Designer — Thumbnails & Animation",
    tests: [
      "court-hg-visual.test.ts",
      "court-vector-geometry.test.ts",
      "designer-thumbnail.test.ts",
      "designer-animation.test.ts",
      "thumbnail-objects.test.ts",
      "designer-mirror.test.ts",
      "designer-action-convert.test.ts",
    ],
    modules: [
      "src/features/designer/lib/thumbnail-objects.ts",
      "src/features/designer/lib/court-vector-geometry.ts",
      "src/features/designer/lib/court-hg-templates.ts",
      "src/features/designer/ui/CourtFrameThumbnail.tsx",
      "src/features/designer/ui/VectorCourtFloor.tsx",
    ],
  },
  {
    id: "designer-ui",
    name: "Designer — UI Shell",
    tests: [
      "designer-ui.test.ts",
      "player-limits.test.ts",
      "designer-document-snapshot.test.ts",
      "stroke-partial-eraser.test.ts",
    ],
    modules: [
      "src/features/designer/ui/DesignerScreen.tsx",
      "src/features/designer/model/designer-store.ts",
      "src/features/designer/model/designer/helpers.ts",
      "src/features/designer/lib/designer-document-snapshot.ts",
      "src/features/designer/lib/use-designer-unsaved-guard.ts",
      "src/features/designer/lib/stroke-partial-eraser.ts",
      "src/features/designer/lib/whiteboard-eraser.ts",
    ],
  },
  {
    id: "settings",
    name: "Settings & Branding",
    tests: [
      "org-branding.test.ts",
      "pdf-brand-export.test.ts",
      "color-contrast.test.ts",
      "landing-pricing-config.test.ts",
    ],
    modules: [
      "src/features/settings/model/settings-store.ts",
      "src/features/settings/lib/appearance-settings.ts",
      "src/features/settings/lib/pdf-brand-export.ts",
      "src/features/settings/lib/billing-config.ts",
      "src/shared/lib/landing/pricing.ts",
    ],
  },
  {
    id: "film-ai",
    name: "Film Room — AI Assistant",
    tests: [
      "film-clip-analyze.test.ts",
      "film-scout-print.test.ts",
      "film-room-bookmarks.test.ts",
      "film-game-plan-evidence.test.ts",
      "apply-ai-scout.test.ts",
      "ai-play-pattern-match.test.ts",
      "ai-openai-env.test.ts",
      "ai-rate-limit.test.ts",
    ],
    modules: [
      "src/app/api/film/analyze/route.ts",
      "src/app/api/film/analyze/status/route.ts",
      "src/features/film-room/ui/FilmRoomAnalyzeModal.tsx",
      "src/features/film-room/ui/FilmScoutPrintDocument.tsx",
      "src/features/film-room/lib/film-scout-print-model.ts",
      "src/features/film-room/lib/film-room-bookmarks.ts",
      "src/features/film-room/lib/film-game-plan-evidence.ts",
      "src/features/film-room/ui/FilmRoomBookmarkBar.tsx",
      "src/features/game-plan/ui/GamePlanFilmEvidencePanel.tsx",
      "src/features/film-room/lib/apply-ai-scout-to-game-plan.ts",
      "src/features/film-room/lib/ai-play-pattern-match.ts",
      "src/shared/lib/ai/env.ts",
      "src/shared/lib/ai/rate-limit.ts",
      "src/shared/lib/ai/require-ai-caller.ts",
    ],
  },
  {
    id: "admin",
    name: "Admin & Data",
    tests: ["purge-data.test.ts"],
    modules: ["src/features/settings/lib/admin/purge-application-data.ts"],
  },
];

/** @type {Array<{area:string,steps:string[]}>} */
export const MANUAL_CHECKLIST = [
  {
    area: "Login / Auth",
    steps: [
      "Email/password login (local + cloud if configured)",
      "OAuth buttons when cloud is on",
      "Signup wizard completes and redirects to library",
      "Team invite link pre-fills on login page",
    ],
  },
  {
    area: "Library",
    steps: [
      "Create new play, open in designer",
      "Import .fdb file, preview thumbnails render",
      "Playbooks tab: present / print / share",
      "Practice tab: create session, live timer",
      "Players tab: roster list loads",
    ],
  },
  {
    area: "Designer",
    steps: [
      "Place O/D players, assign ball (tap player)",
      "Draw pass → next frame → ball on receiver",
      "Dribble + pass chain, handoff, cut, screen",
      "Formations & FastBuild apply correctly",
      "Undo/redo, frame duplicate, mirror frame/play",
      "Animation playback timing & ball transfer",
      "Export MP4 from Animation tab (Chrome/Edge)",
      "Whiteboard ink + eraser on frame",
      "Clear frame modal — black text on Cancel/Clear",
    ],
  },
  {
    area: "Film Room — AI Assistant",
    steps: [
      "Set OPENAI_API_KEY in .env.local or Vercel env vars",
      "Upload MP4 clip (not YouTube-only for analyze)",
      "Film Room → Analyze clip → AI scout read modal",
      "Apply full scout → game plan opponent board + defense/offense plays",
    ],
  },
  {
    area: "Settings / Admin",
    steps: [
      "Coach subscription & PDF branding save",
      "Admin users CRUD (if admin role)",
      "Appearance settings persist after reload",
    ],
  },
];
