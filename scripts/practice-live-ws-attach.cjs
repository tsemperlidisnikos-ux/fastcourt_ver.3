/**
 * Attach Practice Live WebSocket relay to an existing HTTP server.
 * Used by server.js (Railway / production) and the standalone LAN WS script.
 */
const { WebSocketServer } = require("ws");

/**
 * @param {import('http').Server} httpServer
 * @param {{ path?: string }} [options]
 */
function attachPracticeLiveWs(httpServer, options = {}) {
  const path = options.path || "/practice-live";
  /** @type {Map<string, { state: object|null, clients: Set<import('ws').WebSocket> }>} */
  const rooms = new Map();

  function roomKey(sessionId, syncToken) {
    return `${String(sessionId || "").trim()}::${String(syncToken || "").trim()}`;
  }

  function getRoom(key) {
    let room = rooms.get(key);
    if (!room) {
      room = { state: null, clients: new Set() };
      rooms.set(key, room);
    }
    return room;
  }

  function send(ws, msg) {
    if (ws.readyState === 1) ws.send(JSON.stringify(msg));
  }

  function broadcast(room, msg) {
    const raw = JSON.stringify(msg);
    for (const client of room.clients) {
      if (client.readyState === 1) client.send(raw);
    }
  }

  const wss = new WebSocketServer({ server: httpServer, path });

  wss.on("connection", (ws) => {
    /** @type {string|null} */
    let joined = null;

    ws.on("message", (data) => {
      let msg;
      try {
        msg = JSON.parse(String(data));
      } catch {
        send(ws, { type: "error", message: "invalid_json" });
        return;
      }

      if (msg.type === "join") {
        const key = roomKey(msg.sessionId, msg.syncToken);
        if (!msg.sessionId || !msg.syncToken) {
          send(ws, { type: "error", message: "missing_room" });
          return;
        }
        if (joined && joined !== key) {
          rooms.get(joined)?.clients.delete(ws);
        }
        joined = key;
        const room = getRoom(key);
        room.clients.add(ws);
        send(ws, { type: "joined", room: key, state: room.state });
        return;
      }

      if (msg.type === "state") {
        const key = roomKey(msg.sessionId, msg.syncToken);
        if (!msg.sessionId || !msg.syncToken || !msg.payload) {
          send(ws, { type: "error", message: "invalid_state" });
          return;
        }
        if (joined && joined !== key) {
          rooms.get(joined)?.clients.delete(ws);
        }
        joined = key;
        const room = getRoom(key);
        room.clients.add(ws);
        const state = {
          ...msg.payload,
          sessionId: msg.sessionId,
          updatedAt: new Date().toISOString(),
        };
        room.state = state;
        broadcast(room, { type: "state", state });
        return;
      }

      if (msg.type === "ping") {
        send(ws, { type: "pong" });
      }
    });

    ws.on("close", () => {
      if (!joined) return;
      const room = rooms.get(joined);
      if (!room) return;
      room.clients.delete(ws);
      if (room.clients.size === 0 && !room.state) rooms.delete(joined);
    });
  });

  return wss;
}

module.exports = { attachPracticeLiveWs };
