/**
 * robots.txt — Arama motoru tarama kuralları.
 * Admin paneli taranmaz, geri kalan her şey açık.
 */

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Admin paneli, API ve arama sayfaları indexlenmez
        disallow: ["/admin", "/api/", "/ara"],
      },
    ],
    sitemap: "https://onbsaglik.com/sitemap.xml",
    host: "https://onbsaglik.com",
  };
}
