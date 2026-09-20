import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendEmail } from "@/lib/email";
import { processPayTRRefund } from "@/lib/paytr";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await req.json();
  if (!orderId) {
    return NextResponse.json({ error: "Sipariş numarası eksik" }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  // 1. Fetch order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, status, payment_method, total, customer_name")
    .eq("id", orderId)
    .eq("customer_email", session.user.email)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  }

  // 2. Check status
  if (order.status !== "Ödeme Bekliyor" && order.status !== "Hazırlanıyor") {
    return NextResponse.json({ error: "Bu sipariş artık iptal edilemez. (Sadece Hazırlanıyor ve Ödeme Bekliyor durumundaki siparişler iptal edilebilir)." }, { status: 400 });
  }

  // 3. Revert Stock
  const { data: items } = await supabase.from("order_items").select("product_slug, quantity").eq("order_id", orderId);
  if (items && items.length > 0) {
    for (const item of items) {
      // Get current stock
      const { data: prod } = await supabase.from("products").select("stock").eq("slug", item.product_slug).single();
      if (prod) {
        await supabase.from("products").update({ stock: prod.stock + item.quantity }).eq("slug", item.product_slug);
      }
    }
  }

  // 4. Update Status to İptal / İade
  await supabase.from("orders").update({ status: "İptal / İade" }).eq("id", orderId);

  // 5. PayTR Refund (If credit card)
  let refundMsg = "";
  if (order.payment_method?.includes("Kredi Kartı") || order.payment_method?.includes("PayTR")) {
    // Attempt refund
    const refundRes = await processPayTRRefund(orderId, order.total || 0);
    if (refundRes.status === "success") {
      refundMsg = "PayTR üzerinden ücret iadeniz otomatik olarak başlatılmıştır (1-3 iş günü içerisinde kartınıza yansır).";
    } else {
      refundMsg = "Ücret iadeniz bankanıza iletilmek üzere muhasebe departmanımıza bildirilmiştir.";
      console.warn("PayTR Auto Refund Error:", refundRes);
    }
  } else {
    refundMsg = "Havale/EFT ile yaptığınız ödemelerin iadesi için müşteri hizmetlerimiz sizinle iletişime geçecektir.";
  }

  // 6. Send Email
  const mailHtml = `
    <h2>Siparişiniz İptal Edildi</h2>
    <p>Merhaba ${order.customer_name},</p>
    <p><strong>#${orderId}</strong> numaralı siparişiniz talebiniz üzerine iptal edilmiştir.</p>
    <p style="padding:15px; background:#f3f4f6; border-radius:8px; border-left:4px solid #f27a1a;">
      <strong>İade Durumu:</strong><br/>
      ${refundMsg}
    </p>
    <p>Bizi tercih ettiğiniz için teşekkür ederiz.</p>
    <br/>
    <p><strong>OnbSağlık</strong></p>
  `;

  await sendEmail({
    to: session.user.email,
    subject: `Siparişiniz İptal Edildi! #${orderId}`,
    html: mailHtml,
  });

  return NextResponse.json({ success: true, message: "Sipariş başarıyla iptal edildi." });
}
