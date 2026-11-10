import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://hospegaje-shadai.yiimsoto.workers.dev";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/concierge", "/guest/checkin", "/checkout", "/reserve"],
      disallow: ["/api/", "/app", "/ops", "/pms"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
