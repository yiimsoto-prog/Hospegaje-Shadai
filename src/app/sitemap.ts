import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://hospegaje-shadai.yiimsoto.workers.dev";
  const now = new Date();
  return ["", "/checkout", "/guest/checkin", "/concierge", "/app"].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "daily",
    priority: path === "" ? 1 : path === "/app" ? 0.3 : 0.7,
  }));
}
