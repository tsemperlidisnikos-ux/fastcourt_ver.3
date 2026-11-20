import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function exists(relPath: string) {
  return fs.existsSync(path.join(ROOT, relPath));
}

describe("app routes & entry points", () => {
  const routes = [
    "src/app/page.tsx",
    "src/app/login/page.tsx",
    "src/app/(app)/library/page.tsx",
    "src/app/(app)/designer/page.tsx",
    "src/app/(app)/settings/page.tsx",
    "src/app/privacy/page.tsx",
    "src/app/terms/page.tsx",
  ];

  for (const route of routes) {
    it(`route file exists: ${route}`, () => {
      assert.ok(exists(route), `Missing route: ${route}`);
    });
  }

  it("auth callback route exists", () => {
    assert.ok(
      exists("src/app/auth/callback/route.ts") ||
        exists("src/app/auth/callback/route.tsx"),
    );
  });
});

describe("core modules & stores", () => {
  const required = [
    "src/features/designer/model/designer-store.ts",
    "src/features/library/model/library-store.ts",
    "src/features/auth/model/auth-store.ts",
    "src/features/settings/model/settings-store.ts",
    "src/features/designer/lib/frame-propagation.ts",
    "src/features/designer/lib/action-propagation.ts",
    "src/features/designer/lib/player-edge-snap.ts",
    "src/shared/lib/supabase/env.ts",
    "src/shared/lib/supabase/client.ts",
    "src/features/designer/ui/DesignerScreen.tsx",
    "src/features/library/ui/LibraryScreen.tsx",
    "src/features/auth/ui/LoginForm.tsx",
  ];

  for (const file of required) {
    it(`module exists: ${file}`, () => {
      assert.ok(exists(file), `Missing module: ${file}`);
    });
  }
});

describe("library tabs wiring", () => {
  it("PlayBankView is imported in LibraryScreen", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "src/features/library/ui/LibraryScreen.tsx"),
      "utf8",
    );
    assert.match(src, /PlayBankView/);
    assert.match(src, /playbank/);
  });

  it("film-room and opponent-scout routes exist", () => {
    assert.ok(exists("src/app/(app)/film-room/page.tsx"));
    assert.ok(exists("src/app/(app)/opponent-scout/page.tsx"));
  });

  it("PlayersView is imported in LibraryScreen", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "src/features/library/ui/LibraryScreen.tsx"),
      "utf8",
    );
    assert.match(src, /PlayersView/);
    assert.match(src, /players/);
  });
});

describe("public assets", () => {
  it("web manifest exists", () => {
    assert.ok(exists("public/manifest.webmanifest") || exists("public/manifest.json"));
  });

  it("PWA service worker and offline shell exist", () => {
    assert.ok(exists("public/sw.js"), "Run npm run postinstall or node scripts/generate-sw.mjs");
    assert.ok(exists("public/offline.html"));
    const sw = fs.readFileSync(path.join(ROOT, "public/sw.js"), "utf8");
    assert.match(sw, /fastcourt-shell-/);
    assert.match(sw, /offline\.html/);
  });

  it("app icon exists", () => {
    assert.ok(
      exists("public/icon.svg") ||
        exists("public/icons/icon.svg") ||
        exists("src/app/favicon.ico"),
    );
  });
});

describe("environment template", () => {
  it(".env.example documents Supabase vars", () => {
    assert.ok(exists(".env.example"));
    const example = fs.readFileSync(path.join(ROOT, ".env.example"), "utf8");
    assert.match(example, /NEXT_PUBLIC_SUPABASE_URL/);
    assert.match(example, /NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  });
});
