import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { formatTurkeyDateTime } from "@/lib/dateUtils";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email;
  const supabase = getServiceSupabase();
  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select(`
      *,
      items:order_items(*)
    `)
    .eq("customer_email", email)
    .order("created_at", { ascending: false });

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  const mapped = ordersData.map((o) => {
    let timeline: any[] = [];
    let cleanAdminNote = o.admin_note || "";

    if (cleanAdminNote.startsWith("{") && cleanAdminNote.endsWith("}")) {
      try {
        const parsed = JSON.parse(cleanAdminNote);
        if (Array.isArray(parsed.timeline)) {
          timeline = parsed.timeline;
        }
        cleanAdminNote = parsed.note || "";
      } catch {}
    }

    // Eğer veritabanında timeline logu henüz yoksa, siparişin durumuna göre otomatik yapılandır
    if (timeline.length === 0) {
      const turkeyDate = formatTurkeyDateTime(o.created_at);
      timeline.push({
        status: "Ödeme Bekliyor",
        date: turkeyDate,
        note: "Sipariş oluşturuldu."
      });
      if (o.status === "Hazırlanıyor" || o.status === "Kargoda" || o.status === "Teslim Edildi") {
        timeline.push({
          status: "Hazırlanıyor",
          date: turkeyDate,
          note: "Ödeme onaylandı, depoda hazırlanıyor."
        });
      }
      if (o.status === "Kargoda" || o.status === "Teslim Edildi") {
        timeline.push({
          status: "Kargoda",
          date: turkeyDate,
          note: `${o.carrier || "HepsiJet"} ile kargoya teslim edildi. Takip No: ${o.tracking_number || "-"}`
        });
      }
      if (o.status === "Teslim Edildi") {
        timeline.push({
          status: "Teslim Edildi",
          date: turkeyDate,
          note: "Paketiniz teslim edildi."
        });
      }
      if (o.status === "İptal / İade") {
        timeline.push({
          status: "İptal / İade",
          date: turkeyDate,
          note: cleanAdminNote || "Sipariş iptal edildi."
        });
      }
    }

    return {
      id: o.id,
      invoiceNo: o.invoice_no,
      date: formatTurkeyDateTime(o.created_at),
      customerEmail: o.customer_email,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      total: Number(o.total),
      carrier: o.carrier,
      paymentMethod: o.payment_method,
      status: o.status,
      deliveryAddress: o.delivery_address,
      billingAddress: o.billing_address,
      trackingNumber: o.tracking_number,
      adminNote: cleanAdminNote,
      customerNote: o.customer_note,
      timeline,
      items: o.items.map((i: any) => ({
        id: i.product_id,
        slug: i.slug,
        name: i.name,
        brand: i.brand,
        price: Number(i.price),
        quantity: i.quantity,
        image: i.image
      }))
    };
  });

  return NextResponse.json(mapped);
}

