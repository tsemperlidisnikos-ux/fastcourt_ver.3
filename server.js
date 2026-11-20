const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { existsSync } = require("fs");
const { join } = require("path");
const { attachPracticeLiveWs } = require("./scripts/practice-live-ws-attach.cjs");

const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);
// Railway / Plesk / production entry — always serve the production build.
const dev = false;

const buildIdPath = join(__dirname, ".next", "BUILD_ID");
if (!existsSync(buildIdPath)) {
  console.error(
    "[FastCourt] Missing production build. Run `npm ci && npm run build` before starting server.js.",
  );
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
if (
  !supabaseUrl ||
  !supabaseKey ||
  supabaseUrl.includes("YOUR_PROJECT") ||
  supabaseKey.includes("YOUR_ANON_KEY")
) {
  console.warn(
    "[FastCourt] Supabase env vars are missing or still placeholders. " +
      "Cloud auth/sync will be off until NEXT_PUBLIC_SUPABASE_URL and " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY are set, then rebuild.",
  );
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request", req.url, err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  attachPracticeLiveWs(httpServer, { path: "/practice-live" });

  httpServer.listen(port, hostname, () => {
    console.log(`FastCourt ready on http://${hostname}:${port}`);
    console.log(`Practice Live WS on ws://${hostname}:${port}/practice-live`);
  });
});
