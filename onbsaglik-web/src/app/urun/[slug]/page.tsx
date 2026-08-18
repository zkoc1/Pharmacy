/**
 * Ürün detay sayfası — /urun/[slug] rotası.
 * Ürün görseli, açıklama, fiyat, stok ve sepete ekle işlemleri.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProducts, getProductBySlug, formatPrice, calcDiscount } from "@/lib/products";
import ProductDetailClient from "@/components/product/ProductDetailClient";
import ProductReviews from "@/components/product/ProductReviews";

interface Props {
  params: Promise<{ slug: string }>;
}

// Statik sayfa üretimi için tüm slug'ları döndür
export async function generateStaticParams() {
  const products = getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

// Her ürün için dinamik meta veriler
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  return {
    title: `${product.name} | ${product.brand}`,
    description: `${product.brand} - ${product.name}. ${formatPrice(product.price)} fiyatıyla satın alın.`,
    openGraph: {
      title: product.name,
      description: `${product.brand} - ${formatPrice(product.price)}`,
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function UrunDetaySayfasi({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  // Ürün bulunamazsa 404 sayfası
  if (!product) {
    notFound();
  }

  const discountRate = calcDiscount(product.price, product.marketPrice);

  return (
    <div className="container-custom py-8">
      {/* Breadcrumb navigasyonu */}
      <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
        <a href="/" style={{ color: "var(--color-primary)" }}>Anasayfa</a>
        <span>/</span>
        <a href={`/kategori/${product.categorySlug}`} style={{ color: "var(--color-primary)" }}>
          {product.category}
        </a>
        <span>/</span>
        <span className="line-clamp-1">{product.name}</span>
      </nav>

      {/* İstemci taraflı ürün detay bileşeni */}
      <ProductDetailClient product={product} discountRate={discountRate} />

      {/* Ürün açıklaması */}
      <div
        className="card mt-8"
        style={{ padding: "32px" }}
      >
        <h2 className="text-xl font-bold mb-4">Ürün Bilgileri</h2>
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            color: "var(--color-text-muted)",
            fontSize: "14px",
          }}
        >
          {product.brand && (
            <div>
              <span className="font-semibold" style={{ color: "var(--color-text)" }}>Marka: </span>
              {product.brand}
            </div>
          )}
          {product.barcode && (
            <div>
              <span className="font-semibold" style={{ color: "var(--color-text)" }}>Barkod: </span>
              {product.barcode}
            </div>
          )}
          <div>
            <span className="font-semibold" style={{ color: "var(--color-text)" }}>KDV Oranı: </span>
            %{product.vatRate}
          </div>
          <div>
            <span className="font-semibold" style={{ color: "var(--color-text)" }}>Stok Durumu: </span>
            {product.stock > 0 ? (
              <span style={{ color: "var(--color-primary)" }}>Stokta Var</span>
            ) : (
              <span style={{ color: "#ef4444" }}>Stokta Yok</span>
            )}
          </div>
        </div>

        {product.trendyolLink && (
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
            <a
              href={product.trendyolLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-primary)", fontSize: "13px" }}
            >
              Trendyol&apos;da görüntüle →
            </a>
          </div>
        )}
      </div>

      {/* Müşteri Yorumları */}
      <ProductReviews productSlug={slug} productId={product.id} />
    </div>
  );
}
