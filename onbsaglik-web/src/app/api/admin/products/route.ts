/**
 * Admin Ürün API — GET /api/admin/products
 * Tüm ürünleri (aktif + taslak) JSON olarak döndürür.
 * İleride PostgreSQL'e geçildiğinde sadece bu dosya değişecek.
 */

import { NextResponse } from "next/server";
import productsData from "@/data/products.json";
import type { Product } from "@/types";

export async function GET() {
  // Tüm ürünleri döndür (admin taslakları da görür)
  const products = productsData as Product[];
  return NextResponse.json(products);
}
