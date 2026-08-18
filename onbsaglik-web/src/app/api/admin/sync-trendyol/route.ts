/**
 * Trendyol Stok Senkronizasyon API — GET /api/admin/sync-trendyol
 * Trendyol Seller API ile ürün stok/fiyat güncellemesi.
 *
 * Kurulum:
 * 1. Trendyol Satıcı Paneli → Entegrasyon → API Bilgileri'nden:
 *    - TRENDYOL_API_KEY (Kullanıcı adı)
 *    - TRENDYOL_API_SECRET (Şifre)
 *    - TRENDYOL_SUPPLIER_ID (Tedarikçi ID)
 *
 * Belge: https://developers.trendyol.com/
 */

import { NextResponse } from "next/server";
import products from "@/data/products.json";

// Trendyol API base URL
const TRENDYOL_BASE = "https://api.trendyol.com/sapigw";

interface TrendyolProduct {
  barcode: string;
  stockCode: string;
  quantity: number;
  salePrice: number;
  listPrice: number;
}

interface TrendyolApiResponse {
  content?: TrendyolProduct[];
  totalElements?: number;
}

export async function GET() {
  const apiKey      = process.env.TRENDYOL_API_KEY;
  const apiSecret   = process.env.TRENDYOL_API_SECRET;
  const supplierId  = process.env.TRENDYOL_SUPPLIER_ID;

  // API bilgileri yoksa kurulum talimatını döndür
  if (!apiKey || !apiSecret || !supplierId) {
    return NextResponse.json({
      success: false,
      message: "Trendyol API bilgileri eksik.",
      setup: {
        adim1: "Trendyol Satıcı Paneli → Entegrasyon → API Bilgileri'ne gidin",
        adim2: ".env dosyasına TRENDYOL_API_KEY, TRENDYOL_API_SECRET, TRENDYOL_SUPPLIER_ID ekleyin",
        adim3: "Bu endpoint'i tekrar çağırın",
      },
    });
  }

  try {
    // Trendyol'dan mevcut ürünleri çek (barcode bazlı eşleme)
    const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const headers = {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
      "User-Agent": `${supplierId} - SelfIntegration`,
    };

    const res = await fetch(
      `${TRENDYOL_BASE}/suppliers/${supplierId}/products?approved=true&size=200`,
      { headers }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Trendyol API hatası: ${res.status}` },
        { status: 500 }
      );
    }

    const data: TrendyolApiResponse = await res.json();
    const trendyolItems = data.content ?? [];

    // Barcode ile eşleştirip güncel stok/fiyat bilgisi oluştur
    const updates: { barcode: string; localProduct: string; trendyolStock: number; trendyolPrice: number }[] = [];

    for (const local of products) {
      if (!local.barcode) continue;
      const match = trendyolItems.find((t) => t.barcode === local.barcode);
      if (match) {
        updates.push({
          barcode: local.barcode,
          localProduct: local.name,
          trendyolStock: match.quantity,
          trendyolPrice: match.salePrice,
        });
      }
    }

    return NextResponse.json({
      success: true,
      synced: updates.length,
      totalTrendyol: trendyolItems.length,
      updates,
      note: "Stok/fiyat güncellemesi için Supabase entegrasyonu sonrası otomatik yazma eklenecek.",
    });

  } catch (err) {
    console.error("[sync-trendyol]", err);
    return NextResponse.json({ error: "Senkronizasyon hatası" }, { status: 500 });
  }
}

// Trendyol'a stok güncelleme gönder — POST
export async function POST(req: Request) {
  const apiKey     = process.env.TRENDYOL_API_KEY;
  const apiSecret  = process.env.TRENDYOL_API_SECRET;
  const supplierId = process.env.TRENDYOL_SUPPLIER_ID;

  if (!apiKey || !apiSecret || !supplierId) {
    return NextResponse.json({ error: "Trendyol API bilgileri eksik." }, { status: 400 });
  }

  const body = await req.json() as { items: { barcode: string; quantity: number; salePrice: number; listPrice: number }[] };

  if (!body.items?.length) {
    return NextResponse.json({ error: "Güncellenecek ürün yok." }, { status: 400 });
  }

  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  const res = await fetch(
    `${TRENDYOL_BASE}/suppliers/${supplierId}/products/price-and-inventory`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        "User-Agent": `${supplierId} - SelfIntegration`,
      },
      body: JSON.stringify({ items: body.items }),
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: `Trendyol güncelleme hatası: ${res.status}` }, { status: 500 });
  }

  const result = await res.json();
  return NextResponse.json({ success: true, batchId: result.batchId });
}
