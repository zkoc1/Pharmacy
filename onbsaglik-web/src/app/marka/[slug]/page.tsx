/**
 * Marka sayfası — /marka/[slug] rotası.
 * Seçili markanın tüm ürünlerini listeler.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllBrands, getBrandBySlug, getProductsByBrand } from "@/lib/products";
import ProductGrid from "@/components/product/ProductGrid";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBrands().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) return {};
  return {
    title: `${brand.name} Ürünleri | OnbSağlık`,
    description: `${brand.name} markasına ait tüm ürünler. OnbSağlık'ta en uygun fiyatlarla.`,
  };
}

export default async function MarkaSayfasi({ params }: Props) {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) notFound();

  const products = getProductsByBrand(slug);

  return (
    <div className="container-custom py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
        <a href="/" style={{ color: "var(--color-primary)" }}>Anasayfa</a>
        <span>/</span>
        <span>Markalar</span>
        <span>/</span>
        <span>{brand.name}</span>
      </nav>

      {/* Marka başlığı */}
      <div
        className="card mb-8"
        style={{
          padding: "32px",
          background: "var(--gradient-hero)",
          color: "white",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>
          {brand.name}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.8)" }}>
          {products.length} ürün
        </p>
      </div>

      {/* Ürün grid'i */}
      <ProductGrid products={products} />
    </div>
  );
}
