import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, phone, email, password } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Tüm zorunlu alanları doldurun.' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // 1. Supabase Auth'a kaydet (Admin API) - Otomatik doğrulama
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Direkt onaylı kullanıcı
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
      }
    });

    if (authError) {
      console.error('Kayıt hatası:', authError);
      let errorMessage = authError.message;
      if (errorMessage.toLowerCase().includes('already been registered')) {
        errorMessage = 'Bu e-posta adresi sistemde zaten kayıtlı.';
      }
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // 2. Hoşgeldin E-postası Gönder (Doğrulama linki olmadan)
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #059669; text-align: center;">OnbSağlık'a Hoş Geldiniz!</h2>
        <p>Merhaba <strong>${firstName} ${lastName}</strong>,</p>
        <p>Üyeliğiniz başarıyla oluşturulmuştur. Artık sitemiz üzerinden güvenle alışveriş yapabilir, siparişlerinizi takip edebilirsiniz.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://onbsaglik.com.tr" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Alışverişe Başla
          </a>
        </div>
        <p style="font-size: 12px; color: #666; text-align: center;">Bizi tercih ettiğiniz için teşekkür ederiz.</p>
      </div>
    `;

    // Arka planda gönder (kullanıcıyı bekletmemek için await kullanılmıyor veya hata ignore ediliyor)
    sendEmail({
      to: email,
      subject: 'OnbSağlık - Üyeliğiniz Başarıyla Oluşturuldu',
      html,
    }).catch(console.error);

    return NextResponse.json({ success: true, user: authData.user });

  } catch (error: any) {
    console.error('Kayıt API hatası:', error);
    return NextResponse.json({ error: 'Kayıt sırasında beklenmeyen bir hata oluştu.' }, { status: 500 });
  }
}
