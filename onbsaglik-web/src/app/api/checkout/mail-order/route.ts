/**
 * Mail Order Yetkilendirme ve Sipariş Kayıt API — POST /api/checkout/mail-order
 * Eczane / Medikal Mail Order ile güvenli sipariş başlatma ve yetkilendirme logu.
 */

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { total, items, cardHolder, cardLast4, customerInfo, authorizationConsent } = body;

    if (!total || !items || items.length === 0) {
      return NextResponse.json({ error: "Sipariş ürün veya tutar bilgisi eksik." }, { status: 400 });
    }

    if (!authorizationConsent) {
      return NextResponse.json({ error: "Mail Order yetkilendirme onayı zorunludur." }, { status: 400 });
    }

    const orderId = `MO-${Date.now().toString().slice(-6)}`;
    const authCode = `AUTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Güvenlik: Kart numarası ASLA tam olarak loglanmaz veya kaydedilmez, sadece son 4 hane ve referans tutulur (PCI-DSS)
    console.log(`[Mail Order] Yeni yetkilendirme: Sipariş #${orderId}, Tutar: ${total} TL, Kart: **** ${cardLast4}, Onay Kodu: ${authCode}`);

    return NextResponse.json({
      success: true,
      orderId,
      authCode,
      message: "Mail Order yetkilendirme talebi başarıyla alındı.",
    });
  } catch (err) {
    console.error("[Mail Order API Hata]", err);
    return NextResponse.json({ error: "Mail Order işlemi başlatılamadı." }, { status: 500 });
  }
}
