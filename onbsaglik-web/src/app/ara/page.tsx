/**
 * Arama sayfası — /ara?q=... rotası.
 * Ürün adı, marka ve kategoride tam metin arama yapar.
 */

import type { Metadata } from "next";
import { filterProducts } from "@/lib/products";
import ProductGrid from "@/components/product/ProductGrid";
import type { ProductFilter } from "@/types";

interface Props {
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>;
}

export const metadata: Metadata = {
  title: "Arama Sonuçları | OnbSağlık",
};

export default async function SearchPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const query = q.trim();
  const page = parseInt(resolvedParams.page || "1", 10);
  const sort = (resolvedParams.sort as ProductFilter["sortBy"]) || "price_asc";

  const { products, total } = await filterProducts({
    search: query,
    page,
    limit: 24,
    sortBy: sort,
  });

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          {query ? `"${query}" için arama sonuçları` : "Arama"}
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginTop: "4px" }}>
          {query ? `${total} ürün bulundu` : "Bir şeyler arayın..."}
        </p>
      </div>

      {query ? (
        <ProductGrid products={products} />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "80px 20px",
            color: "var(--color-text-muted)",
            fontSize: "16px",
          }}
        >
          <span style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</span>
          <p>Arama kutusuna yazmaya başlayın</p>
        </div>
      )}
    </div>
  );
}
