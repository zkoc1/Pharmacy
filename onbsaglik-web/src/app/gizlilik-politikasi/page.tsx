import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası ve KVKK | OnbSağlık',
  description: 'OnbSağlık kişisel verilerin korunması kanunu (KVKK) aydınlatma metni ve gizlilik politikası.',
};

export default function GizlilikPolitikasi() {
  return (
    <div className="container-custom py-10 max-w-4xl mx-auto">
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-100 shadow-sm space-y-6 text-gray-700 text-sm leading-relaxed">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 border-b pb-4">
          GİZLİLİK POLİTİKASI VE KVKK AYDINLATMA METNİ
        </h1>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">1. Veri Sorumlusu</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla <strong>ONB Sağlık E-Ticaret</strong> tarafından işbu metinde belirtilen kapsamda işlenmektedir.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">2. İşlenen Kişisel Verileriniz ve İşlenme Amaçları</h2>
          <p>
            Web sitemiz üzerinden sipariş oluştururken, üye olurken veya iletişim kurarken paylaştığınız ad, soyad, telefon numarası, teslimat ve fatura adresi, e-posta adresi gibi kişisel verileriniz:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Siparişlerinizin alınması, paketlenmesi ve kargolanması,</li>
            <li>Mesafeli satış sözleşmesinin ifası ve yasal muhasebe/fatura yükümlülüklerinin yerine getirilmesi,</li>
            <li>Müşteri memnuniyetinin sağlanması ve satış sonrası destek hizmetlerinin sunulması amaçlarıyla işlenmektedir.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">3. Kredi Kartı ve Ödeme Güvenliği (256-Bit SSL & 3D Secure)</h2>
          <p>
            OnbSağlık web sitesinde kredi kartı bilgileriniz <strong>kesinlikle sunucularımızda saklanmaz veya kaydedilmez</strong>.
          </p>
          <p>
            Ödeme işlemleriniz, BDDK ve TCMB lisanslı banka ve ödeme kuruluşlarının 256-Bit SSL şifrelemeli <strong>3D Secure</strong> güvenli ortak ödeme sayfası üzerinden doğrudan bankanız ile sizin aranızda gerçekleşir.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">4. Kişisel Verilerin Aktarılması</h2>
          <p>
            Kişisel verileriniz, siparişin teslim edilmesi amacıyla anlaşmalı kargo firmalarına, yasal zorunluluklar halinde ise yetkili kamu kurum ve kuruluşlarına kanuna uygun olarak aktarılabilir. Verileriniz hiçbir ticari amaçla üçüncü şahıslara satılmaz veya paylaşılmaz.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">5. KVKK Madde 11 Kapsamındaki Haklarınız</h2>
          <p>
            Dilediğiniz zaman kişisel verilerinizin işlenip işlenmediğini öğrenme, yanlış ise düzeltilmesini isteme, silinmesini veya yok edilmesini talep etme hakkına sahipsiniz. Başvurularınızı <strong>saglikonb@gmail.com</strong> adresine iletebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
