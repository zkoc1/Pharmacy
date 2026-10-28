import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * HepsiJet Kargo Sipariş Entegrasyon Endpoint'i
 * 
 * Kullanım Şekli:
 * GET  /api/hepsijet/order?orderNumber=ONB-123456
 * POST /api/hepsijet/order { "orderNumber": "ONB-123456" }
 * 
 * HepsiJet personeli veya portalı sipariş numarasını girdiğinde,
 * siparişe ait alıcı, telefon, adres, il/ilçe ve paket bilgilerini
 * HepsiJet'e hazır formatta döner.
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("orderNumber") || searchParams.get("orderId") || searchParams.get("id");

  if (!orderNumber) {
    return NextResponse.json(
      { error: "Sipariş numarası eksik. (Örn: ?orderNumber=ONB-123456)" },
      { status: 400 }
    );
  }

  return await fetchOrderForHepsiJet(orderNumber.trim());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderNumber = body.orderNumber || body.orderId || body.id;

    if (!orderNumber) {
      return NextResponse.json(
        { error: "orderNumber parametresi gönderilmedi." },
        { status: 400 }
      );
    }

    return await fetchOrderForHepsiJet(String(orderNumber).trim());
  } catch (err: any) {
    return NextResponse.json({ error: "Geçersiz istek gövdesi" }, { status: 400 });
  }
}

async function fetchOrderForHepsiJet(orderNumber: string) {
  try {
    const supabase = getServiceSupabase();

    // Siparişi ve ürünlerini veritabanından bul
    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        items:order_items(*)
      `)
      .or(`id.eq.${orderNumber},invoice_no.eq.${orderNumber}`)
      .single();

    if (error || !order) {
      return NextResponse.json(
        {
          success: false,
          error: `Sipariş bulunamadı: ${orderNumber}`,
          orderNumber,
        },
        { status: 404 }
      );
    }

    // Adres içinden İl ve İlçe ayıklama yardımı
    const rawAddress = order.delivery_address || "";
    const addressParts = rawAddress.split("/").map((s: string) => s.trim());
    let city = "Kayseri";
    let district = "Merkez";
    let fullAddress = rawAddress;

    if (addressParts.length >= 2) {
      district = addressParts[addressParts.length - 2];
      city = addressParts[addressParts.length - 1];
    }

    const itemsCount = Array.isArray(order.items)
      ? order.items.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0)
      : 1;

    // Desi hesabı (minimum 1 desi)
    const calculatedDesi = Math.max(1, Math.min(itemsCount, 5));

    // HepsiJet standart kargo kayıt modeli
    const hepsiJetPayload = {
      success: true,
      orderNumber: order.id,
      invoiceNumber: order.invoice_no || order.id,
      customerOrderDate: order.created_at,
      recipient: {
        fullName: order.customer_name || "Müşteri",
        phone: (order.customer_phone || "").replace(/[^0-9]/g, ""),
        email: order.customer_email || "",
        address: fullAddress,
        city: city,
        district: district,
        country: "Türkiye",
      },
      package: {
        desi: calculatedDesi,
        weight: calculatedDesi * 0.4,
        packageCount: 1,
        contentDescription: "Dermokozmetik ve Gıda Takviyesi",
      },
      payment: {
        paymentType: order.payment_method === "kapida_odeme" ? "KAPIDA_ODEME" : "PESIN_ODENDI",
        collectAmount: order.payment_method === "kapida_odeme" ? Number(order.total) : 0,
        currency: "TRY",
        totalAmount: Number(order.total),
      },
      carrier: "HepsiJet",
      orderStatus: order.status,
      items: (order.items || []).map((it: any) => ({
        name: it.product_name || it.name,
        quantity: it.quantity || 1,
        unitPrice: Number(it.price || 0),
      })),
    };

    return NextResponse.json(hepsiJetPayload, { status: 200 });
  } catch (err: any) {
    console.error("[HepsiJet Order Fetch Error]:", err);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
