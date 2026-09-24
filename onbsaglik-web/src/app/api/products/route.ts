import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  
  if (slug) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("status", "active")
      .single();
      
    if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    const price = Number(data.price) || 0;
    let marketPrice = Number(data.market_price) || 0;
    if (!marketPrice || marketPrice <= price) {
      marketPrice = Math.round(price * 1.18 * 100) / 100;
    }

    return NextResponse.json({
      ...data,
      price,
      marketPrice,
      brandSlug: data.brand_slug,
      categorySlug: data.category_slug,
      vatRate: data.vat_rate,
      trendyolLink: data.trendyol_link,
      longDescription: data.long_description,
      ingredients: data.ingredients,
      images: typeof data.images === 'string' ? (data.images.startsWith('[') ? JSON.parse(data.images) : data.images.split(',')) : (data.images || []),
    });
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .order("id", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const mappedData = data.map(p => {
    const price = Number(p.price) || 0;
    let marketPrice = Number(p.market_price) || 0;
    if (!marketPrice || marketPrice <= price) {
      marketPrice = Math.round(price * 1.18 * 100) / 100;
    }
    return {
      ...p,
      price,
      marketPrice,
      brandSlug: p.brand_slug,
      categorySlug: p.category_slug,
      vatRate: p.vat_rate,
      trendyolLink: p.trendyol_link,
      longDescription: p.long_description,
      ingredients: p.ingredients,
      images: typeof p.images === 'string' ? (p.images.startsWith('[') ? JSON.parse(p.images) : p.images.split(',')) : (p.images || []),
    };
  });

  return NextResponse.json(mappedData);
}
