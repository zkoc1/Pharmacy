/**
 * Ürün arama API — GET /api/search?q=...
 * Anlık arama için kullanılır (Header SearchBar'dan çağrılır).
 * Sonuçlar: ürün adı, marka adı ve kategori adında eşleşme arar.
 */

import { NextResponse } from "next/server";
import { filterProducts } from "@/lib/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";

  if (!query || query.length < 2) {
    return NextResponse.json({ products: [], total: 0 });
  }

  const { products, total } = filterProducts({
    search: query,
    limit: 10, // Anlık arama için max 10 sonuç
  });

  // Arama sonuçlarında sadece gerekli alanları döndür (performans)
  const slim = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    price: p.price,
    image: p.images[0] ?? null,
    categorySlug: p.categorySlug,
  }));

  return NextResponse.json({ products: slim, total });
}
