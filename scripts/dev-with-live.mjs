/**
 * Run Next.js dev + Practice Live WebSocket server together.
 */
import { spawn } from "node:child_process";

const children = [];

function run(command, args, name) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });
  child.on("exit", (code, signal) => {
    console.log(`[${name}] exited code=${code} signal=${signal || ""}`);
    for (const other of children) {
      if (other !== child && !other.killed) other.kill("SIGTERM");
    }
    process.exit(code ?? 1);
  });
  children.push(child);
}

run(process.execPath, ["scripts/practice-live-ws-server.mjs"], "live-ws");
run("npx", ["next", "dev", "--webpack"], "next");

function shutdown() {
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
