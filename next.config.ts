import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Cloudflare Pages / GitLab Pages / cualquier CDN estático.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
