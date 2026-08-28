import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/login", "/register", "/reset-password"],
      },
    ],
    sitemap: "https://catskillas.com/sitemap.xml",
    host: "https://catskillas.com",
  };
}
