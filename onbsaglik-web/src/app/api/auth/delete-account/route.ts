import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';

export async function POST(req: Request) {
  try {
    let session = await getServerSession(authOptions);
    let userEmail = session?.user?.email?.trim().toLowerCase();

    // Body'den de email ve confirmation gönderilmiş olabilir
    try {
      const body = await req.json();
      if (!userEmail && body?.email) {
        userEmail = String(body.email).trim().toLowerCase();
      }
    } catch {
      // Body boş olabilir
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Oturum bilgisi bulunamadı. Lütfen giriş yapınız.' },
        { status: 401 }
      );
    }

    const supabase = getServiceSupabase();

    // 1. Supabase Auth kullanıcı listesinden e-postaya ait kullanıcıyı bul
    const { data, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (listError) {
      console.error('Kullanıcı listesi alınamadı:', listError);
      return NextResponse.json(
        { error: 'Kullanıcı veritabanına erişilemedi.' },
        { status: 500 }
      );
    }

    const targetUser = data?.users?.find(
      (u) => u.email?.trim().toLowerCase() === userEmail
    );

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Veritabanında bu e-postaya ait kullanıcı kaydı bulunamadı.' },
        { status: 404 }
      );
    }

    // 2. Supabase Auth'tan kullanıcıyı tamamen sil
    const { error: deleteError } = await supabase.auth.admin.deleteUser(targetUser.id);

    if (deleteError) {
      console.error('Kullanıcı auth silme hatası:', deleteError);
      return NextResponse.json(
        { error: 'Hesap silinirken bir hata oluştu: ' + deleteError.message },
        { status: 500 }
      );
    }

    // 3. Veritabanında favoriler veya kullanıcı tabloları varsa temizle
    try {
      await supabase.from('favorites').delete().eq('user_id', targetUser.id);
    } catch (e) {
      // Tablo yoksa sorun yok
    }

    try {
      await supabase.from('user_profiles').delete().eq('user_id', targetUser.id);
    } catch (e) {
      // Tablo yoksa sorun yok
    }

    return NextResponse.json({
      success: true,
      message: 'Hesabınız ve tüm verileriniz veritabanından başarıyla silindi.',
    });
  } catch (error: any) {
    console.error('Hesap silme genel hata:', error);
    return NextResponse.json(
      { error: error.message || 'Hesap silinirken beklenmeyen bir hata oluştu.' },
      { status: 500 }
    );
  }
}
