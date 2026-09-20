import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { processPayTRRefund } from "@/lib/paytr";
import { sendEmail } from "@/lib/email";

async function getAdminEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  try {
    const decoded = atob(token);
    return decoded.split(":")[0];
  } catch {
    return null;
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const supabase = getServiceSupabase();

  const updates: any = {};
  if (body.status !== undefined) updates.status = body.status;
  if (body.trackingNumber !== undefined) updates.tracking_number = body.trackingNumber;
  if (body.adminNote !== undefined) updates.admin_note = body.adminNote;
  if (body.carrier !== undefined) updates.carrier = body.carrier;
  
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: true });
  }

  const { data: order } = await supabase.from("orders").select("customer_email, customer_name, status, tracking_number, payment_method, total").eq("id", id).single();
  const oldStatus = order?.status;

  const { error } = await supabase.from("orders").update(updates).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const newStatus = updates.status || oldStatus;
  const newTrackingNumber = updates.tracking_number !== undefined ? updates.tracking_number : order?.tracking_number;
  
  // 1. Kargoya Verildi Maili
  if (order?.customer_email && (updates.tracking_number || (updates.status === "Kargoda" && oldStatus !== "Kargoda"))) {
    const mailHtml = `
      <h2>Siparişiniz Kargoya Verildi! 📦</h2>
      <p>Merhaba ${order.customer_name},</p>
      <p><strong>#${id}</strong> numaralı siparişiniz kargoya teslim edilmiştir.</p>
      ${newTrackingNumber ? `<p><strong>Kargo Takip Numaranız:</strong> ${newTrackingNumber}</p>` : ""}
      <p>Bizi tercih ettiğiniz için teşekkür ederiz.</p>
      <br/>
      <p><strong>OnbSağlık</strong></p>
    `;
    await sendEmail({
      to: order.customer_email,
      subject: `Siparişiniz Kargoya Verildi! #${id}`,
      html: mailHtml,
    });
  }

  // 2. İptal / İade Maili & Stok İadesi & PayTR İadesi
  if (updates.status === "İptal / İade" && oldStatus !== "İptal / İade") {
    // A. Stok İadesi
    const { data: items } = await supabase.from("order_items").select("product_slug, quantity").eq("order_id", id);
    if (items && items.length > 0) {
      for (const item of items) {
        const { data: prod } = await supabase.from("products").select("stock").eq("slug", item.product_slug).single();
        if (prod) {
          await supabase.from("products").update({ stock: prod.stock + item.quantity }).eq("slug", item.product_slug);
        }
      }
    }

    // B. PayTR İadesi
    let refundMsg = "";
    if (order?.payment_method?.includes("Kredi Kartı") || order?.payment_method?.includes("PayTR")) {
      const refundRes = await processPayTRRefund(id, order.total || 0);
      if (refundRes.status === "success") {
        refundMsg = "PayTR üzerinden ücret iadeniz otomatik olarak başlatılmıştır (1-3 iş günü içerisinde kartınıza yansır).";
      } else {
        refundMsg = "Ücret iadeniz bankanıza iletilmek üzere muhasebe departmanımıza bildirilmiştir.";
        console.warn("Admin PayTR Auto Refund Error:", refundRes);
      }
    } else {
      refundMsg = "Havale/EFT ile yaptığınız ödemelerin iadesi için müşteri hizmetlerimiz sizinle iletişime geçecektir.";
    }

    // C. Mail Gönderimi
    if (order?.customer_email) {
      const mailHtml = `
        <h2>Siparişiniz İptal Edildi</h2>
        <p>Merhaba ${order.customer_name},</p>
        <p><strong>#${id}</strong> numaralı siparişiniz iptal edilmiştir.</p>
        <p style="padding:15px; background:#f3f4f6; border-radius:8px; border-left:4px solid #f27a1a;">
          <strong>İade Durumu:</strong><br/>
          ${refundMsg}
        </p>
        <p>Bizi tercih ettiğiniz için teşekkür ederiz.</p>
        <br/>
        <p><strong>OnbSağlık</strong></p>
      `;
      await sendEmail({
        to: order.customer_email,
        subject: `Siparişiniz İptal Edildi! #${id}`,
        html: mailHtml,
      });
    }
  }

  let details = `#${id} numaralı sipariş güncellendi: `;
  if (updates.status) details += `Durum -> ${updates.status}. `;
  if (updates.tracking_number) details += `Takip No -> ${updates.tracking_number}. `;

  await supabase.from("admin_logs").insert({
    admin_email: adminEmail,
    action: "SİPARİŞ GÜNCELLENDİ",
    details: details.trim()
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const supabase = getServiceSupabase();

  const { error } = await supabase.from("orders").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("admin_logs").insert({
    admin_email: adminEmail,
    action: "SİPARİŞ SİLİNDİ",
    details: `#${id} numaralı sipariş iptal edilerek silindi.`
  });

  return NextResponse.json({ success: true });
}
