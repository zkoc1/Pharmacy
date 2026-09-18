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

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await context.params;
  const { is_approved } = await req.json();

  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from("product_reviews")
    .update({ is_approved })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Admin log kaydı
  await supabase.from("admin_logs").insert({
    admin_email: adminEmail,
    action: "YORUM ONAYI DEĞİŞTİ",
    details: `Yorum #${id} onay durumu: ${is_approved ? 'Onaylandı' : 'Reddedildi'}`
  });

  return NextResponse.json({ success: true, review: data });
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await context.params;
  const supabase = getServiceSupabase();

  const { error } = await supabase.from("product_reviews").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Admin log kaydı
  await supabase.from("admin_logs").insert({
    admin_email: adminEmail,
    action: "YORUM SİLİNDİ",
    details: `Yorum #${id} tamamen silindi.`
  });

  return NextResponse.json({ success: true });
}
