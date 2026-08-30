import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/api/",
          "/login",
          "/register",
          "/reset-password",
          "/*?*", // Prevents crawling duplicate query parameter variations (e.g., ?category=...&vendor=...)
          "/*?search=*", // Prevents bot from crawling internal search result pages
        ],
      },
      // Optional: Slow down aggressively fast third-party scrapers while keeping Google standard
      {
        userAgent: ["PetalBot", "AhrefsBot", "SemrushBot", "Bytespider"],
        crawlDelay: 10,
      },
    ],
    sitemap: "https://catskillas.com/sitemap.xml",
    host: "https://catskillas.com",
  };
}