import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "E-posta gerekli." }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("favorites")
    .select("product_id")
    .eq("user_email", email);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, favorites: data.map((f) => f.product_id) });
}

export async function POST(req: Request) {
  try {
    const { email, productId } = await req.json();

    if (!email || !productId) {
      return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    
    // Zaten ekli mi kontrol et
    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_email", email)
      .eq("product_id", productId)
      .single();

    if (existing) {
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase
      .from("favorites")
      .insert({ user_email: email, product_id: productId });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Favorites POST error:", error);
    return NextResponse.json({ error: "Eklenemedi." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { email, productId } = await req.json();

    if (!email || !productId) {
      return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_email", email)
      .eq("product_id", productId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Favorites DELETE error:", error);
    return NextResponse.json({ error: "Silinemedi." }, { status: 500 });
  }
}
