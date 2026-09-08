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
    
    return NextResponse.json({
      ...data,
      brandSlug: data.brand_slug,
      categorySlug: data.category_slug,
      marketPrice: data.market_price,
      vatRate: data.vat_rate,
      trendyolLink: data.trendyol_link,
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

  const mappedData = data.map(p => ({
    ...p,
    brandSlug: p.brand_slug,
    categorySlug: p.category_slug,
    marketPrice: p.market_price,
    vatRate: p.vat_rate,
    trendyolLink: p.trendyol_link,
    images: typeof p.images === 'string' ? (p.images.startsWith('[') ? JSON.parse(p.images) : p.images.split(',')) : (p.images || []),
  }));

  return NextResponse.json(mappedData);
}
