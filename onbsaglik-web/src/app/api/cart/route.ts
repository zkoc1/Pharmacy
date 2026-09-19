import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { data, error } = await supabase
    .from("cart_items")
    .select("*, products(*)")
    .eq("user_email", session.user.email);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ cart: data });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const { items } = body; // Array of { product_id, quantity }

  if (!Array.isArray(items)) {
    return NextResponse.json({ error: "Geçersiz format" }, { status: 400 });
  }

  // WIPE AND INSERT (Basit Senkronizasyon)
  await supabase.from("cart_items").delete().eq("user_email", session.user.email);

  if (items.length > 0) {
    const insertData = items.map((item: any) => ({
      user_email: session.user.email,
      product_id: item.product_id,
      quantity: item.quantity
    }));
    
    const { error } = await supabase.from("cart_items").insert(insertData);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

