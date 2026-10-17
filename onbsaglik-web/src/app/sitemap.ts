/**
 * Sitemap — /sitemap.xml
 * Tüm aktif ürün, kategori ve marka sayfalarını Google'a bildirir.
 * Google botunun ürünleri ve markaları en yüksek öncelikle indexlemesini sağlar.
 */

import { MetadataRoute } from "next";
import { getAllProducts, getAllCategories, getAllBrands } from "@/lib/products";

const BASE_URL = "https://onbsaglik.com.tr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();
  const categories = await getAllCategories();
  const brands = await getAllBrands();

  // Statik ana sayfalar
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
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/kampanyalar`,
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

  // Ürün sayfaları — Arama motoru için en yüksek öncelik
  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/urun/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.95,
  }));

  // Kategori sayfaları
  const categoryPages: MetadataRoute.Sitemap = categories.flatMap((cat) => {
    const pages = [
      {
        url: `${BASE_URL}/kategori/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.85,
      },
    ];
    if (cat.children) {
      cat.children.forEach((child) => {
        pages.push({
          url: `${BASE_URL}/kategori/${child.slug}`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.8,
        });
      });
    }
    return pages;
  });

  // Marka sayfaları (Bioxcin, Alopexy, Ocean vb.)
  const brandPages: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${BASE_URL}/marka/${b.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...brandPages];
}
