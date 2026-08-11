/**
 * Ürün veri servis katmanı.
 * Tüm ürün işlemleri bu modül üzerinden yapılır — Repository pattern uygulaması.
 * İleride API entegrasyonunda sadece bu dosya değişecek.
 */

import type { Product, Brand, Category, ProductFilter } from "@/types";
import productsData from "@/data/products.json";
import brandsData from "@/data/brands.json";
import categoriesData from "@/data/categories.json";

// JSON verilerini TypeScript tiplerine dönüştür
const ALL_PRODUCTS = productsData as Product[];
const ALL_BRANDS = brandsData as Brand[];
const ALL_CATEGORIES = categoriesData as Category[];

/**
 * Yalnızca aktif (yayındaki) ürünleri filtreler.
 * Taslak ürünler admin onayı olmadan müşterilere gösterilmez.
 */
function getActiveProducts(): Product[] {
  return ALL_PRODUCTS.filter((p) => p.status === "active");
}

/** Tüm aktif ürünleri döndürür */
export function getAllProducts(): Product[] {
  return getActiveProducts();
}

/** Slug'a göre tek ürün döndürür */
export function getProductBySlug(slug: string): Product | undefined {
  return getActiveProducts().find((p) => p.slug === slug);
}

/** Kategori slug'ına göre ürünleri filtreler */
export function getProductsByCategory(categorySlug: string): Product[] {
  return getActiveProducts().filter((p) => p.categorySlug === categorySlug);
}

/** Marka slug'ına göre ürünleri filtreler */
export function getProductsByBrand(brandSlug: string): Product[] {
  return getActiveProducts().filter((p) => p.brandSlug === brandSlug);
}

/** Çoklu filtre ile ürün listesi döndürür */
export function filterProducts(filter: ProductFilter): {
  products: Product[];
  total: number;
} {
  let result = getActiveProducts();

  // Kategori filtresi
  if (filter.categorySlug) {
    result = result.filter((p) => p.categorySlug === filter.categorySlug);
  }

  // Marka filtresi
  if (filter.brandSlug) {
    result = result.filter((p) => p.brandSlug === filter.brandSlug);
  }

  // Fiyat filtresi
  if (filter.minPrice !== undefined) {
    result = result.filter((p) => p.price >= filter.minPrice!);
  }
  if (filter.maxPrice !== undefined) {
    result = result.filter((p) => p.price <= filter.maxPrice!);
  }

  // Stok filtresi
  if (filter.inStock) {
    result = result.filter((p) => p.stock > 0);
  }

  // Arama filtresi (ürün adı, marka, kategori)
  if (filter.search) {
    const q = filter.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  // Sıralama
  switch (filter.sortBy) {
    case "price_asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "name_asc":
      result.sort((a, b) => a.name.localeCompare(b.name, "tr"));
      break;
    default:
      // Varsayılan: ID sırası (veri tabanı ekleme sırası)
      break;
  }

  const total = result.length;

  // Sayfalama
  const page = filter.page ?? 1;
  const limit = filter.limit ?? 24;
  const start = (page - 1) * limit;
  result = result.slice(start, start + limit);

  return { products: result, total };
}

/** Öne çıkan ürünler — anasayfa için (stoklu, indirimli önce) */
export function getFeaturedProducts(count = 8): Product[] {
  return getActiveProducts()
    .filter((p) => p.stock > 0 && p.images.length > 0)
    .sort((a, b) => {
      // İndirimli ürünler önce gelsin
      const aDiscount = a.marketPrice > 0 ? 1 : 0;
      const bDiscount = b.marketPrice > 0 ? 1 : 0;
      return bDiscount - aDiscount;
    })
    .slice(0, count);
}

/** Yeni ürünler — son eklenen (ID'ye göre azalan) */
export function getNewProducts(count = 8): Product[] {
  return getActiveProducts()
    .filter((p) => p.images.length > 0)
    .sort((a, b) => b.id - a.id)
    .slice(0, count);
}

/** İndirimli ürünler */
export function getDiscountedProducts(count = 8): Product[] {
  return getActiveProducts()
    .filter((p) => p.marketPrice > 0 && p.images.length > 0)
    .sort((a, b) => {
      // İndirim yüzdesine göre sırala
      const aRate = (a.marketPrice - a.price) / a.marketPrice;
      const bRate = (b.marketPrice - b.price) / b.marketPrice;
      return bRate - aRate;
    })
    .slice(0, count);
}

/** İndirim yüzdesini hesaplar */
export function calcDiscount(price: number, marketPrice: number): number {
  if (!marketPrice || marketPrice <= price) return 0;
  return Math.round(((marketPrice - price) / marketPrice) * 100);
}

/** TL formatlayıcı — Türkçe locale */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(price);
}

// Marka işlemleri
export function getAllBrands(): Brand[] {
  return ALL_BRANDS;
}

export function getBrandBySlug(slug: string): Brand | undefined {
  return ALL_BRANDS.find((b) => b.slug === slug);
}

// Kategori işlemleri
export function getAllCategories(): Category[] {
  return ALL_CATEGORIES;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return ALL_CATEGORIES.find((c) => c.slug === slug);
}
