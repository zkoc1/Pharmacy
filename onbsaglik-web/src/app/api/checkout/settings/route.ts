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
      // Veritabanında ayar yoksa fallback değerler döndür
      return NextResponse.json({
        freeShippingThreshold: 3000,
        shippingCost: 49.90,
      });
    }

    return NextResponse.json({
      freeShippingThreshold: Number(settings.free_shipping_threshold),
      shippingCost: Number(settings.shipping_cost),
    });

  } catch (error: any) {
    // Hata durumunda varsayılan (fallback) değerler dönülsün, checkout kilitlenmesin
    return NextResponse.json({
      freeShippingThreshold: 3000,
      shippingCost: 49.90,
    });
  }
}
