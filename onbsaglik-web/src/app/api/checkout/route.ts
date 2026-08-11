/**
 * iyzico Ödeme Başlatma API — POST /api/checkout
 * Sepet bilgilerini alır, iyzico'ya form initialize isteği gönderir.
 * Başarılı olursa ödeme formu HTML'ini döndürür.
 *
 * Dokümantasyon: https://dev.iyzipay.com/
 */

import { NextResponse } from "next/server";

// iyzico tip tanımları (SDK'sız native fetch ile)
interface BasketItem {
  productId: string;
  name: string;
  category1: string;
  itemType: "PHYSICAL";
  price: string;
}

interface IyzicoRequest {
  locale: "tr";
  conversationId: string;
  price: string;
  paidPrice: string;
  currency: "TRY";
  installment: "1";
  basketId: string;
  paymentChannel: "WEB";
  paymentGroup: "PRODUCT";
  callbackUrl: string;
  buyer: {
    id: string;
    name: string;
    surname: string;
    email: string;
    identityNumber: string;
    registrationAddress: string;
    city: string;
    country: string;
    ip: string;
  };
  shippingAddress: { contactName: string; city: string; country: string; address: string };
  billingAddress: { contactName: string; city: string; country: string; address: string };
  basketItems: BasketItem[];
}

// HMAC-SHA256 imza üretici (iyzico her istekte imza ister)
async function generateSignature(
  apiKey: string,
  secretKey: string,
  body: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const msgData = encoder.encode(apiKey + body);

  const key = await crypto.subtle.importKey(
    "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, msgData);

  // Base64 encode
  return Buffer.from(signature).toString("base64");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      items,
      buyer,
      total,
    }: {
      items: { id: number; name: string; price: number; quantity: number; category: string }[];
      buyer: { name: string; surname: string; email: string; phone: string; address: string; city: string };
      total: number;
    } = body;

    // Zorunlu alan kontrolü
    if (!items?.length || !buyer?.email || !total) {
      return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
    }

    const apiKey = process.env.IYZICO_API_KEY;
    const secretKey = process.env.IYZICO_SECRET_KEY;
    const baseUrl = process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com";

    if (!apiKey || !secretKey) {
      return NextResponse.json({ error: "iyzico yapılandırması eksik." }, { status: 500 });
    }

    const conversationId = `onb-${Date.now()}`;
    const priceStr = total.toFixed(2);

    // Sepet kalemleri — her ürün için miktar * fiyat
    const basketItems: BasketItem[] = items.flatMap((item) =>
      Array.from({ length: item.quantity }, () => ({
        productId: String(item.id),
        name: item.name.substring(0, 60),
        category1: item.category || "Genel",
        itemType: "PHYSICAL" as const,
        price: item.price.toFixed(2),
      }))
    );

    const payload: IyzicoRequest = {
      locale: "tr",
      conversationId,
      price: priceStr,
      paidPrice: priceStr,
      currency: "TRY",
      installment: "1",
      basketId: conversationId,
      paymentChannel: "WEB",
      paymentGroup: "PRODUCT",
      callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/odeme/sonuc`,
      buyer: {
        id: `buyer-${Date.now()}`,
        name: buyer.name,
        surname: buyer.surname,
        email: buyer.email,
        identityNumber: "11111111110", // Gerçek uygulamada müşteriden alınır
        registrationAddress: buyer.address,
        city: buyer.city,
        country: "Turkey",
        ip: request.headers.get("x-forwarded-for") ?? "127.0.0.1",
      },
      shippingAddress: {
        contactName: `${buyer.name} ${buyer.surname}`,
        city: buyer.city,
        country: "Turkey",
        address: buyer.address,
      },
      billingAddress: {
        contactName: `${buyer.name} ${buyer.surname}`,
        city: buyer.city,
        country: "Turkey",
        address: buyer.address,
      },
      basketItems,
    };

    const bodyStr = JSON.stringify(payload);
    const signature = await generateSignature(apiKey, secretKey, bodyStr);

    // iyzico'ya form initialize isteği gönder
    const iyzicoRes = await fetch(`${baseUrl}/payment/iyzipos/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `IYZWSv2 apiKey:${apiKey}, signature:${signature}, conversationId:${conversationId}`,
      },
      body: bodyStr,
    });

    const result = await iyzicoRes.json();

    if (result.status !== "success") {
      console.error("[iyzico] Hata:", result);
      return NextResponse.json(
        { error: result.errorMessage ?? "Ödeme başlatılamadı." },
        { status: 400 }
      );
    }

    // Ödeme formu HTML'ini frontend'e gönder
    return NextResponse.json({
      success: true,
      checkoutFormContent: result.checkoutFormContent,
      token: result.token,
      conversationId,
    });
  } catch (err) {
    console.error("[checkout] Hata:", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
