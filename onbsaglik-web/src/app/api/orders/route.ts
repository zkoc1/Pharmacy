import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

  const mapped = ordersData.map((o) => ({
    id: o.id,
    invoiceNo: o.invoice_no,
    date: new Date(o.created_at).toLocaleString("tr-TR"),
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
    adminNote: o.admin_note,
    customerNote: o.customer_note,
    items: o.items.map((i: any) => ({
      id: i.product_id,
      slug: i.slug,
      name: i.name,
      brand: i.brand,
      price: Number(i.price),
      quantity: i.quantity,
      image: i.image
    }))
  }));

  return NextResponse.json(mapped);
}

// Herkes sipariş oluşturabilir (müşteri / misafir).
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = getServiceSupabase();

    // Rastgele ID ve Fatura No oluştur
    const rawId = body.id || `ONB${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
    const id = rawId.replace(/[^a-zA-Z0-9]/g, "");
    const invoiceNo = `ONB2026${Math.floor(10000 + Math.random() * 90000)}`;

    const orderData = {
      id,
      invoice_no: invoiceNo,
      customer_email: body.customerEmail,
      customer_name: body.customerName,
      customer_phone: body.customerPhone,
      total: body.total,
      carrier: body.carrier || "HepsiJet",
      payment_method: body.paymentMethod,
      status: body.status || "Ödeme Bekliyor",
      delivery_address: body.deliveryAddress,
      billing_address: body.billingAddress || body.deliveryAddress,
      tracking_number: body.trackingNumber || `272${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      admin_note: body.adminNote || "",
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
        // Eğer limit doluysa sipariş hatası vermiyoruz, sadece artırmıyoruz. İsteğe bağlı olarak hata da dönülebilir ama bura siparişin sonu.
        await supabase
          .from("coupons")
          .update({ used_count: couponData.used_count + 1 })
          .eq("code", body.couponCode.toUpperCase());
      }
    }

    if (body.items && body.items.length > 0) {
      // Sipariş alındığında stok miktarını düş
      for (const item of body.items) {
        if (!item.id) continue;
        const { data: prod } = await supabase.from('products').select('stock').eq('id', item.id).single();
        if (prod) {
          const newStock = Math.max(0, (prod.stock || 0) - item.quantity);
          await supabase.from('products').update({ stock: newStock }).eq('id', item.id);
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
      const { error: itemsError } = await supabase.from("order_items").insert(itemsData);
      if (itemsError) {
        console.error("Order items insert failed:", itemsError);
      }
    }

    // Müşteriye Sipariş Onay E-postası Gönder (Eğer PayTR değilse hemen gönder. PayTR ise callback'te onaylanır)
    if (orderData.payment_method !== "PayTR 3D Secure" && body.customerEmail) {
      const { sendEmail } = await import("@/lib/email");
      const mailHtml = `
        <h2>Siparişiniz Alındı! ✅</h2>
        <p>Merhaba ${body.customerName},</p>
        <p><strong>#${id}</strong> numaralı siparişiniz başarıyla oluşturulmuştur.</p>
        <p><strong>Ödeme Yöntemi:</strong> ${body.paymentMethod}</p>
        <p><strong>Sipariş Tutarı:</strong> ${body.total} TL</p>
        <br/>
        <p>Siparişinizin durumunu web sitemizden Hesabım > Siparişlerim adımından takip edebilirsiniz.</p>
        <p>Teşekkür ederiz.<br/><strong>OnbSağlık</strong></p>
      `;
      // Arka planda mail at, response'u bekletme
      sendEmail({
        to: body.customerEmail,
        subject: `Siparişiniz Alındı #${id}`,
        html: mailHtml,
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("Order create error:", error);
    return NextResponse.json({ error: "Sipariş oluşturulamadı." }, { status: 500 });
  }
}
