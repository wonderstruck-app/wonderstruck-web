import type { NextConfig } from "next";

const api = (process.env.API_URL ?? "http://localhost:8000").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  env: {
    // Mira's live voice socket goes straight to the API (rewrites don't proxy WebSockets).
    NEXT_PUBLIC_API_WS_URL: process.env.NEXT_PUBLIC_API_WS_URL ?? api.replace(/^http/, "ws"),
  },
  images: {
    // Demo learning imagery for the dashboard mock.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com", pathname: "/photo-*" }],
  },
  partialPrefetching: true,
  // Client queries call the FastAPI backend same-origin, so the Better Auth cookie goes along.
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${api}/api/v1/:path*` }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
