import fs from "node:fs";
import path from "node:path";

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
  if (!text.includes("@/shared/lib/random-id") && !text.includes("randomUUID()")) {
    continue;
  }
  let out = text;
  out = out.replace(
    /import\s*\{\s*randomUUID\s*\}\s*from\s*"@\/shared\/lib\/random-id";/g,
    'import { createRandomId } from "@/shared/lib/random-id";',
  );
  out = out.replace(
    /import\s*\{\s*randomUUID\s*,\s*prefixedId\s*\}\s*from\s*"@\/shared\/lib\/random-id";/g,
    'import { createRandomId, prefixedId } from "@/shared/lib/random-id";',
  );
  // Only replace call sites that came from our helper usage
  if (out.includes('from "@/shared/lib/random-id"')) {
    out = out.split("randomUUID()").join("createRandomId()");
  }
  if (out !== text) {
    fs.writeFileSync(file, out);
    n += 1;
    console.log("updated", norm);
  }
}
console.log("count", n);
