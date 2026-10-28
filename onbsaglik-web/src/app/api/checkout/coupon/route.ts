import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { code, cartTotal, isFirstOrder } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Kupon kodu eksik" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Özel İlk Sipariş Kuponu: ILK50 (600 TL ve üzeri 50 TL indirim)
    if (cleanCode === "ILK50") {
      if (cartTotal < 600) {
        return NextResponse.json({ error: "Bu kupon minimum 600 TL alışverişlerde geçerlidir." }, { status: 400 });
      }
      return NextResponse.json({ success: true, discountAmount: 50 });
    }

    const supabase = getServiceSupabase();

    // Kuponu veritabanından bul
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", cleanCode)
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ error: "Geçersiz veya süresi dolmuş bir kupon kodu girdiniz." }, { status: 400 });
    }

    // Limit kontrolü
    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json({ error: "Bu kupon kodunun kullanım limiti dolmuştur." }, { status: 400 });
    }

    // Minimum sepet tutarı kontrolü
    if (cartTotal < coupon.min_cart_amount) {
      return NextResponse.json({ error: `Bu kupon minimum ${coupon.min_cart_amount} TL alışverişlerde geçerlidir.` }, { status: 400 });
    }

    // Sadece ilk siparişe özel kupon kontrolü
    if (coupon.is_first_order_only && !isFirstOrder) {
      return NextResponse.json({ error: "Bu kupon sadece ilk alışverişinizde geçerlidir." }, { status: 400 });
    }

    return NextResponse.json({ success: true, discountAmount: Number(coupon.discount_amount) });

  } catch (error: any) {
    console.error("Kupon doğrulama hatası:", error);
    return NextResponse.json({ error: "Kupon doğrulanamadı, sunucu hatası." }, { status: 500 });
  }
}
