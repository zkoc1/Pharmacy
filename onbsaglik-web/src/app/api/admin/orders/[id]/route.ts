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

  const { error } = await supabase.from("orders").update(updates).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
