/**
 * PayTR Ödeme Başlatma API — POST /api/checkout
 * PayTR iframe entegrasyonu — sandbox ve canlı mod destekli.
 * Belgeler: https://dev.paytr.com/iframe-api
 *
 * Merchant Bilgileri (env'den okunur):
 *   PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY, PAYTR_MERCHANT_SALT
 */

import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      items,
      buyer,
      total,
    }: {
      items: { id: number; name: string; price: number; quantity: number }[];
      buyer: { name: string; surname: string; email: string; phone: string; address: string; city: string };
      total: number;
    } = body;

    // Zorunlu alan kontrolü
    if (!items?.length || !buyer?.email || !total) {
      return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
    }

    const merchantId   = process.env.PAYTR_MERCHANT_ID   ?? "678666";
    const merchantKey  = process.env.PAYTR_MERCHANT_KEY  ?? "";
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT ?? "";

    if (!merchantKey || !merchantSalt) {
      // Geliştirme modunda test verileriyle devam et
      console.warn("[PayTR] Merchant key eksik — test modunda çalışıyor.");
    }

    // Sepet ürünlerini PayTR formatına çevir [[isim, fiyat_kuruş, adet], ...]
    const basket = items.map((item) => [
      item.name.substring(0, 60),
      String(Math.round(item.price * 100)), // Kuruş cinsinden
      String(item.quantity),
    ]);
    const basketEncoded = Buffer.from(JSON.stringify(basket)).toString("base64");

    const totalKurus   = Math.round(total * 100); // Kuruş cinsinden toplam
    const orderId      = `ONB-${Date.now()}`;
    const siteUrl      = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const callbackUrl  = `${siteUrl}/api/checkout/callback`;
    const currency     = "TL";
    const testMode     = process.env.NODE_ENV !== "production" ? "1" : "0";
    const noInstallment= "1"; // Taksit kapatık
    const maxInstallment = "0";
    const lang         = "tr";
    const userIp       = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";
    const userEmail    = buyer.email;
    const userPhone    = buyer.phone.replace(/\D/g, ""); // Sadece rakam
    const userName     = `${buyer.name} ${buyer.surname}`;
    const userAddress  = buyer.address;

    // PayTR token hash hesaplama
    // Sıra: merchant_id + user_ip + merchant_oid + email + payment_amount + currency + test_mode + no_installment + max_installment + user_basket + merchant_salt
    const hashStr = [
      merchantId, userIp, orderId, userEmail,
      totalKurus, basketEncoded, noInstallment, maxInstallment, currency, testMode
    ].join("");

    const hmacStr    = hashStr + merchantSalt;
    const paytrToken = crypto
      .createHmac("sha256", merchantKey)
      .update(hmacStr)
      .digest("base64");

    // PayTR API'ye iframe token isteği gönder
    const formData = new URLSearchParams();
    formData.append("merchant_id",      merchantId);
    formData.append("user_ip",          userIp);
    formData.append("merchant_oid",     orderId);
    formData.append("email",            userEmail);
    formData.append("payment_amount",   String(totalKurus));
    formData.append("paytr_token",      paytrToken);
    formData.append("user_basket",      basketEncoded);
    formData.append("debug_on",         testMode === "1" ? "1" : "0");
    formData.append("no_installment",   noInstallment);
    formData.append("max_installment",  maxInstallment);
    formData.append("user_name",        userName);
    formData.append("user_address",     userAddress);
    formData.append("user_phone",       userPhone);
    formData.append("merchant_ok_url",  `${siteUrl}/odeme/basarili`);
    formData.append("merchant_fail_url",`${siteUrl}/odeme/basarisiz`);
    formData.append("timeout_limit",    "30");
    formData.append("currency",         currency);
    formData.append("test_mode",        testMode);
    formData.append("lang",             lang);

    const paytrRes = await fetch("https://www.paytr.com/odeme/api/get-token", {
      method: "POST",
      body: formData,
    });

    const paytrData = await paytrRes.json() as { status: string; token?: string; reason?: string };

    if (paytrData.status !== "success" || !paytrData.token) {
      console.error("[PayTR] Token alınamadı:", paytrData);
      return NextResponse.json(
        { error: paytrData.reason ?? "Ödeme başlatılamadı." },
        { status: 400 }
      );
    }

    // Başarılı — iframe token'ı frontend'e gönder
    return NextResponse.json({
      success: true,
      token: paytrData.token,
      orderId,
    });

  } catch (err) {
    console.error("[checkout] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
