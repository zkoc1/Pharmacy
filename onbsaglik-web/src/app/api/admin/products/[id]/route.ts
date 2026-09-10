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

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await context.params;
  const body = await req.json();
  const supabase = getServiceSupabase();

  const updateData = { ...body };
  if (updateData.marketPrice !== undefined) {
    updateData.market_price = updateData.marketPrice;
    delete updateData.marketPrice;
  }
  if (updateData.vatRate !== undefined) {
    updateData.vat_rate = updateData.vatRate;
    delete updateData.vatRate;
  }
  if (updateData.brandSlug !== undefined) {
    updateData.brand_slug = updateData.brandSlug;
    delete updateData.brandSlug;
  }
  if (updateData.categorySlug !== undefined) {
    updateData.category_slug = updateData.categorySlug;
    delete updateData.categorySlug;
  }
  if (updateData.trendyolLink !== undefined) {
    updateData.trendyol_link = updateData.trendyolLink;
    delete updateData.trendyolLink;
  }
  delete updateData.description; // We didn't add description to table yet
  delete updateData.desi; // We didn't add desi to table yet

  // Önce ürünün eski fiyatını alalım
  const { data: oldProduct } = await supabase.from("products").select("name, price, slug").eq("id", id).single();

  const { data, error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fiyat Düşüşü Bildirimi (Favorilere Ekleyenlere)
  if (oldProduct && updateData.price && updateData.price < oldProduct.price) {
    const { data: favorites } = await supabase.from("favorites").select("user_email").eq("product_id", id);
    if (favorites && favorites.length > 0) {
      const { sendEmail } = await import("@/lib/email");
      
      const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://onbsaglik.com.tr"}/urun/${oldProduct.slug || id}`;
      
      for (const fav of favorites) {
        if (fav.user_email) {
          const mailHtml = `
            <h2>Müjde! Favorinizdeki Ürünün Fiyatı Düştü 🎉</h2>
            <p>Merhaba,</p>
            <p>Favorilerinize eklediğiniz <strong>${oldProduct.name}</strong> ürününün fiyatı düştü!</p>
            <p>Eski Fiyat: <s>${oldProduct.price} TL</s></p>
            <p><strong>Yeni Fiyat: <span style="color: green;">${updateData.price} TL</span></strong></p>
            <br/>
            <a href="${productUrl}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Ürünü Hemen İncele</a>
            <br/><br/>
            <p>Sağlıklı günler dileriz,<br/><strong>OnbSağlık</strong></p>
          `;
          await sendEmail({
            to: fav.user_email,
            subject: `Favori Ürününüzde İndirim: ${oldProduct.name}`,
            html: mailHtml,
          });
        }
      }
    }
  }

  await logAction(adminEmail, "ÜRÜN GÜNCELLENDİ", `Ürün #${id} güncellendi.`);

  return NextResponse.json({ success: true, product: data });
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await context.params;
  const supabase = getServiceSupabase();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAction(adminEmail, "ÜRÜN SİLİNDİ", `Ürün #${id} tamamen silindi.`);

  return NextResponse.json({ success: true });
}
