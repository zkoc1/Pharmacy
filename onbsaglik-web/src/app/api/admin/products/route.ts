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

  const mappedData = data.map(p => ({
    ...p,
    brandSlug: p.brand_slug,
    categorySlug: p.category_slug,
    marketPrice: p.market_price,
    vatRate: p.vat_rate,
    trendyolLink: p.trendyol_link,
  }));

  return NextResponse.json(mappedData);
}

// POST /api/admin/products -> Yeni ürün ekle
export async function POST(req: Request) {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const supabase = getServiceSupabase();

  const insertData = {
    ...body,
    brand_slug: body.brandSlug,
    category_slug: body.categorySlug,
    market_price: body.marketPrice,
    vat_rate: body.vatRate,
    trendyol_link: body.trendyolLink,
  };
  delete insertData.brandSlug;
  delete insertData.categorySlug;
  delete insertData.marketPrice;
  delete insertData.vatRate;
  delete insertData.trendyolLink;
  delete insertData.description; // We didn't add description to table yet
  delete insertData.desi; // We didn't add desi to table yet

  const { data, error } = await supabase
    .from("products")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAction(adminEmail, "ÜRÜN EKLENDİ", `${data.name} (Barkod: ${data.barcode || '-'}) eklendi.`);

  const mappedData = {
    ...data,
    brandSlug: data.brand_slug,
    categorySlug: data.category_slug,
    marketPrice: data.market_price,
    vatRate: data.vat_rate,
    trendyolLink: data.trendyol_link,
  };

  return NextResponse.json({ success: true, product: mappedData });
}
