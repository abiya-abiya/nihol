import type { NextConfig } from "next";

// cacheComponents is deliberately OFF: classic dynamic behaviour is simpler for a
// 48-hour team (route handlers run per request; `export const dynamic` works).
const nextConfig: NextConfig = {
  // local demo address: http://nihol.localhost:3000
  allowedDevOrigins: ["nihol.localhost"],
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
