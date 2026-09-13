import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const targetUser = users.find(u => u.email === session.user.email);
    if (!targetUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ success: true, metadata: targetUser.user_metadata });
  } catch (error: any) {
    return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, phone, tcNo, address, gender } = body;

    const supabase = getServiceSupabase();

    // Find the user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const targetUser = users.find(u => u.email === session.user.email);
    if (!targetUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Update user metadata
    const { data, error } = await supabase.auth.admin.updateUserById(targetUser.id, {
      user_metadata: {
        ...targetUser.user_metadata,
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        tc_no: tcNo,
        address: address,
        gender: gender
      }
    });

    if (error) {
      console.error('Güncelleme hatası:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: data.user });

  } catch (error: any) {
    console.error('Profil güncelleme hatası:', error);
    return NextResponse.json({ error: 'Güncelleme sırasında beklenmeyen bir hata oluştu.' }, { status: 500 });
  }
}