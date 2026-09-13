import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getServiceSupabase();
  const { data: countData, error: countError } = await supabase.from("products").select("status", { count: "exact" });
  
  if (countError) return NextResponse.json({ error: countError.message });
  
  const statuses = countData.reduce((acc: any, curr: any) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});

  const { data: first5 } = await supabase.from("products").select("name, brand, category, status").limit(5);

  return NextResponse.json({ statuses, first5 });
}
