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

    // Madde 17: Webhook İmza Doğrulaması
    if (!merchantOid || !status || !totalAmount || !hash) {
      return new Response("PAYTR notification failed: missing parameters", { status: 400 });
    }

    if (process.env.NODE_ENV === "production" && (!merchantKey || !merchantSalt)) {
      console.error("[PayTR Callback] PAYTR_MERCHANT_KEY veya PAYTR_MERCHANT_SALT eksik!");
      return new Response("PAYTR notification failed: configuration error", { status: 500 });
    }

    if (merchantKey && merchantSalt) {
      // Hash doğrulama: SHA256-HMAC(merchant_oid + merchant_salt + status + total_amount, merchant_key)
      const hashStr = `${merchantOid}${merchantSalt}${status}${totalAmount}`;
      const expectedHash = crypto
        .createHmac("sha256", merchantKey)
        .update(hashStr)
        .digest("base64");

      if (hash !== expectedHash) {
        console.error("[PayTR Callback] Hash doğrulaması başarısız! Sahte veya bozuk istek.");
        return new Response("PAYTR notification failed: bad hash", { status: 400 });
      }
    }

    if (status === "success") {
      // Sipariş başarılı onaylandı
      console.log(`[PayTR Callback] Sipariş başarıyla ödendi: ${merchantOid}`);
      
      const { getServiceSupabase } = await import("@/lib/supabase");
      const supabase = getServiceSupabase();
      await supabase.from("orders").update({ status: "Hazırlanıyor" }).eq("id", merchantOid);
    } else {
      console.log(`[PayTR Callback] Sipariş ödeme başarısız: ${merchantOid}`);
      
      const { getServiceSupabase } = await import("@/lib/supabase");
      const supabase = getServiceSupabase();
      await supabase.from("orders").update({ status: "İptal Edildi", admin_note: "Ödeme Başarısız" }).eq("id", merchantOid);
    }

    // PayTR her zaman "OK" yanıtı bekler
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("[PayTR Callback] Sunucu hatası:", err);
    return new Response("PAYTR notification failed: internal error", { status: 500 });
  }
}
