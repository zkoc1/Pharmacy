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

// GET /api/admin/products -> Tüm ürünleri getir
export async function GET() {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/admin/products -> Yeni ürün ekle
export async function POST(req: Request) {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from("products")
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAction(adminEmail, "ÜRÜN EKLENDİ", `${data.name} (Barkod: ${data.barcode || '-'}) eklendi.`);

  return NextResponse.json({ success: true, product: data });
}
