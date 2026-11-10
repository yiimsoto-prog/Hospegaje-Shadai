import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://hospegaje-shadai.yiimsoto.workers.dev";
  const now = new Date();
  return [
    "",
    "/pms",
    "/checkout",
    "/ops",
    "/ops/erp",
    "/ops/ai",
    "/ops/maintenance",
    "/ops/security",
    "/guest/checkin",
    "/concierge",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "daily",
    priority: path === "" ? 1 : 0.7,
  }));
}
