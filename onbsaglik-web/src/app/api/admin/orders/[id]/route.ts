import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { cookies } from "next/headers";

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
  
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: true });
  }

  const { data: order } = await supabase.from("orders").select("customer_email, customer_name, status, tracking_number").eq("id", id).single();
  const oldStatus = order?.status;

  const { error } = await supabase.from("orders").update(updates).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Eğer kargo takip numarası eklendiyse veya durumu kargoda yapıldıysa kullanıcıya mail at
  const newStatus = updates.status || oldStatus;
  const newTrackingNumber = updates.tracking_number !== undefined ? updates.tracking_number : order?.tracking_number;
  
  if (order?.customer_email && (updates.tracking_number || (updates.status === "Kargoda" && oldStatus !== "Kargoda"))) {
    const { sendEmail } = await import("@/lib/email");
    const mailHtml = `
      <h2>Siparişiniz Kargoya Verildi! 🚚</h2>
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
