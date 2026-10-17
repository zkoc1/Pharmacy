/**
 * Marka sayfası — /marka/[slug] rotası.
 * Seçili markanın tüm ürünlerini listeler.
 * Google SEO, CollectionPage & ItemList JSON-LD ile optimize edilmiştir.
 */

import type { Metadata } from "next";
import { getAllBrands, getBrandBySlug, getProductsByBrand } from "@/lib/products";
import ProductGrid from "@/components/product/ProductGrid";
import { ShieldCheck, Truck, CheckCircle2 } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Tüm marka slug'larını statik olarak üret
export async function generateStaticParams() {
  const brands = await getAllBrands();
  return brands.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  const brandName = brand ? brand.name : slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const title = `${brandName} Ürünleri, En Uygun Fiyatları & İndirimleri - Satın Al | OnbSağlık`;
  const description = `Tüm orijinal ${brandName} ürünleri indirimli fiyatlar, %100 eczane güvencesi ve aynı gün kargo avantajıyla onbsaglik.com.tr'de! ${brandName} çeşitlerini inceleyin ve güvenle satın alın.`;

  return {
    title,
    description,
    keywords: [
      brandName,
      `${brandName} satın al`,
      `${brandName} ürünleri`,
      `${brandName} fiyatları`,
      `${brandName} eczane`,
      `${brandName} kampanya`,
      `${brandName} en ucuz`,
      `${brandName} kullananlar`,
      `${brandName} orijinal`,
      "online eczane siparişi",
      "hızlı kargo",
      "dermatolojik bakım"
    ],
    alternates: {
      canonical: `https://www.onbsaglik.com.tr/marka/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.onbsaglik.com.tr/marka/${slug}`,
      siteName: "OnbSağlık",
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function MarkaSayfasi({ params }: Props) {
  const { slug } = await params;

  let brand = await getBrandBySlug(slug);
  if (!brand) {
    brand = {
      id: 9999,
      name: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      slug: slug
    };
  }

  const products = await getProductsByBrand(slug);

  // Google Schema.org CollectionPage & ItemList JSON-LD
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${brand.name} Ürünleri ve Fiyatları`,
    description: `${brand.name} marka tüm orijinal eczane ürünleri OnbSağlık'ta.`,
    url: `https://www.onbsaglik.com.tr/marka/${brand.slug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `https://www.onbsaglik.com.tr/urun/${p.slug}`,
        name: p.name,
      }))
    }
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Anasayfa",
        item: "https://www.onbsaglik.com.tr"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Markalar",
        item: "https://www.onbsaglik.com.tr/urunler"
      },
      {
        "@type": "ListItem",
        position: 3,
        name: brand.name,
        item: `https://www.onbsaglik.com.tr/marka/${brand.slug}`
      }
    ]
  };

  return (
    <div className="container-custom py-8">
      {/* Schema.org Yapısal Verileri */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap" style={{ color: "var(--color-text-muted)" }}>
        <a href="/" style={{ color: "var(--color-primary)" }} className="hover:underline">Anasayfa</a>
        <span>/</span>
        <a href="/urunler" style={{ color: "var(--color-primary)" }} className="hover:underline">Markalar</a>
        <span>/</span>
        <span className="font-semibold text-gray-800">{brand.name}</span>
      </nav>

      {/* Marka başlığı & SEO Banner */}
      <div
        className="card mb-8 p-8 rounded-3xl text-white text-center shadow-lg relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)",
        }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-100 text-xs font-bold mb-3">
          <ShieldCheck size={14} /> %100 Orijinal Ecza Deposu Garantisi
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold mb-3 tracking-tight">
          {brand.name} Ürünleri, Fiyatları & İndirimleri
        </h1>
        <p className="text-white/90 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          En çok satan <strong>{brand.name}</strong> ürünlerini orijinal eczane güvencesi, avantajlı fiyatlar ve aynı gün kargo imkanıyla keşfedin.
        </p>
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-white/80">
          <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-300" /> {products.length} Farklı Ürün</span>
          <span className="flex items-center gap-1.5"><Truck size={14} className="text-emerald-300" /> Hızlı Kargo</span>
        </div>
      </div>

      {/* Ürün grid'i */}
      <ProductGrid products={products} />
    </div>
  );
}
