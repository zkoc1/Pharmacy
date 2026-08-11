/**
 * Admin Ürün Güncelleme API — PATCH /api/admin/products/[id]
 * Belirli ürünün fiyat, stok ve durum bilgisini günceller.
 * Şu an in-memory — Faz 2'de PostgreSQL API çağrısına dönüşecek.
 */

import { NextResponse } from "next/server";

interface UpdateBody {
  price?: number;
  stock?: number;
  status?: "active" | "draft";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body: UpdateBody = await request.json();

  // Doğrulama: en az bir alan gerekli
  if (!body.price && !body.stock && !body.status) {
    return NextResponse.json(
      { success: false, error: "Güncellenecek alan belirtilmedi." },
      { status: 400 }
    );
  }

  // Fiyat negatif olamaz
  if (body.price !== undefined && body.price < 0) {
    return NextResponse.json(
      { success: false, error: "Fiyat negatif olamaz." },
      { status: 400 }
    );
  }

  // Stok negatif olamaz
  if (body.stock !== undefined && body.stock < 0) {
    return NextResponse.json(
      { success: false, error: "Stok negatif olamaz." },
      { status: 400 }
    );
  }

  // Başarılı güncelleme yanıtı (gerçek DB update Faz 2'de eklenecek)
  return NextResponse.json({
    success: true,
    message: `Ürün #${id} güncellendi.`,
    updated: { id: Number(id), ...body },
  });
}
