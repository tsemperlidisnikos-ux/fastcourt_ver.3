/**
 * Standalone LAN Practice Live WebSocket (separate port for `npm run dev:live`).
 *
 *   node scripts/practice-live-ws-server.mjs
 *   Default: ws://0.0.0.0:3001/practice-live
 */
import { createServer } from "node:http";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { attachPracticeLiveWs } = require("./practice-live-ws-attach.cjs");

const HOST = process.env.LIVE_WS_HOST || "0.0.0.0";
const PORT = Number(process.env.LIVE_WS_PORT || process.env.NEXT_PUBLIC_LIVE_WS_PORT || 3001);

const httpServer = createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("FastCourt Practice Live WS\n");
});

attachPracticeLiveWs(httpServer, { path: "/practice-live" });

httpServer.listen(PORT, HOST, () => {
  console.log(`[FastCourt Live] WebSocket on ws://${HOST}:${PORT}/practice-live`);
  console.log("[FastCourt Live] For tablets, open the app via your LAN IP (not only localhost).");
});
