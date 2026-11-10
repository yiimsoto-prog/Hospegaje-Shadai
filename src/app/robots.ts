import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://hospegaje-shadai.yiimsoto.workers.dev";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/pms", "/checkout", "/ops", "/concierge", "/guest/checkin"],
      disallow: ["/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
