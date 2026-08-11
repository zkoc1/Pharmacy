/**
 * Uygulama genelinde kullanılan TypeScript tip tanımları.
 * Her tip tek bir sorumluluğu temsil eder (SOLID - Single Responsibility).
 */

/** Ürün durumu: aktif (satışta), taslak (admin onayı bekliyor) */
export type ProductStatus = "active" | "draft";

/** Ürün veri modeli — Trendyol Excel'inden türetilmiş yapı */
export interface Product {
  id: number;
  name: string;
  slug: string;
  brand: string;
  brandSlug: string;
  category: string;
  categorySlug: string;
  price: number;
  /** Piyasa fiyatı — 0 ise üstü çizili gösterim yapılmaz */
  marketPrice: number;
  vatRate: number;
  barcode: string;
  desi: number;
  stock: number;
  images: string[];
  status: ProductStatus;
  trendyolLink: string;
  /** Admin tarafından eklenen açıklama (opsiyonel) */
  description?: string;
}

/** Marka veri modeli */
export interface Brand {
  id: number;
  name: string;
  slug: string;
  /** Logo URL — mevcut değilse placeholder gösterilir */
  logoUrl?: string;
}

/** Kategori ağacı — 3 seviyeli (ana / alt / alt-alt) */
export interface Category {
  id: number;
  name: string;
  slug: string;
  parentSlug?: string;
  children?: Category[];
}

/** Sepet öğesi */
export interface CartItem {
  product: Product;
  quantity: number;
}

/** Kullanıcı adresi */
export interface Address {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  district: string;
  neighborhood: string;
  fullAddress: string;
  isDefault: boolean;
}

/** Admin kullanıcı oturum bilgisi */
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "stock_manager";
}

/** Ürün liste filtre seçenekleri */
export interface ProductFilter {
  categorySlug?: string;
  brandSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "price_asc" | "price_desc" | "name_asc" | "newest";
}

/** API yanıt sarmalayıcısı */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
}
