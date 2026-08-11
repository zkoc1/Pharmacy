/**
 * iyzico Geri Dönüş Callback — POST /api/checkout/callback
 * iyzico ödeme tamamlandıktan sonra bu endpoint'i çağırır.
 * Token doğrulanır, sipariş durumu güncellenir.
 */

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const token = formData.get("token") as string;
    const status = formData.get("status") as string;

    if (!token) {
      return NextResponse.json({ error: "Token eksik." }, { status: 400 });
    }

    const apiKey = process.env.IYZICO_API_KEY!;
    const secretKey = process.env.IYZICO_SECRET_KEY!;
    const baseUrl = process.env.IYZICO_BASE_URL!;

    // Token ile ödeme sonucunu doğrula
    const verifyRes = await fetch(`${baseUrl}/payment/iyzipos/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: "tr", token, apiKey, secretKey }),
    });

    const result = await verifyRes.json();

    if (result.status === "success" && result.paymentStatus === "SUCCESS") {
      // Sipariş başarılı — NestJS API'ye bildir (Faz 2'de aktif)
      // await fetch(`${process.env.API_URL}/api/v1/orders/paid`, { method: 'POST', body: JSON.stringify({ token }) });

      return NextResponse.redirect(
        new URL(`/odeme/basarili?token=${token}`, request.url)
      );
    }

    return NextResponse.redirect(
      new URL(`/odeme/basarisiz?token=${token}`, request.url)
    );
  } catch (err) {
    console.error("[callback] Hata:", err);
    return NextResponse.redirect(new URL("/odeme/basarisiz", request.url));
  }
}
