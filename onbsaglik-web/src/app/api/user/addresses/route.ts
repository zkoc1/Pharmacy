import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("user_email", session.user.email)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ addresses: data || [] });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await req.json();
  const { title, full_name, phone, city, district, address_line, is_default } = body;

  if (!title || !full_name || !phone || !city || !district || !address_line) {
    return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
  }

  // Eğer is_default true ise, kullanıcının diğer adreslerinin varsayılanlığını kaldır
  if (is_default) {
    await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_email", session.user.email);
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .insert({
      user_email: session.user.email,
      title,
      full_name,
      phone,
      city,
      district,
      address_line,
      is_default: is_default || false
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, address: data });
}

