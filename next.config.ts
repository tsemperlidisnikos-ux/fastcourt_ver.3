import type { NextConfig } from "next";

const isNetlify = process.env.NETLIFY === "true";

const nextConfig: NextConfig = {
  // Portable USB / Electron needs standalone, but Netlify Next plugin expects default output.
  output: isNetlify ? undefined : "standalone",
  // Allow phone/tablet on LAN to use webpack HMR during `npm run dev`.
  allowedDevOrigins: ["192.168.1.63"],
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        source: "/offline.html",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
