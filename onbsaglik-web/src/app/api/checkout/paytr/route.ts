/**
 * PayTR Ödeme Entegrasyon API — POST /api/checkout/paytr
 * PayTR 256-bit SSL Sanal POS ödeme token'ı ve ödeme başlatma servisi.
 */

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { total, items, customerInfo } = body;

    if (!total || !items || items.length === 0) {
      return NextResponse.json({ error: "Sepet verisi eksik." }, { status: 400 });
    }

    // PayTR Sandbox & Production Yapılandırması
    const merchantId = process.env.PAYTR_MERCHANT_ID || "312940";
    const merchantKey = process.env.PAYTR_MERCHANT_KEY || "sandbox_key";
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT || "sandbox_salt";

    // Demo iframe token yanıtı (PayTR iframe URL)
    const orderId = `PAYTR-${Date.now()}`;
    
    return NextResponse.json({
      success: true,
      token: `paytr_token_${orderId}`,
      iframeUrl: `https://www.paytr.com/iframe/token/${orderId}`,
      orderId,
    });
  } catch (err) {
    console.error("[PayTR API Hata]", err);
    return NextResponse.json({ error: "PayTR ödeme başlatılamadı." }, { status: 500 });
  }
}
