import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { cookies } from "next/headers";

async function isAdmin() {
  const cookieStore = await cookies();
  return !!cookieStore.get("admin_token")?.value;
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const supabase = getServiceSupabase();
  const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const body = await req.json();
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from("coupons").insert([{
    code: body.code.toUpperCase(),
    discount_amount: body.discount_amount,
    min_cart_amount: body.min_cart_amount,
    is_active: body.is_active,
    is_first_order_only: body.is_first_order_only
  }]).select().single();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
  
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const body = await req.json();
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("coupons").update({ is_active: body.is_active }).eq("id", body.id);
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
