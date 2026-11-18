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
  // The public landing page is not designed yet; send visitors to the learner dashboard mock.
  async redirects() {
    return [{ source: "/", destination: "/dashboard", permanent: false }];
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
