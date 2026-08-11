/**
 * Arama sayfası — /ara?q=... rotası.
 * Ürün adı, marka ve kategoride tam metin arama yapar.
 */

import type { Metadata } from "next";
import { filterProducts } from "@/lib/products";
import ProductGrid from "@/components/product/ProductGrid";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export const metadata: Metadata = {
  title: "Arama Sonuçları | OnbSağlık",
};

export default async function AramaSayfasi({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const { products, total } = filterProducts({
    search: query,
    limit: 48,
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
