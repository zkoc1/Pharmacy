/**
 * Kategori sayfası — /kategori/[slug] rotası.
 * Kategori ürünlerini filtreli ve sıralı gösterir.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllCategories, getCategoryBySlug, filterProducts } from "@/lib/products";
import ProductGrid from "@/components/product/ProductGrid";
import type { ProductFilter } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

// Tüm kategori slug'larını statik olarak üret
export async function generateStaticParams() {
  const categories = getAllCategories();
  const slugs: { slug: string }[] = [];
  categories.forEach((cat) => {
    slugs.push({ slug: cat.slug });
    cat.children?.forEach((child) => slugs.push({ slug: child.slug }));
  });
  return slugs;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categories = getAllCategories();
  const cat =
    getCategoryBySlug(slug) ||
    categories.flatMap((c) => c.children ?? []).find((c) => c.slug === slug);

  if (!cat) return {};
  return {
    title: `${cat.name} | OnbSağlık`,
    description: `${cat.name} kategorisindeki ürünleri inceleyin. En uygun fiyatlar OnbSağlık'ta.`,
  };
}

export default async function KategoriSayfasi({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const categories = getAllCategories();
  const category =
    getCategoryBySlug(slug) ||
    categories.flatMap((c) => c.children ?? []).find((c) => c.slug === slug);

  if (!category) notFound();

  // URL parametrelerinden filtre oluştur
  const filter: ProductFilter = {
    categorySlug: slug,
    sortBy: (sp.siralama as ProductFilter["sortBy"]) || undefined,
    minPrice: sp.min ? Number(sp.min) : undefined,
    maxPrice: sp.max ? Number(sp.max) : undefined,
    page: sp.sayfa ? Number(sp.sayfa) : 1,
    limit: 24,
  };

  const { products, total } = filterProducts(filter);

  return (
    <div className="container-custom py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
        <a href="/" style={{ color: "var(--color-primary)" }}>Anasayfa</a>
        <span>/</span>
        <span>{category.name}</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginTop: "4px" }}>
            {total} ürün bulundu
          </p>
        </div>

        {/* Sıralama seçici */}
        <form>
          <select
            name="siralama"
            defaultValue={sp.siralama || ""}
            onChange={(e) => {
              const url = new URL(window.location.href);
              url.searchParams.set("siralama", e.target.value);
              window.location.href = url.toString();
            }}
            style={{
              padding: "8px 12px",
              border: "2px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "14px",
              background: "white",
              cursor: "pointer",
            }}
          >
            <option value="">Önerilen Sıralama</option>
            <option value="price_asc">Fiyat: Artan</option>
            <option value="price_desc">Fiyat: Azalan</option>
            <option value="name_asc">A-Z</option>
          </select>
        </form>
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
