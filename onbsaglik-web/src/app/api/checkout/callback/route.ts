/**
 * PayTR Bildirim Callback — POST /api/checkout/callback
 * PayTR ödeme işlemi tamamlandığında bu URL'ye bildirim gönderir.
 * Doğrulama yapıp PayTR'ye "OK" yanıtı döndürür.
 * Dokümantasyon: https://dev.paytr.com/bildirim-ve-callback-url
 */

import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const merchantOid = formData.get("merchant_oid") as string;
    const status      = formData.get("status") as string;
    const totalAmount = formData.get("total_amount") as string;
    const hash        = formData.get("hash") as string;

    const merchantSalt = process.env.PAYTR_MERCHANT_SALT ?? "";
    const merchantKey  = process.env.PAYTR_MERCHANT_KEY  ?? "";

    if (merchantKey && merchantSalt && hash) {
      // Hash doğrulama: SHA256-HMAC(merchant_oid + merchant_salt + status + total_amount, merchant_key)
      const hashStr = `${merchantOid}${merchantSalt}${status}${totalAmount}`;
      const expectedHash = crypto
        .createHmac("sha256", merchantKey)
        .update(hashStr)
        .digest("base64");

      if (hash !== expectedHash) {
        console.error("[PayTR Callback] Hash doğrulaması başarısız!");
        return new Response("PAYTR notification failed: bad hash", { status: 400 });
      }
    }

    if (status === "success") {
      console.log(`[PayTR Callback] Sipariş başarılı! Order ID: ${merchantOid}, Tutar: ${totalAmount}`);
      // Sipariş veritabanında "ödeye dönüştürüldü" olarak güncellenir
    } else {
      console.log(`[PayTR Callback] Sipariş başarısız. Order ID: ${merchantOid}`);
    }

    // PayTR her zaman "OK" yanıtı bekler
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("[PayTR Callback] Hata:", err);
    return new Response("OK", { status: 200 });
  }
}
