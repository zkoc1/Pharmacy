
import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

    const supabase = getServiceSupabase();
    
    // Find user by email
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) return NextResponse.json({ error: listError.message }, { status: 400 });

    const user = usersData.users.find((u: any) => u.email === email);
    if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { password });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

