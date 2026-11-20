import fs from "node:fs";
import path from "node:path";

const IMPORT = 'import { randomUUID } from "@/shared/lib/random-id";\n';

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (/\.(ts|tsx)$/.test(ent.name)) files.push(p);
  }
  return files;
}

let n = 0;
for (const file of walk("src")) {
  const norm = file.replace(/\\/g, "/");
  if (norm.endsWith("shared/lib/random-id.ts")) continue;
  let text = fs.readFileSync(file, "utf8");
  if (!text.includes("crypto.randomUUID")) continue;

  let out = text.split("crypto.randomUUID()").join("randomUUID()");
  out = out.replace(
    /typeof crypto !== "undefined" && crypto\.randomUUID\s*\?\s*randomUUID\(\)\s*:\s*`device-\$\{Date\.now\(\)\}`/,
    "randomUUID()",
  );

  if (!out.includes("@/shared/lib/random-id")) {
    const m = out.match(/^((?:import .+;\r?\n)+)/m);
    if (m) out = out.replace(m[1], m[1] + IMPORT);
    else out = IMPORT + out;
  }

  fs.writeFileSync(file, out);
  n += 1;
  console.log("fixed", norm);
}
console.log("count", n);
