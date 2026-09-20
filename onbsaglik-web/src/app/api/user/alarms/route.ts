import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "price" veya "stock"

  if (type === "price") {
    const { data, error } = await supabase
      .from("price_alarms")
      .select("*, products(name, slug, price, images)")
      .eq("user_email", session.user.email);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ alarms: data });
  } 
  
    if (type === "stock") {
    const { data, error } = await supabase
      .from("stock_alarms")
      .select("*, products(name, slug, stock, price, images)")
      .eq("user_email", session.user.email);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ alarms: data });
  }

  return NextResponse.json({ error: "Geçersiz alarm tipi" }, { status: 400 });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const { type, product_id, target_price } = body;

  if (type === "price") {
    if (!target_price) return NextResponse.json({ error: "Hedef fiyat gerekli" }, { status: 400 });
    const { data, error } = await supabase.from("price_alarms").upsert({
      user_email: session.user.email,
      product_id,
      target_price
    }, { onConflict: "user_email, product_id" }).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, alarm: data[0] });
  }

    if (type === "stock") {
    const { data, error } = await supabase
      .from("stock_alarms")
      .select("*, products(name, slug, stock, price, images)")
      .eq("user_email", session.user.email);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}


