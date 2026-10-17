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
        // Admin paneli, API, arama, sepet ve ödeme sayfaları indexlenmez
        disallow: ["/admin", "/admin/", "/api/", "/ara", "/odeme", "/hesabim"],
      },
    ],
    sitemap: "https://onbsaglik.com.tr/sitemap.xml",
    host: "https://onbsaglik.com.tr",
  };
}
