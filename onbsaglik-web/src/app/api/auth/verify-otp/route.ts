
import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { email, token } = await req.json();
    if (!email || !token) return NextResponse.json({ error: "Email and token are required" }, { status: 400 });

    const supabase = getServiceSupabase();
    
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "recovery"
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

