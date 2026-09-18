import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "Product ID gerekli" }, { status: 400 });
  }

  // Sadece onaylanmış soruları getir
  const { data, error } = await supabase
    .from("product_questions")
    .select("*")
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ questions: data });
}

export async function POST(req: Request) {
  const body = await req.json();

  const { product_id, user_email, user_name, question } = body;

  if (!product_id || !user_name || !question) {
    return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
  }

  const { error } = await supabase
    .from("product_questions")
    .insert({
      product_id,
      user_email: user_email || "anon@onbsaglik.com",
      user_name,
      question,
      is_approved: false
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
