import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
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
  if (updateData.longDescription !== undefined) {
    updateData.long_description = updateData.longDescription;
    delete updateData.longDescription;
  }
  if (updateData.ingredients !== undefined) {
    updateData.ingredients = updateData.ingredients;
  }
  delete updateData.description;
  delete updateData.desi;

  const { data: oldProduct } = await supabase.from("products").select("name, price, slug, stock").eq("id", id).single();

  const { data, error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  
  // Fiyat Düşüşü Bildirimi
  if (oldProduct && updateData.price && updateData.price < oldProduct.price) {
    const { data: priceAlarms } = await supabase.from("price_alarms").select("user_email, target_price").eq("product_id", id);
    if (priceAlarms && priceAlarms.length > 0) {
      const { sendEmail } = await import("@/lib/email");
      const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://onbsaglik.com.tr"}/urun/${oldProduct.slug || id}`;
      for (const alarm of priceAlarms) {
        if (alarm.user_email && updateData.price <= alarm.target_price) {
          const mailHtml = `<h2>Müjde! Beklediğiniz Ürünün Fiyatı Düştü 🥳</h2>
            <p><strong>${oldProduct.name}</strong> ürününün fiyatı <strong>${updateData.price} TL</strong> seviyesine düştü!</p>
            <a href="${productUrl}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Hemen İncele</a>
            <br/><br/>
            <p>Sağlıklı günler dileriz,<br/><strong>OnbSağlık</strong></p>`;
          await sendEmail({ to: alarm.user_email, subject: `Fiyat Alarmı: ${oldProduct.name}`, html: mailHtml });
          await supabase.from("price_alarms").delete().eq("user_email", alarm.user_email).eq("product_id", id);
        }
      }
    }
  }

  // Stok Geldi Bildirimi
  if (oldProduct && oldProduct.stock === 0 && updateData.stock > 0) {
    const { data: stockAlarms } = await supabase.from("stock_alarms").select("user_email").eq("product_id", id);
    if (stockAlarms && stockAlarms.length > 0) {
      const { sendEmail } = await import("@/lib/email");
      const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://onbsaglik.com.tr"}/urun/${oldProduct.slug || id}`;
      for (const alarm of stockAlarms) {
        if (alarm.user_email) {
          const mailHtml = `<h2>Müjde! Beklediğiniz Ürün Stoklarda 📦</h2>
            <p><strong>${oldProduct.name}</strong> ürünü yeniden stoklarımıza girmiştir!</p>
            <a href="${productUrl}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Hemen Satın Al</a>
            <br/><br/>
            <p>Sağlıklı günler dileriz,<br/><strong>OnbSağlık</strong></p>`;
          await sendEmail({ to: alarm.user_email, subject: `Stok Alarmı: ${oldProduct.name} Geldi!`, html: mailHtml });
          await supabase.from("stock_alarms").delete().eq("user_email", alarm.user_email).eq("product_id", id);
        }
      }
    }
  }


  await logAction(adminEmail, "ÜRÜN GÜNCELLENDİ", `Ürün #${id} güncellendi.`);

  if (oldProduct?.slug) {
    revalidatePath("/urun/" + oldProduct.slug);
  }
  revalidatePath("/");
  revalidatePath("/urunler");

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
