/**
 * PayTR Bildirim Callback — POST /api/checkout/callback
 * PayTR ödeme işlemi tamamlandığında bu URL'ye POST bildirimi gönderir.
 * Doğrulama yapıp PayTR'ye düz metin "OK" yanıtı döndürür.
 * Resmi Dokümantasyon: https://dev.paytr.com/bildirim-ve-callback-url
 */

import crypto from "crypto";

// GET & HEAD istekleri (sağlık kontrolü ve canlılık testi)
export async function GET() {
  return new Response("OK", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

export async function POST(request: Request) {
  try {
    // 1. İstek gövdesini güvenle oku (urlencoded formatında gelir)
    let rawBody = "";
    try {
      rawBody = await request.text();
    } catch (readErr) {
      console.error("[PayTR Callback] İstek gövdesi okunamadı:", readErr);
    }

    const params = new URLSearchParams(rawBody || "");
    let merchantOid = (params.get("merchant_oid") || "").trim();
    let status = (params.get("status") || "").trim();
    let totalAmount = (params.get("total_amount") || "").trim();
    let hash = (params.get("hash") || "").trim();
    const failedReasonMsg = params.get("failed_reason_msg") || "";

    // Fallback: Gövde JSON formatında iletildiyse
    if (!merchantOid && rawBody && rawBody.trim().startsWith("{")) {
      try {
        const json = JSON.parse(rawBody);
        merchantOid = (json.merchant_oid || "").trim();
        status = (json.status || "").trim();
        totalAmount = (json.total_amount ? String(json.total_amount) : "").trim();
        hash = (json.hash || "").trim();
      } catch {}
    }

    // 2. Zorunlu alan kontrolü
    if (!merchantOid || !status || !totalAmount || !hash) {
      console.warn("[PayTR Callback] Eksik bildirim parametreleri:", {
        merchantOid,
        status,
        totalAmount,
        hasHash: !!hash,
        rawLength: rawBody.length,
      });
      return new Response("PAYTR notification failed: missing parameters", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // 3. PayTR Mağaza Anahtarları (Netlify ortam değişkenleri veya güvenli üretim yedeği)
    const merchantKey = (process.env.PAYTR_MERCHANT_KEY || "GjKuNDxh7aDsqBtc").trim();
    const merchantSalt = (process.env.PAYTR_MERCHANT_SALT || "7a4EjDXbGw6XkZtN").trim();

    // 4. HMAC-SHA256 İmza Doğrulaması (PayTR Resmi Standart — timingSafeEqual ile güvenli karşılaştırma)
    // token = base64(hmac_sha256(merchant_oid + merchant_salt + status + total_amount, merchant_key))
    const hashStr = `${merchantOid}${merchantSalt}${status}${totalAmount}`;
    const expectedHash = crypto
      .createHmac("sha256", merchantKey)
      .update(hashStr)
      .digest("base64");

    const receivedBuf = Buffer.from(hash, "utf8");
    const expectedBuf = Buffer.from(expectedHash, "utf8");
    const isHashValid =
      receivedBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(receivedBuf, expectedBuf);

    if (!isHashValid) {
      console.error("[PayTR Callback] Hash doğrulaması başarısız! Sahte veya bozuk istek.", {
        merchantOid,
      });
      return new Response("PAYTR notification failed: bad hash", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // 5. Hash başarıyla doğrulandı -> İşlemi veritabanına ve sisteme işle
    // ÖNEMLİ: DB veya mail tarafındaki herhangi bir hata PayTR'ye "OK" dönülmesini ASLA engellememelidir!
    if (status === "success") {
      console.log(`[PayTR Callback] Ödeme BAŞARILI: ${merchantOid}, Tutar: ${totalAmount} kuruş`);

      try {
        const { getServiceSupabase } = await import("@/lib/supabase");
        const { formatTurkeyDateTime } = await import("@/lib/dateUtils");
        const supabase = getServiceSupabase();

        const { data: currentOrder, error: orderErr } = await supabase
          .from("orders")
          .select("id, admin_note, customer_name, customer_email, total, payment_method, status")
          .eq("id", merchantOid)
          .maybeSingle();

        if (orderErr) {
          console.error("[PayTR Callback] Supabase sipariş sorgulama hatası:", orderErr);
        }

        // PayTR 2. Adım Resmi Kuralı (Idempotency / Mükerrer Bildirim Koruması):
        // Sipariş zaten daha önce onaylandıysa (Yeni / Hazırlanıyor / Kargoda / Teslim Edildi),
        // stoğu tekrar düşürmeden, durumu geri almadan ve tekrar mail atmadan doğrudan "OK" dön!
        const alreadyProcessedStatuses = ["Yeni", "Hazırlanıyor", "Kargoda", "Teslim Edildi"];
        if (currentOrder?.status && alreadyProcessedStatuses.includes(currentOrder.status)) {
          console.log(`[PayTR Callback] Sipariş zaten işlenmiş (${currentOrder.status}), mükerrer işlem atlandı: ${merchantOid}`);
          return new Response("OK", {
            status: 200,
            headers: { "Content-Type": "text/plain" },
          });
        }

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

        const paidTL = totalAmount ? (Number(totalAmount) / 100).toFixed(2) : (currentOrder?.total || "0.00");
        timeline.push({
          status: "Yeni",
          date: formatTurkeyDateTime(new Date()),
          note: `PayTR 3D Secure ile ${paidTL} TL ödeme başarıyla tahsil edildi. (İşlem ID: ${merchantOid})`,
        });

        const { data: updatedOrder, error: updateErr } = await supabase
          .from("orders")
          .update({
            status: "Yeni",
            admin_note: JSON.stringify({ note, timeline }),
          })
          .eq("id", merchantOid)
          .select("customer_email, customer_name, total, payment_method")
          .maybeSingle();

        if (updateErr) {
          console.error("[PayTR Callback] Sipariş güncelleme hatası:", updateErr);
        }

        // Ödeme başarıyla tahsil edildi -> Satın alınan ürünlerin stoklarını düşür
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("product_id, quantity")
          .eq("order_id", merchantOid);

        if (orderItems && orderItems.length > 0) {
          for (const it of orderItems) {
            if (!it.product_id) continue;
            const { data: prod } = await supabase
              .from("products")
              .select("stock")
              .eq("id", it.product_id)
              .maybeSingle();

            if (prod) {
              const newStock = Math.max(0, (prod.stock || 0) - (it.quantity || 1));
              await supabase
                .from("products")
                .update({ stock: newStock })
                .eq("id", it.product_id);
            }
          }
        }

        // Müşteriye ödeme onay e-postası gönder
        const customerEmail = updatedOrder?.customer_email || currentOrder?.customer_email;
        const customerName = updatedOrder?.customer_name || currentOrder?.customer_name || "Değerli Müşterimiz";
        if (customerEmail) {
          try {
            const { sendEmail } = await import("@/lib/email");
            const mailHtml = `
              <h2>Siparişiniz Alındı ve Ödemeniz Onaylandı! ✅</h2>
              <p>Merhaba ${customerName},</p>
              <p><strong>#${merchantOid}</strong> numaralı siparişinizin ödemesi (${paidTL} TL) PayTR üzerinden başarıyla tahsil edilmiştir.</p>
              <p>Siparişiniz şu an <strong>Hazırlanıyor</strong> aşamasına geçmiştir. Kargoya verildiğinde kargo takip bilgileriniz iletilecektir.</p>
              <br/>
              <p>Bizi tercih ettiğiniz için teşekkür ederiz.<br/><strong>OnbSağlık</strong></p>
            `;
            sendEmail({
              to: customerEmail,
              subject: `Ödemeniz Onaylandı! Sipariş #${merchantOid}`,
              html: mailHtml,
            }).catch((mErr) => console.error("[PayTR Callback] Mail gönderme hatası:", mErr));
          } catch (eErr) {
            console.error("[PayTR Callback] Email modül hatası:", eErr);
          }
        }
      } catch (dbErr) {
        console.error("[PayTR Callback] Sipariş işleme iç hatası (PayTR OK etkilenmez):", dbErr);
      }
    } else {
      console.log(`[PayTR Callback] Ödeme BAŞARISIZ: ${merchantOid}, Mesaj: ${failedReasonMsg}`);

      try {
        const { getServiceSupabase } = await import("@/lib/supabase");
        const { formatTurkeyDateTime } = await import("@/lib/dateUtils");
        const supabase = getServiceSupabase();

        // Not: Başarısız ödemede stok düşürülmediği için stok iadesi yapmaya gerek yoktur.

        const { data: currentOrder } = await supabase
          .from("orders")
          .select("status, admin_note")
          .eq("id", merchantOid)
          .maybeSingle();

        // Zaten iptal edilmiş veya ödenmiş bir siparişi tekrar üzerine yazma
        if (currentOrder?.status && ["İptal / İade", "Yeni", "Hazırlanıyor", "Kargoda", "Teslim Edildi"].includes(currentOrder.status)) {
          return new Response("OK", {
            status: 200,
            headers: { "Content-Type": "text/plain" },
          });
        }

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
          note: `PayTR 3D Secure ödeme başarısız: ${failedReasonMsg || "Ödeme tamamlanamadı."}`,
        });

        await supabase
          .from("orders")
          .update({
            status: "İptal / İade",
            admin_note: JSON.stringify({
              note: `Ödeme Başarısız: ${failedReasonMsg || "PayTR Reddedildi"}`,
              timeline,
            }),
          })
          .eq("id", merchantOid);
      } catch (failErr) {
        console.error("[PayTR Callback] Başarısız işlem güncelleme hatası:", failErr);
      }
    }

    // 6. PayTR Resmi Şartı:
    // Doğrulanan her bildirim isteği için sunucu TAM OLARAK "OK" dönmelidir.
    return new Response("OK", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (globalErr) {
    console.error("[PayTR Callback] Beklenmeyen sistem hatası:", globalErr);
    return new Response("OK", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
}