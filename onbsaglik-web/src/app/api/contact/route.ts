import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { name, email, phone, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Eksik bilgi girdiniz." }, { status: 400 });
    }

    const htmlContent = `
      <h2>Yeni İletişim Formu Mesajı</h2>
      <p><strong>Gönderen:</strong> ${name}</p>
      <p><strong>E-posta:</strong> ${email}</p>
      <p><strong>Telefon:</strong> ${phone || "Belirtilmemiş"}</p>
      <p><strong>Konu:</strong> ${subject}</p>
      <hr />
      <p><strong>Mesaj:</strong></p>
      <p>${message}</p>
    `;

    // Maili admin'e gönder
    // Eğer admin emaili ayrıysa SMTP_USER yerine başka bir adres konabilir, şu an SMTP_USER'a gönderiyoruz
    const adminEmail = process.env.SMTP_USER;
    
    if (!adminEmail) {
      return NextResponse.json({ error: "E-posta yapılandırması eksik." }, { status: 500 });
    }

    const success = await sendEmail({
      to: adminEmail,
      subject: `İletişim Formu: ${subject} - ${name}`,
      html: htmlContent,
    });

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "E-posta gönderilemedi." }, { status: 500 });
    }
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
