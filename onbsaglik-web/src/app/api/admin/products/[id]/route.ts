import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServiceSupabase } from "@/lib/supabase";

async function getAdminEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  try {
    const decoded = atob(token);
    const parts = decoded.split(":");
    return parts[0]; // email
  } catch {
    return null;
  }
}

async function logAction(email: string, action: string, details: string) {
  const supabase = getServiceSupabase();
  await supabase.from("admin_logs").insert({
    admin_email: email,
    action,
    details
  });
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await context.params;
  const body = await req.json();
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from("products")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAction(adminEmail, "ÜRÜN GÜNCELLENDİ", `Ürün #${id} güncellendi.`);

  return NextResponse.json({ success: true, product: data });
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await context.params;
  const supabase = getServiceSupabase();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAction(adminEmail, "ÜRÜN SİLİNDİ", `Ürün #${id} tamamen silindi.`);

  return NextResponse.json({ success: true });
}
