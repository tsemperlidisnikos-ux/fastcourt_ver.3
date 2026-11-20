import fs from "node:fs";
import path from "node:path";

const map = {
  "library-meta": "features/library/model/library-meta",
  library: "features/library/model/library",
  designer: "features/designer/model/designer",
  "film-room": "features/film-room/model/film-room",
  auth: "features/auth/model/auth",
  "admin-user": "features/auth/model/admin-user",
  "team-org": "features/auth/model/team-org",
  signup: "features/auth/model/signup",
  "player-roster": "features/players/model/player-roster",
  "opponent-scout": "features/opponent-scout/model/opponent-scout",
  "billing-config": "features/billing/model/billing-config",
  "payment-methods": "features/billing/model/payment-methods",
  "appearance-settings": "features/settings/model/appearance-settings",
  "default-fields": "features/settings/model/default-fields",
  "library-nav-modules": "features/settings/model/library-nav-modules",
  "org-branding": "features/settings/model/org-branding",
  "pdf-branding": "features/settings/model/pdf-branding",
  "platform-features": "features/settings/model/platform-features",
  "platform-layout": "features/settings/model/platform-layout",
  "user-settings": "features/settings/model/user-settings",
  "playbook-print-config": "features/library/model/playbook-print-config",
};

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", ".next"].includes(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (/\.(ts|tsx|mjs|js)$/.test(ent.name)) files.push(p);
  }
  return files;
}

const keys = Object.keys(map).sort((a, b) => b.length - a.length);
let n = 0;
for (const file of walk(".")) {
  if (file.includes("fix-types-fallback") || file.includes("migrate-feature-architecture")) {
    continue;
  }
  let text = fs.readFileSync(file, "utf8");
  if (!text.includes("__types_fallback__")) continue;
  let out = text;
  for (const key of keys) {
    const from = `src/features/__types_fallback__/${key}`;
    const to = `src/${map[key]}`;
    out = out.split(from).join(to);
  }
  if (out !== text) {
    fs.writeFileSync(file, out);
    n += 1;
  }
}
console.log("fixed", n, "files");
