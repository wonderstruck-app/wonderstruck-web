import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  images: {
    // Demo learning imagery for the dashboard mock.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com", pathname: "/photo-*" }],
  },
  partialPrefetching: true,
  // Client queries call the FastAPI backend same-origin, so the Better Auth cookie goes along.
  async rewrites() {
    const api = (process.env.API_URL ?? "http://localhost:8000").replace(/\/+$/, "");
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
