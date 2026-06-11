import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/hub", "/api/"],
    },
    sitemap: "https://rugbyradar.co/sitemap.xml",
  };
}
