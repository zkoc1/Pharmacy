import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getServiceSupabase();

    const { data: settings, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error || !settings) {
      // Veritabanında ayar yoksa fallback 500 TL döndür
      return NextResponse.json({
        freeShippingThreshold: 500,
        shippingCost: 49.90,
      });
    }

    let threshold = Number(settings.free_shipping_threshold);
    // 500 TL ve üzeri ücretsiz kargo kuralı (eski 3000 TL değerini otomatik 500'e güncelle)
    if (isNaN(threshold) || threshold <= 0 || threshold >= 3000) {
      threshold = 500;
      supabase.from("settings").update({ free_shipping_threshold: 500 }).eq("id", 1).then(() => {});
    }

    return NextResponse.json({
      freeShippingThreshold: threshold,
      shippingCost: Number(settings.shipping_cost) || 49.90,
    });

  } catch (error: any) {
    // Hata durumunda varsayılan (fallback) değerler dönülsün, checkout kilitlenmesin
    return NextResponse.json({
      freeShippingThreshold: 500,
      shippingCost: 49.90,
    });
  }
}
