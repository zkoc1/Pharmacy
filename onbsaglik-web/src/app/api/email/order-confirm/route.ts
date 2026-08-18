/**
 * Sipariş onay e-postası API — POST /api/email/order-confirm
 * Resend ile HTML e-posta gönderir.
 * Belge: https://resend.com/docs
 */
import { NextResponse } from 'next/server';

interface OrderEmailPayload {
  to: string;
  customerName: string;
  orderId: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}

function buildOrderHtml(data: OrderEmailPayload): string {
  const rows = data.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#1e293b;font-size:14px">${i.name}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#475569;font-size:14px">${i.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;color:#1e293b;font-size:14px">${i.price.toFixed(2)} TL</td>
        </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Siparişiniz Alındı</title>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background-color:#f8fafc;color:#1e293b;">
  <div style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;padding:32px;box-shadow:0 4px 16px rgba(0,0,0,0.05);">
    
    <div style="background:linear-gradient(135deg, #10b981 0%, #059669 100%);padding:28px 20px;border-radius:12px;text-align:center;margin-bottom:24px;">
      <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">✅ Siparişiniz Alındı!</h1>
      <p style="color:#e6fffa;margin:8px 0 0;font-size:14px;">OnbSağlık'ı tercih ettiğiniz için teşekkür ederiz.</p>
    </div>

    <p style="font-size:15px;margin:0 0 12px;">Merhaba <strong>${data.customerName}</strong>,</p>
    <p style="font-size:14px;color:#475569;margin:0 0 20px;line-height:1.6;">
      Siparişiniz başarıyla oluşturuldu ve hazırlanmaya başlandı. Sipariş numaranız: <span style="font-weight:700;color:#10b981;font-family:monospace;font-size:15px;">${data.orderId}</span>
    </p>

    <h3 style="font-size:15px;margin:24px 0 12px;color:#0f172a;border-bottom:2px solid #f1f5f9;padding-bottom:8px;">Sipariş Özeti</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <thead>
        <tr style="background:#f8fafc;">
          <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:1px solid #e2e8f0;">Ürün</th>
          <th style="padding:10px 12px;text-align:center;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:1px solid #e2e8f0;">Adet</th>
          <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:1px solid #e2e8f0;">Fiyat</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div style="background:#f8fafc;padding:16px 20px;border-radius:10px;border:1px solid #e2e8f0;text-align:right;margin-bottom:24px;">
      <span style="font-size:14px;color:#64748b;margin-right:12px;">Genel Toplam:</span>
      <strong style="font-size:20px;color:#10b981;">${data.total.toFixed(2)} TL</strong>
    </div>

    <div style="background:#ecfdf5;border:1px solid #a7f3d0;padding:16px;border-radius:8px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#065f46;line-height:1.5;">
        📦 <strong>Kargo Bilgisi:</strong> Siparişiniz kargoya verildiğinde takip numarası içeren ikinci bir bilgilendirme e-postası alacaksınız.
      </p>
    </div>

    <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
      Herhangi bir sorunuz olursa lütfen bizimle iletişime geçmekten çekinmeyin:<br>
      E-posta: <a href="mailto:saglikonb@gmail.com" style="color:#10b981;text-decoration:none;font-weight:600;">saglikonb@gmail.com</a>
    </p>

    <div style="text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:12px;margin:0 0 4px;">© 2024 OnbSağlık | Tüm hakları saklıdır.</p>
      <a href="https://onbsaglik.com" style="color:#10b981;font-size:12px;text-decoration:none;font-weight:600;">onbsaglik.com</a>
    </div>

  </div>
</body>
</html>`;
}

export async function POST(req: Request) {
  try {
    const data: OrderEmailPayload = await req.json();

    if (!data.to || !data.orderId) {
      return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // API key yoksa loglayip başarılı dön (canliya alinca çalışır)
      console.log('[Email] RESEND_API_KEY yok — e-posta gönderilmedi:', data.to);
      return NextResponse.json({ success: true, skipped: true });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'OnbSağlık <noreply@onbsaglik.com>',
        to: [data.to],
        subject: `Siparişiniz Alındı — ${data.orderId}`,
        html: buildOrderHtml(data),
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('[Resend] Hata:', err);
      return NextResponse.json({ error: 'E-posta gönderilemedi' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[email] Hata:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
