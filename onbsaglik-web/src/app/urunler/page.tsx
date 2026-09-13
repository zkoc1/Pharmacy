/**
 * Tüm ürünler sayfası — /urunler rotası.
 * Filtreleme ve sıralama ile tüm katalog.
 */

import type { Metadata } from "next";
import { filterProducts } from "@/lib/products";
import ProductGrid from "@/components/product/ProductGrid";
import type { ProductFilter } from "@/types";

export const metadata: Metadata = {
  title: "Tüm Ürünler | OnbSağlık",
  description: "184 ürün, 63 marka. Vitamin, takviye, güneş kremi, saç ve cilt bakımı ürünleri.",
};

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function TumUrunler({ searchParams }: Props) {
  const sp = await searchParams;

  const filter: ProductFilter = {
    categorySlug: sp.kategori,
    brandSlug: sp.marka,
    sortBy: sp.siralama as ProductFilter["sortBy"],
    minPrice: sp.min ? Number(sp.min) : undefined,
    maxPrice: sp.max ? Number(sp.max) : undefined,
    page: sp.sayfa ? Number(sp.sayfa) : 1,
    limit: 24,
  };

  const { products, total } = await filterProducts(filter);
  const totalPages = Math.ceil(total / 24);

  const { getAllCategories, getAllBrands } = await import("@/lib/products");
  const categories = await getAllCategories();
  const brands = await getAllBrands();

  return (
    <div className="container-custom py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sol Menü - Filtreler */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-gray-900 border-b pb-2">Kategoriler</h3>
            <ul className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              <li>
                <a href="/urunler" className={`block text-sm py-1 transition-colors ${!sp.kategori ? 'font-bold text-emerald-600' : 'text-gray-600 hover:text-emerald-500'}`}>
                  Tüm Ürünler
                </a>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <a 
                    href={`/urunler?kategori=${cat.slug}${sp.marka ? `&marka=${sp.marka}` : ''}${sp.siralama ? `&siralama=${sp.siralama}` : ''}`} 
                    className={`block text-sm py-1 transition-colors ${sp.kategori === cat.slug ? 'font-bold text-emerald-600' : 'text-gray-600 hover:text-emerald-500'}`}
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-gray-900 border-b pb-2">Markalar</h3>
            <ul className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              <li>
                <a href="/urunler" className={`block text-sm py-1 transition-colors ${!sp.marka ? 'font-bold text-emerald-600' : 'text-gray-600 hover:text-emerald-500'}`}>
                  Tüm Markalar
                </a>
              </li>
              {brands.map((brand) => (
                <li key={brand.id}>
                  <a 
                    href={`/urunler?marka=${brand.slug}${sp.kategori ? `&kategori=${sp.kategori}` : ''}${sp.siralama ? `&siralama=${sp.siralama}` : ''}`} 
                    className={`block text-sm py-1 transition-colors ${sp.marka === brand.slug ? 'font-bold text-emerald-600' : 'text-gray-600 hover:text-emerald-500'}`}
                  >
                    {brand.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Sağ Taraf - İçerik */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Tüm Ürünler</h1>
              <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                {total} ürün listeleniyor
              </p>
            </div>

            {/* Sıralama */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { label: "Önerilen", value: "" },
                { label: "Ucuzdan Pahalıya", value: "price_asc" },
                { label: "Pahalıdan Ucuza", value: "price_desc" },
                { label: "A-Z", value: "name_asc" },
              ].map((s) => (
                <a
                  key={s.value}
                  href={s.value ? `?siralama=${s.value}${sp.kategori ? `&kategori=${sp.kategori}` : ''}${sp.marka ? `&marka=${sp.marka}` : ''}` : `?${sp.kategori ? `kategori=${sp.kategori}&` : ''}${sp.marka ? `marka=${sp.marka}` : ''}`}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "2px solid",
                    borderColor: sp.siralama === s.value || (!sp.siralama && !s.value) ? "var(--color-primary)" : "var(--color-border)",
                    background: sp.siralama === s.value || (!sp.siralama && !s.value) ? "var(--color-primary)" : "white",
                    color: sp.siralama === s.value || (!sp.siralama && !s.value) ? "white" : "var(--color-text-muted)",
                    fontSize: "12px",
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "var(--transition)",
                  }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <ProductGrid products={products} />

          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-10 gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const isActive = Number(sp.sayfa || 1) === p;
                return (
                  <a
                    key={p}
                    href={`?sayfa=${p}${sp.siralama ? `&siralama=${sp.siralama}` : ""}${sp.kategori ? `&kategori=${sp.kategori}` : ''}${sp.marka ? `&marka=${sp.marka}` : ''}`}
                    style={{
                      padding: "8px 14px",
                      border: "2px solid",
                      borderColor: isActive ? "var(--color-primary)" : "var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                      fontWeight: 600,
                      color: isActive ? "white" : "var(--color-text-muted)",
                      background: isActive ? "var(--color-primary)" : "white",
                      textDecoration: "none",
                      fontSize: "14px",
                      transition: "var(--transition)",
                    }}
                  >
                    {p}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
