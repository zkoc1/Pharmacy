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

    // 1. Supabase Auth'a kaydet (Admin API)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: false, // E-posta henüz doğrulanmadı
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

    // 2. Özel E-posta Doğrulama Linki Oluştur
    // Normalde Supabase bunu kendi gönderir ama özel e-posta adresinden göndermek istiyoruz.
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: email,
      password: password,
    });

    if (linkError) {
      console.error('Link oluşturma hatası:', linkError);
    } else {
      // 3. E-postayı gönder (Nodemailer ile)
      const actionLink = linkData.properties?.action_link;
      if (actionLink) {
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #059669; text-align: center;">OnbSağlık'a Hoş Geldiniz!</h2>
            <p>Merhaba <strong>${firstName} ${lastName}</strong>,</p>
            <p>Üyeliğinizi tamamlamak ve e-posta adresinizi doğrulamak için lütfen aşağıdaki butona tıklayın:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${actionLink}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Hesabımı Doğrula
              </a>
            </div>
            <p style="font-size: 12px; color: #666; text-align: center;">Bu e-postayı siz talep etmediyseniz, lütfen dikkate almayın.</p>
          </div>
        `;

        await sendEmail({
          to: email,
          subject: 'OnbSağlık - Üyeliğinizi Doğrulayın',
          html,
        });
      }
    }

    return NextResponse.json({ success: true, user: authData.user });

  } catch (error: any) {
    console.error('Kayıt API hatası:', error);
    return NextResponse.json({ error: 'Kayıt sırasında beklenmeyen bir hata oluştu.' }, { status: 500 });
  }
}
