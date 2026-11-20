import type { FastDrawImportApi } from "@/shared/lib/fastdraw/types";

let loaded = false;

export async function loadFastDrawModules(): Promise<FastDrawImportApi> {
  if (typeof window === "undefined") {
    throw new Error("FastDraw modules can only load in the browser.");
  }

  if (!loaded) {
    await import("@/shared/lib/fastdraw/legacy/fastdraw-icb-scan.js");
    await import("@/shared/lib/fastdraw/legacy/fastdraw-decode.js");
    await import("@/shared/lib/fastdraw/legacy/fastdraw-import.js");
    loaded = true;
  }

  const api = window.FastDrawImport;
  if (!api?.parse) {
    throw new Error("FastDraw import module failed to initialize.");
  }
  return api;
}
