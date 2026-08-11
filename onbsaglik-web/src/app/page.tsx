/**
 * Anasayfa — onbsaglik.com giriş sayfası.
 * Hero banner, marka şeridi, öne çıkan ürünler ve kategori kartları içerir.
 */

import type { Metadata } from "next";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryCards from "@/components/home/CategoryCards";
import BrandStrip from "@/components/home/BrandStrip";
import ProductGrid from "@/components/product/ProductGrid";
import {
  getFeaturedProducts,
  getDiscountedProducts,
  getNewProducts,
  getAllBrands,
} from "@/lib/products";

// Anasayfa meta verileri
export const metadata: Metadata = {
  title: "OnbSağlık | Vitamin, Takviye ve Kozmetik Ürünler",
  description:
    "Ocean, Dermoskin, Nutraxin, Bioxcin ve 60+ marka. Vitamin, güneş kremi, şampuan ve cilt bakımı ürünlerini uygun fiyatla satın alın.",
};

export default function AnaSayfa() {
  // Sayfa için veri hazırlığı (Server Component avantajı)
  const featuredProducts = getFeaturedProducts(12);
  const discountedProducts = getDiscountedProducts(8);
  const newProducts = getNewProducts(8);
  const brands = getAllBrands();

  return (
    <>
      {/* Büyük karşılama alanı */}
      <HeroBanner />

      {/* Kategori kart grid'i */}
      <section className="container-custom py-12">
        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: "var(--color-text)" }}>
          Kategoriler
        </h2>
        <CategoryCards />
      </section>

      {/* Öne çıkan ürünler */}
      <section
        className="py-12"
        style={{ background: "var(--gradient-card)" }}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
              Öne Çıkan Ürünler
            </h2>
            <a
              href="/urunler"
              className="btn-outline"
              style={{ padding: "8px 16px", fontSize: "13px" }}
            >
              Tümünü Gör
            </a>
          </div>
          <ProductGrid products={featuredProducts} />
        </div>
      </section>

      {/* Marka şeridi — kaydırmalı */}
      <section className="py-10 overflow-hidden" style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="container-custom mb-6">
          <h2 className="text-xl font-bold text-center" style={{ color: "var(--color-text-muted)" }}>
            Güvenilir Markalar
          </h2>
        </div>
        <BrandStrip brands={brands} />
      </section>

      {/* İndirimli ürünler */}
      {discountedProducts.length > 0 && (
        <section className="container-custom py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
                🏷️ Fırsatlar
              </h2>
              <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                Kaçırmayın — sınırlı stok
              </p>
            </div>
          </div>
          <ProductGrid products={discountedProducts} />
        </section>
      )}

      {/* Yeni ürünler */}
      <section
        className="py-12"
        style={{ background: "var(--gradient-card)" }}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
              ✨ Yeni Gelenler
            </h2>
          </div>
          <ProductGrid products={newProducts} />
        </div>
      </section>

      {/* Güven bölümü */}
      <section className="py-14" style={{ background: "var(--color-surface)" }}>
        <div className="container-custom">
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            }}
          >
            {[
              { emoji: "🚚", title: "Ücretsiz Kargo", desc: "500 TL üzeri siparişlerde" },
              { emoji: "🔒", title: "Güvenli Ödeme", desc: "SSL sertifikalı alışveriş" },
              { emoji: "↩️", title: "Kolay İade", desc: "14 gün içinde ücretsiz" },
              { emoji: "☎️", title: "Müşteri Desteği", desc: "Haftaiçi 09:00-18:00" },
            ].map((item) => (
              <div
                key={item.title}
                className="card text-center"
                style={{ padding: "28px 20px" }}
              >
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>{item.emoji}</div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
