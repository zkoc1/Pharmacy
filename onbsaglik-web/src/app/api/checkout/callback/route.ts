/**
 * PayTR Bildirim Callback — POST /api/checkout/callback
 * PayTR ödeme işlemi tamamlandığında bu URL'ye bildirim gönderir.
 * Doğrulama yapıp PayTR'ye "OK" yanıtı döndürür.
 * Dokümantasyon: https://dev.paytr.com/bildirim-ve-callback-url
 */

import { NextResponse } from "next/server";
import crypto from "crypto";

// PayTR veya sunucu sağlık kontrolleri için GET isteğine 200 OK dön
export async function GET() {
  return new Response("OK", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function POST(request: Request) {
  try {
    let merchantOid = "";
    let status = "";
    let totalAmount = "";
    let hash = "";

    try {
      const formData = await request.formData();
      merchantOid = (formData.get("merchant_oid") as string) || "";
      status      = (formData.get("status") as string) || "";
      totalAmount = (formData.get("total_amount") as string) || "";
      hash        = (formData.get("hash") as string) || "";
    } catch {
      try {
        const rawText = await request.text();
        const params = new URLSearchParams(rawText);
        merchantOid = params.get("merchant_oid") || "";
        status      = params.get("status") || "";
        totalAmount = params.get("total_amount") || "";
        hash        = params.get("hash") || "";
      } catch (parseErr) {
        console.error("[PayTR Callback] Form parsing error:", parseErr);
      }
    }

    const merchantSalt = (process.env.PAYTR_MERCHANT_SALT || "").trim();
    const merchantKey  = (process.env.PAYTR_MERCHANT_KEY  || "").trim();

    // Madde 17: Webhook İmza Doğrulaması
    if (!merchantOid || !status || !totalAmount || !hash) {
      console.warn("[PayTR Callback] Eksik parametreler:", { merchantOid, status, totalAmount });
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
      const { formatTurkeyDateTime } = await import("@/lib/dateUtils");
      const supabase = getServiceSupabase();
      
      const { data: currentOrder } = await supabase
        .from("orders")
        .select("admin_note, customer_name, customer_email, total, payment_method")
        .eq("id", merchantOid)
        .single();

      let timeline: any[] = [];
      let note = "";
      if (currentOrder?.admin_note) {
        try {
          const parsed = JSON.parse(currentOrder.admin_note);
          timeline = parsed.timeline || [];
          note = parsed.note || "";
        } catch {
          note = currentOrder.admin_note;
        }
      }

      timeline.push({
        status: "Hazırlanıyor",
        date: formatTurkeyDateTime(new Date()),
        note: `PayTR 3D Secure ile ${totalAmount ? (Number(totalAmount) / 100).toFixed(2) : currentOrder?.total} TL ödeme başarıyla tahsil edildi.`
      });

      // Sipariş durumunu güncelle
      const { data: updatedOrder } = await supabase.from("orders")
        .update({
          status: "Hazırlanıyor",
          admin_note: JSON.stringify({ note, timeline })
        })
        .eq("id", merchantOid)
        .select("customer_email, customer_name, total, payment_method")
        .single();
        
      if (updatedOrder?.customer_email) {
        const { sendEmail } = await import("@/lib/email");
        const mailHtml = `
          <h2>Siparişiniz Alındı ve Ödemeniz Onaylandı! ✅</h2>
          <p>Merhaba ${updatedOrder.customer_name},</p>
          <p><strong>#${merchantOid}</strong> numaralı siparişinizin ödemesi (${updatedOrder.total} TL) PayTR üzerinden başarıyla alınmıştır.</p>
          <p>Siparişiniz şu an <strong>Hazırlanıyor</strong> aşamasına geçmiştir. Kargoya verildiğinde takip bilgileriniz iletilecektir.</p>
          <br/>
          <p>Teşekkür ederiz.<br/><strong>OnbSağlık</strong></p>
        `;
        sendEmail({
          to: updatedOrder.customer_email,
          subject: `Ödemeniz Onaylandı! Sipariş #${merchantOid}`,
          html: mailHtml,
        }).catch(console.error);
      }
      
    } else {
      console.log(`[PayTR Callback] Sipariş ödeme başarısız: ${merchantOid}`);
      
      const { getServiceSupabase } = await import("@/lib/supabase");
      const { formatTurkeyDateTime } = await import("@/lib/dateUtils");
      const supabase = getServiceSupabase();

      // Başarısız ödemede stokları geri yükle
      const { data: items } = await supabase.from("order_items").select("product_id, quantity").eq("order_id", merchantOid);
      if (items && items.length > 0) {
        for (const it of items) {
          if (!it.product_id) continue;
          const { data: prod } = await supabase.from("products").select("stock").eq("id", it.product_id).single();
          if (prod) {
            await supabase.from("products").update({ stock: (prod.stock || 0) + it.quantity }).eq("id", it.product_id);
          }
        }
      }

      const { data: currentOrder } = await supabase.from("orders").select("admin_note").eq("id", merchantOid).single();
      let timeline: any[] = [];
      if (currentOrder?.admin_note) {
        try {
          const parsed = JSON.parse(currentOrder.admin_note);
          timeline = parsed.timeline || [];
        } catch {}
      }
      timeline.push({
        status: "İptal / İade",
        date: formatTurkeyDateTime(new Date()),
        note: "PayTR 3D Secure ödeme başarısız veya müşteri işlemi iptal etti."
      });

      await supabase.from("orders").update({
        status: "İptal / İade",
        admin_note: JSON.stringify({ note: "Ödeme Başarısız (PayTR)", timeline })
      }).eq("id", merchantOid);
    }

    // PayTR her zaman "OK" yanıtı bekler
    return new Response("OK", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("[PayTR Callback] Sunucu hatası:", err);
    return new Response("PAYTR notification failed: internal error", { status: 500 });
  }
}
