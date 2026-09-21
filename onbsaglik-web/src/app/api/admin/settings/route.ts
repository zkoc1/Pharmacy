import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { cookies } from "next/headers";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  return !!token;
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const supabase = getServiceSupabase();
  const { data } = await supabase.from("settings").select("*").eq("id", 1).single();
  const settingsData = data ? { ...data } : {};
  if (!settingsData.free_shipping_threshold || Number(settingsData.free_shipping_threshold) >= 3000) {
    settingsData.free_shipping_threshold = 500;
    supabase.from("settings").update({ free_shipping_threshold: 500 }).eq("id", 1).then(() => {});
  }
  return NextResponse.json(settingsData);
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const body = await req.json();
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("settings").update({
    free_shipping_threshold: body.freeShippingThreshold,
    shipping_cost: body.shippingCost,
    updated_at: new Date().toISOString()
  }).eq("id", 1);
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
