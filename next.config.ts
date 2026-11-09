import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server routes (/api/*) + Postgres. No static export: authz runs on the server.
  images: { unoptimized: true },
};

export default nextConfig;
