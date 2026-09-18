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
  if (body.is_approved !== undefined) updates.is_approved = body.is_approved;
  if (body.answer !== undefined) {
    updates.answer = body.answer;
    updates.answered_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("product_questions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Admin log kaydı
  await supabase.from("admin_logs").insert({
    admin_email: adminEmail,
    action: "SORU GÜNCELLENDİ",
    details: `Soru #${id} güncellendi/cevaplandı.`
  });

  return NextResponse.json({ success: true, question: data });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const supabase = getServiceSupabase();

  const { error } = await supabase.from("product_questions").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("admin_logs").insert({
    admin_email: adminEmail,
    action: "SORU SİLİNDİ",
    details: `Soru #${id} tamamen silindi.`
  });

  return NextResponse.json({ success: true });
}
