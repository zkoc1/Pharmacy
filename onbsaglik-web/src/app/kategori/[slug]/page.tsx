/**
 * Kategori sayfası — /kategori/[slug] rotası.
 * Kategori ürünlerini filtreli ve sıralı gösterir.
 * Google SEO, CollectionPage & ItemList JSON-LD ile zenginleştirilmiştir.
 */

import type { Metadata } from "next";
import { getAllCategories, getCategoryBySlug, filterProducts } from "@/lib/products";
import ProductGrid from "@/components/product/ProductGrid";
import SortSelect from "@/components/product/SortSelect";
import type { ProductFilter } from "@/types";
import { ShieldCheck } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

// Tüm kategori slug'larını statik olarak üret
export async function generateStaticParams() {
  const categories = await getAllCategories();
  const slugs: { slug: string }[] = [];
  categories.forEach((cat) => {
    slugs.push({ slug: cat.slug });
    cat.children?.forEach((child) => slugs.push({ slug: child.slug }));
  });
  return slugs;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getAllCategories();
  const cat =
    (await getCategoryBySlug(slug)) ||
    categories.flatMap((c) => c.children ?? []).find((c) => c.slug === slug);

  const catName = cat ? cat.name : slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const title = `${catName} Çeşitleri, En Uygun Fiyatlar & Satın Al | OnbSağlık`;
  const description = `Orijinal ${catName} ürünleri indirimli fiyatlar, %100 eczane güvencesi ve aynı gün kargo fırsatıyla onbsaglik.com.tr'de! Kampanyalı ${catName} çeşitlerini inceleyin, güvenle satın alın.`;

  return {
    title,
    description,
    keywords: [
      catName,
      `${catName} satın al`,
      `${catName} fiyatları`,
      `${catName} çeşitleri`,
      `${catName} eczane`,
      `${catName} tavsiye`,
      `${catName} en ucuz`,
      "orijinal eczane ürünleri",
      "hızlı kargo",
      "sağlık takviyeleri"
    ],
    alternates: {
      canonical: `https://onbsaglik.com.tr/kategori/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://onbsaglik.com.tr/kategori/${slug}`,
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

export default async function KategoriSayfasi({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const categories = await getAllCategories();
  let category =
    (await getCategoryBySlug(slug)) ||
    categories.flatMap((c) => c.children ?? []).find((c) => c.slug === slug);

  if (!category) {
    category = {
      id: 9999,
      name: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      slug: slug
    };
  }

  // URL parametrelerinden filtre oluştur
  const filter: ProductFilter = {
    categorySlug: slug,
    sortBy: (sp.siralama as ProductFilter["sortBy"]) || undefined,
    minPrice: sp.min ? Number(sp.min) : undefined,
    maxPrice: sp.max ? Number(sp.max) : undefined,
    page: sp.sayfa ? Number(sp.sayfa) : 1,
    limit: 24,
    search: typeof sp.sub === 'string' && sp.sub !== 'Tüm Ürünler' ? sp.sub : undefined,
  };

  const { products, total } = await filterProducts(filter);

  // Google Schema.org CollectionPage & ItemList JSON-LD
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} Ürünleri ve Çeşitleri`,
    description: `${category.name} kategorisindeki tüm orijinal ürünler en avantajlı fiyatlarla OnbSağlık'ta.`,
    url: `https://onbsaglik.com.tr/kategori/${category.slug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `https://onbsaglik.com.tr/urun/${p.slug}`,
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
        item: "https://onbsaglik.com.tr"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category.name,
        item: `https://onbsaglik.com.tr/kategori/${category.slug}`
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
        <span className="font-semibold text-gray-800">{category.name}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            {category.name} <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Eczane Garantili</span>
          </h1>
          <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginTop: "4px" }}>
            Toplam <strong>{total}</strong> orijinal ürün listeleniyor
          </p>
        </div>

        {/* Sıralama seçici istemci bileşeni */}
        <SortSelect defaultValue={sp.siralama} />
      </div>

      {/* Ürün grid'i */}
      <ProductGrid products={products} />

      {/* Sayfalama — basit */}
      {total > 24 && (
        <div className="flex justify-center mt-10 gap-2">
          {Array.from({ length: Math.ceil(total / 24) }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?sayfa=${p}`}
              style={{
                padding: "8px 14px",
                border: "2px solid",
                borderColor: Number(sp.sayfa || 1) === p ? "var(--color-primary)" : "var(--color-border)",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
                color: Number(sp.sayfa || 1) === p ? "var(--color-primary)" : "var(--color-text-muted)",
                textDecoration: "none",
                background: "white",
                fontSize: "14px",
              }}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