// Sipariş oluşturma (Müşteri & Misafir)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = getServiceSupabase();

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Sepetinizde ürün bulunmamaktadır." }, { status: 400 });
    }

    // 1. KRİTİK GÜVENLİK & STOK KONTROLÜ:
    // Sepetteki tüm ürünlerin veritabanında var olup olmadığını, aktifliğini ve stok durumunu doğrula.
    for (const item of body.items) {
      if (!item.id) continue;
      const { data: productInDb, error: prodErr } = await supabase
        .from("products")
        .select("id, name, stock, status")
        .eq("id", item.id)
        .single();

      if (prodErr || !productInDb) {
        return NextResponse.json({
          error: `Sepetinizdeki '${item.name || "Bir ürün"}' sistemde bulunamadı veya satıştan kaldırılmıştır.`
        }, { status: 400 });
      }

      if (productInDb.status && productInDb.status !== "active") {
        return NextResponse.json({
          error: `Üzgünüz, '${productInDb.name}' ürünü şu anda satışa kapalıdır.`
        }, { status: 400 });
      }

      const availableStock = typeof productInDb.stock === "number" ? productInDb.stock : 0;
      if (availableStock <= 0) {
        return NextResponse.json({
          error: `Üzgünüz, '${productInDb.name}' ürününün stoğu tükenmiştir. Lütfen sepetinizden çıkarınız.`
        }, { status: 400 });
      }

      if (item.quantity > availableStock) {
        return NextResponse.json({
          error: `'${productInDb.name}' için talep ettiğiniz adet (${item.quantity}), mevcut stoktan (${availableStock}) fazladır.`
        }, { status: 400 });
      }
    }

    // Rastgele ID ve Fatura No oluştur
    const rawId = body.id || `ONB${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
    const id = rawId.replace(/[^a-zA-Z0-9]/g, "");
    const invoiceNo = `ONB2026${Math.floor(10000 + Math.random() * 90000)}`;

    // Backend Güvenlik: 500 TL ve üzeri siparişlerde kargo ücreti eklenemez
    let finalTotal = body.total;
    const itemsSubtotal = body.items.reduce((acc: number, item: any) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
    if (itemsSubtotal >= 500 && finalTotal > itemsSubtotal) {
      finalTotal = itemsSubtotal;
    }

    const orderStatus = body.status || "Ödeme Bekliyor";
    const nowTurkey = formatTurkeyDateTime(new Date());

    // Timeline başlangıç adımı
    const initialTimeline = [
      {
        status: orderStatus,
        date: nowTurkey,
        note: "Sipariş oluşturuldu."
      }
    ];

    const orderData = {
      id,
      invoice_no: invoiceNo,
      customer_email: body.customerEmail,
      customer_name: body.customerName,
      customer_phone: body.customerPhone,
      total: finalTotal,
      carrier: body.carrier || "HepsiJet",
      payment_method: body.paymentMethod,
      status: orderStatus,
      delivery_address: body.deliveryAddress,
      billing_address: body.billingAddress || body.deliveryAddress,
      tracking_number: body.trackingNumber || `272${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      admin_note: JSON.stringify({
        note: body.adminNote || "",
        timeline: initialTimeline
      }),
      customer_note: body.customerNote || ""
    };

    const { error: insertError } = await supabase.from("orders").insert(orderData);
    if (insertError) {
      console.error("Orders insert failed:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Eğer kupon kodu kullanıldıysa sayısını 1 artır
    if (body.couponCode) {
      const { data: couponData } = await supabase
        .from("coupons")
        .select("used_count, usage_limit")
        .eq("code", body.couponCode.toUpperCase())
        .single();
        
      if (couponData) {
        await supabase
          .from("coupons")
          .update({ used_count: couponData.used_count + 1 })
          .eq("code", body.couponCode.toUpperCase());
      }
    }

    // Sipariş kalemlerini ekle ve stok miktarını düşür
    for (const item of body.items) {
      if (!item.id) continue;
      const { data: prod } = await supabase.from("products").select("stock").eq("id", item.id).single();
      if (prod) {
        const newStock = Math.max(0, (prod.stock || 0) - item.quantity);
        await supabase.from("products").update({ stock: newStock }).eq("id", item.id);
      }
    }

    const itemsData = body.items.map((i: any) => ({
      order_id: id,
      product_id: i.id,
      slug: i.slug,
      name: i.name,
      brand: i.brand,
      price: i.price,
      quantity: i.quantity,
      image: i.image
    }));
    await supabase.from("order_items").insert(itemsData);

    // KURAL: PayTR veya Kredi Kartı ile ödeme yapılıyorsa, ASLA BURADA ONAY MAİLİ ATMA!
    // Para PayTR'den tam olarak tahsil edildiğinde PayTR webhook callback'i tetiklenir ve onay maili oradan atılır.
    const isCardOrPaytr = orderData.payment_method?.includes("PayTR") || orderData.payment_method?.includes("Kredi Kartı");

    if (!isCardOrPaytr && body.customerEmail) {
      // Sadece Havale/EFT için sipariş alındı (Havale bekleniyor) bilgilendirmesi gönderilir
      const { sendEmail } = await import("@/lib/email");
      const mailHtml = `
        <h2>Siparişiniz Alındı! (Havale/EFT Bekleniyor)</h2>
        <p>Merhaba ${body.customerName},</p>
        <p><strong>#${id}</strong> numaralı siparişiniz oluşturulmuştur.</p>
        <p><strong>Ödeme Yöntemi:</strong> Havale / EFT</p>
        <p><strong>Toplam Tutar:</strong> ${finalTotal} TL</p>
        <br/>
        <p>Lütfen sipariş numaranızı (${id}) açıklama kısmına yazarak havalenizi iletiniz. Havaleniz ulaştığında siparişiniz hazırlanacaktır.</p>
        <p>Teşekkür ederiz.<br/><strong>OnbSağlık</strong></p>
      `;
      sendEmail({
        to: body.customerEmail,
        subject: `Siparişiniz Alındı #${id} (Havale Bekleniyor)`,
        html: mailHtml,
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("Order create error:", error);
    return NextResponse.json({ error: "Sipariş oluşturulamadı." }, { status: 500 });
  }
}
