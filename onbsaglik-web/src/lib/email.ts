import nodemailer from "nodemailer";

/**
 * E-posta Gönderme Servisi
 * Çevresel değişkenler (Environment Variables) Vercel'den veya .env dosyasından okunur.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  // Gmail için varsayılan ayarlar
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn("SMTP_USER veya SMTP_PASS tanımlı değil. E-posta gönderilmedi:", subject);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465 ise true, 587 ise false
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"OnbSağlık" <${user}>`,
      to,
      subject,
      html,
    });

    console.log(`[E-posta Gönderildi] ${to} - ${subject} (${info.messageId})`);
    return true;
  } catch (error) {
    console.error("[E-posta Hatası] Gönderim başarısız:", error);
    return false;
  }
}
