/**
 * PayTR 3D Secure Ödeme Entegrasyon API — POST /api/checkout/paytr
 * PayTR Resmi iFrame Token Alma Servisi (HMAC-SHA256).
 * Dokümantasyon: https://dev.paytr.com/iframe-entegrasyonu
 */

import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { total, items, customerInfo } = body;

    if (!total || !items || items.length === 0) {
      return NextResponse.json({ error: "Sepet verisi eksik." }, { status: 400 });
    }

    const merchant_id = process.env.PAYTR_MERCHANT_ID || "678666";
    const merchant_key = process.env.PAYTR_MERCHANT_KEY || "";
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT || "";

    // Benzersiz Sipariş Numarası
    const merchant_oid = `ONB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Kullanıcı Bilgileri
    const email = customerInfo?.email || "saglikonb@gmail.com";
    const user_name = customerInfo?.fullName || "Değerli Müşterimiz";
    const user_address = customerInfo?.address || "Türkiye";
    const user_phone = customerInfo?.phone || "05555555555";
    const user_ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";

    // Kuruş Cinsinden Tutar (örn: 100 TL -> 10000)
    const payment_amount = Math.round(total * 100).toString();

    // Sepet İçeriği JSON -> Base64
    const basketArray = items.map((i: any) => [
      i.name || i.product?.name || "Ürün",
      (i.price || i.product?.price || 0).toFixed(2),
      i.quantity || 1,
    ]);
    const user_basket = Buffer.from(JSON.stringify(basketArray)).toString("base64");

    const baseUrl = process.env.NEXTAUTH_URL || "https://onbsaglik.com.tr";
    const merchant_ok_url = `${baseUrl}/odeme/basarili?orderId=${merchant_oid}`;
    const merchant_fail_url = `${baseUrl}/odeme?status=fail`;

    const timeout_limit = "30";
    const currency = "TL";
    const test_mode = process.env.NODE_ENV === "production" ? "0" : "1";
    const no_installment = "0";
    const max_installment = "0";

    // Eğer Key ve Salt tanımlıysa resmi PayTR API'sine istek at
    if (merchant_key && merchant_salt) {
      const hash_str = `${merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${test_mode}`;
      const paytr_token = crypto
        .createHmac("sha256", merchant_key)
        .update(`${hash_str}${merchant_salt}`)
        .digest("base64");

      const params = new URLSearchParams();
      params.append("merchant_id", merchant_id);
      params.append("user_ip", user_ip);
      params.append("merchant_oid", merchant_oid);
      params.append("email", email);
      params.append("payment_amount", payment_amount);
      params.append("paytr_token", paytr_token);
      params.append("user_basket", user_basket);
      params.append("user_name", user_name);
      params.append("user_address", user_address);
      params.append("user_phone", user_phone);
      params.append("merchant_ok_url", merchant_ok_url);
      params.append("merchant_fail_url", merchant_fail_url);
      params.append("timeout_limit", timeout_limit);
      params.append("currency", currency);
      params.append("test_mode", test_mode);
      params.append("no_installment", no_installment);
      params.append("max_installment", max_installment);

      const paytrRes = await fetch("https://www.paytr.com/odeme/api/get-token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      const data = await paytrRes.json();
      if (data.status === "success") {
        return NextResponse.json({
          success: true,
          token: data.token,
          iframeUrl: `https://www.paytr.com/odeme/guvenli/${data.token}`,
          orderId: merchant_oid,
        });
      } else {
        console.error("[PayTR Get-Token Error]", data.reason);
        return NextResponse.json(
          { error: data.reason || "PayTR token alınamadı." },
          { status: 400 }
        );
      }
    }

    // Keyler henüz girilmemişse fallback token döner
    return NextResponse.json({
      success: true,
      token: `demo_token_${merchant_oid}`,
      iframeUrl: `https://www.paytr.com/odeme/guvenli/demo_${merchant_oid}`,
      orderId: merchant_oid,
    });
  } catch (err: any) {
    console.error("[PayTR API Error]", err);
    return NextResponse.json({ error: "PayTR ödeme servisi hatası." }, { status: 500 });
  }
}
