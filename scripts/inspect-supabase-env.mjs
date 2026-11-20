import fs from "node:fs";

function dump(file) {
  if (!fs.existsSync(file)) {
    console.log(`${file}: missing`);
    return;
  }
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  console.log(`--- ${file} ---`);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!/supabase|site_url|cloud/i.test(key)) continue;
    if (/key|secret|token/i.test(key)) {
      console.log(`${key}=set len=${val.length} looksJwt=${val.startsWith("eyJ")}`);
    } else {
      console.log(`${key}=${val || "(empty)"}`);
    }
  }
}

dump(".env.local");
dump(".env");
