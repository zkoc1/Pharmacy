/**
 * Ürün veri servis katmanı.
 * Tüm ürün işlemleri bu modül üzerinden yapılır — Repository pattern uygulaması.
 * İleride API entegrasyonunda sadece bu dosya değişecek.
 */

import type { Product, Brand, Category, ProductFilter } from "@/types";
import brandsData from "@/data/brands.json";
import categoriesData from "@/data/categories.json";
import { supabase } from "@/lib/supabase";

const ALL_BRANDS = brandsData as Brand[];
const ALL_CATEGORIES = categoriesData as Category[];

// Yardımcı: Veritabanından gelen veriyi Product tipine çevirir
function mapProduct(p: any): Product {
  const price = Number(p.price) || 0;
  let marketPrice = Number(p.market_price ?? p.marketPrice) || 0;

  // Tüm ürünlerde piyasa değeri üzerinden indirim gösterilmesi kuralı
  // Eğer marketPrice yoksa veya satış fiyatından en az %8 yüksek değilse (örn. 1 TL fark veya 0%),
  // gerçekçi bir perakende piyasa fiyatı oluştur (%25 fazlası -> yaklaşık %20 indirim).
  if (!marketPrice || marketPrice < price * 1.08) {
    marketPrice = Math.round(price * 1.25 * 100) / 100;
  }

  return {
    ...p,
    price,
    marketPrice,
    brandSlug: p.brand_slug || p.brandSlug,
    categorySlug: p.category_slug || p.categorySlug,
    vatRate: p.vat_rate || p.vatRate,
    trendyolLink: p.trendyol_link || p.trendyolLink,
    images: typeof p.images === 'string' ? (p.images.startsWith('[') ? JSON.parse(p.images) : p.images.split(',')) : (p.images || []),
  };
}

/** Tüm aktif ürünleri döndürür */
export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    
    .order("id", { ascending: false });
    
  if (error || !data) return [];
  return data.map(mapProduct);
}

/** Slug'a göre tek ürün döndürür */
export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    
    .single();
    
  if (error || !data) return undefined;
  return mapProduct(data);
}

/** Kategori slug'ına göre ürünleri filtreler */
export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_slug", categorySlug)
    ;
    
  if (error || !data) return [];
  return data.map(mapProduct);
}

/** Marka slug'ına göre ürünleri filtreler */
export async function getProductsByBrand(brandSlug: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("brand_slug", brandSlug)
    ;
    
  if (error || !data) return [];
  return data.map(mapProduct);
}

/** Türkçe karakterleri normalize eden arama yardımcısı */
export function normalizeTurkishText(str: string): string {
  if (!str) return "";
  return str
    .toLocaleLowerCase("tr-TR")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[\s\-_]+/g, " ")
    .trim();
}

