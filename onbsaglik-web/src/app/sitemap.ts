/**
 * Sitemap — /sitemap.xml
 * Tüm aktif ürün, kategori ve marka sayfalarını Google'a bildirir.
 * SSG ile statik olarak üretilir — her deploy'da yenilenir.
 */

import { MetadataRoute } from "next";
import { getAllProducts, getAllCategories, getAllBrands } from "@/lib/products";

const BASE_URL = "https://onbsaglik.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const products = getAllProducts();
  const categories = getAllCategories();
  const brands = getAllBrands();

  // Statik sayfalar
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/urunler`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/hakkimizda`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/iletisim`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Ürün sayfaları
  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/urun/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Kategori sayfaları
  const categoryPages: MetadataRoute.Sitemap = categories.flatMap((cat) => {
    const pages = [
      {
        url: `${BASE_URL}/kategori/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
    ];
    if (cat.children) {
      cat.children.forEach((child) => {
        pages.push({
          url: `${BASE_URL}/kategori/${child.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        });
      });
    }
    return pages;
  });

  // Marka sayfaları
  const brandPages: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${BASE_URL}/marka/${b.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...brandPages];
}
