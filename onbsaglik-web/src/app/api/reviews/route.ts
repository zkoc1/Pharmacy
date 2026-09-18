import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "Product ID gerekli" }, { status: 400 });
  }

  // Sadece onaylanmış yorumları getir (is_approved = true)
  const { data, error } = await supabase
    .from("product_reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reviews: data });
}

export async function POST(req: Request) {
  const body = await req.json();

  const { product_id, user_email, user_name, rating, comment } = body;

  if (!product_id || !user_name || !rating || !comment) {
    return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("product_reviews")
    .insert({
      product_id,
      user_email: user_email || "anon@onbsaglik.com",
      user_name,
      rating,
      comment,
      is_approved: false // Admin onayına düşmesi için varsayılan olarak false kaydediyoruz.
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, review: data });
}