/** Çoklu filtre ile ürün listesi döndürür */
export async function filterProducts(filter: ProductFilter): Promise<{
  products: Product[];
  total: number;
}> {
  let query = supabase.from("products").select("*");

  // Kategori filtresi
  if (filter.categorySlug) {
    query = query.eq("category_slug", filter.categorySlug);
  }

  // Marka filtresi
  if (filter.brandSlug) {
    query = query.eq("brand_slug", filter.brandSlug);
  }

  // Fiyat filtresi
  if (filter.minPrice !== undefined) {
    query = query.gte("price", filter.minPrice);
  }
  if (filter.maxPrice !== undefined) {
    query = query.lte("price", filter.maxPrice);
  }

  // Stok filtresi
  if (filter.inStock) {
    query = query.gt("stock", 0);
  }

  const { data, error } = await query;
  if (error || !data) return { products: [], total: 0 };
  
  let result = data.map(mapProduct);

  // Akıllı Arama filtresi (Türkçe karakter duyarsız & çok kelimeli eşleşme)
  if (filter.search) {
    const rawQ = filter.search.toLocaleLowerCase("tr-TR").trim();
    const normQ = normalizeTurkishText(filter.search);
    const searchTerms = normQ.split(" ").filter((t) => t.length > 0);

    result = result.filter((p) => {
      const nameNorm = normalizeTurkishText(p.name);
      const brandNorm = normalizeTurkishText(p.brand);
      const catNorm = normalizeTurkishText(p.category);
      const combined = `${nameNorm} ${brandNorm} ${catNorm}`;

      // Bütün arama kelimelerini karşılıyor mu?
      const allWordsMatch = searchTerms.every((term) => combined.includes(term));
      const directMatch =
        p.name.toLocaleLowerCase("tr-TR").includes(rawQ) ||
        p.brand.toLocaleLowerCase("tr-TR").includes(rawQ) ||
        p.category.toLocaleLowerCase("tr-TR").includes(rawQ);

      return allWordsMatch || directMatch;
    });
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
      result.sort((a, b) => b.id - a.id);
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
export async function getFeaturedProducts(count = 8): Promise<Product[]> {
  const all = await getAllProducts();
  return all
    .filter((p) => p.stock > 0 && p.images.length > 0)
    .sort((a, b) => {
      const aDiscount = a.marketPrice > 0 ? 1 : 0;
      const bDiscount = b.marketPrice > 0 ? 1 : 0;
      return bDiscount - aDiscount;
    })
    .slice(0, count);
}

/** Yeni ürünler — son eklenen (ID'ye göre azalan) */
export async function getNewProducts(count = 8): Promise<Product[]> {
  const all = await getAllProducts();
  return all
    .filter((p) => p.images.length > 0)
    .sort((a, b) => b.id - a.id)
    .slice(0, count);
}

/** İndirimli ürünler */
export async function getDiscountedProducts(count = 8): Promise<Product[]> {
  const all = await getAllProducts();
  return all
    .filter((p) => p.marketPrice > 0 && p.images.length > 0)
    .sort((a, b) => {
      const aRate = (a.marketPrice - a.price) / a.marketPrice;
      const bRate = (b.marketPrice - b.price) / b.marketPrice;
      return bRate - aRate;
    })
    .slice(0, count);
}

/** 
 * İndirim yüzdesini hesaplar (Piyasa Değeri ile Satış Fiyatı arasındaki indirim).
 * Argüman sırasından bağımsız olarak yüksek olanı piyasa değeri, düşük olanı satış fiyatı kabul eder.
 */
export function calcDiscount(price: number, marketPrice?: number): number {
  const p1 = Number(price) || 0;
  const p2 = Number(marketPrice) || 0;
  if (!p1 && !p2) return 0;
  if (!p1 || !p2) return 20;

  const higher = Math.max(p1, p2);
  const lower = Math.min(p1, p2);
  if (higher <= lower) return 20;

  const rate = Math.round(((higher - lower) / higher) * 100);
  return rate >= 5 ? rate : 20;
}

/** TL formatlayıcı — Türkçe locale */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(price);
}

// Marka işlemleri - Dinamik (Veritabanından)
export async function getAllBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from("products")
    .select("brand, brand_slug")
    ;

  if (error || !data) return [];

  // Tekilleştirme (Unique)
  const brandMap = new Map<string, Brand>();
  let idCounter = 1;
  data.forEach((p) => {
    if (p.brand_slug && !brandMap.has(p.brand_slug)) {
      brandMap.set(p.brand_slug, {
        id: idCounter++,
        name: p.brand || p.brand_slug,
        slug: p.brand_slug,
      });
    }
  });

  return Array.from(brandMap.values()).sort((a, b) => a.name.localeCompare(b.name, "tr"));
}

export async function getBrandBySlug(slug: string): Promise<Brand | undefined> {
  const brands = await getAllBrands();
  return brands.find((b) => b.slug === slug);
}

// Kategori işlemleri - Dinamik (Veritabanından)
export async function getAllCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("products")
    .select("category, category_slug")
    ;

  if (error || !data) return [];

  const catMap = new Map<string, Category>();
  let idCounter = 1;
  data.forEach((p) => {
    if (p.category_slug && !catMap.has(p.category_slug)) {
      catMap.set(p.category_slug, {
        id: idCounter++,
        name: p.category || p.category_slug,
        slug: p.category_slug,
      });
    }
  });

  return Array.from(catMap.values()).sort((a, b) => a.name.localeCompare(b.name, "tr"));
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const categories = await getAllCategories();
  return categories.find((c) => c.slug === slug);
}
