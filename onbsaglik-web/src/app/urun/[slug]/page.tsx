/**
 * Ürün detay sayfası — /urun/[slug] rotası.
 * Ürün görseli, açıklama, fiyat, stok ve sepete ekle işlemleri.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProducts, getProductBySlug, formatPrice, calcDiscount } from "@/lib/products";
import ProductDetailClient from "@/components/product/ProductDetailClient";
import ProductTabs from "@/components/product/ProductTabs";
import ProductReviews from "@/components/product/ProductReviews";

interface Props {
  params: Promise<{ slug: string }>;
}

// Statik sayfa üretimi için tüm slug'ları döndür
export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

// Her ürün için dinamik meta veriler
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
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
  const product = await getProductBySlug(slug);

  // Ürün bulunamazsa 404 sayfası
  if (!product) {
    notFound();
  }

  const discountRate = calcDiscount(product.price, product.marketPrice);

  // Google Schema.org Product Rich Snippet (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: `${product.brand} marka ${product.name} en uygun fiyat ve hızlı kargo avantajıyla onbsaglik.com'da!`,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    sku: product.barcode || `ONB-${product.id}`,
    offers: {
      "@type": "Offer",
      url: `https://onbsaglik.com/urun/${product.slug}`,
      priceCurrency: "TRY",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "OnbSağlık",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "28",
    },
  };

  return (
    <div className="container-custom py-8">
      {/* Google SEO JSON-LD Yapısal Veri */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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

      {/* İstemci taraflı detaylı ürün sekmeleri */}
      <ProductTabs product={product} />

      {/* Müşteri Yorumları */}
      <ProductReviews productSlug={slug} productId={product.id} />
    </div>
  );
}
