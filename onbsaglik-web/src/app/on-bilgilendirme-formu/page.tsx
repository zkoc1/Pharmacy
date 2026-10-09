import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ön Bilgilendirme Formu | OnbSağlık',
  description: 'OnbSağlık ön bilgilendirme formu ve sipariş yasal şartları.',
};

export default function OnBilgilendirmeFormu() {
  return (
    <div className="container-custom py-10 max-w-4xl mx-auto">
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-100 shadow-sm space-y-6 text-gray-700 text-sm leading-relaxed">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 border-b pb-4">
          ÖN BİLGİLENDİRME FORMU
        </h1>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">1. SATICI BİLGİLERİ</h2>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-1">
            <p><strong>Firma Unvanı:</strong> ONB Sağlık E-Ticaret</p>
            <p><strong>Açık Adres:</strong> Yeni Mahalle 12. Cadde Toktay Apartmanı No:95/4 Kocasinan / KAYSERİ</p>
            <p><strong>E-posta:</strong> saglikonb@gmail.com</p>
            <p><strong>Müşteri Hizmetleri:</strong> info@onbsaglik.com.tr / saglikonb@gmail.com</p>
            <p><strong>Web Sitesi:</strong> https://onbsaglik.com.tr</p>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">2. SÖZLEŞME KONUSU ÜRÜNÜN TEMEL NİTELİKLERİ VE FİYATI</h2>
          <p>
            Ürünün cinsi, türü, miktarı, marka/modeli, rengi ve vergiler dahil satış fiyatı internet sitesindeki ürün detay sayfasında ve sipariş onay ekranında yer almaktadır. Sitemizdeki tüm ürün fiyatlarına KDV dahildir.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">3. ÖDEME VE TESLİMAT ŞARTLARI</h2>
          <p>
            Ödeme, kredi kartı veya banka kartı ile güvenli 3D Secure altyapısı kullanılarak ya da Havale/EFT ile yapılabilir. Sipariş tutarı tahsil edildikten sonra ürünler anlaşmalı kargo firmaları aracılığıyla ALICI&apos;nın belirttiği adrese gönderilir. Kargo takip numarası sipariş kargoya verildiğinde e-posta ve sipariş takip ekranı üzerinden ALICI ile paylaşılır.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">4. CAYMA HAKKI VE İADE PROSEDÜRÜ</h2>
          <p>
            ALICI, 14 (on dört) gün içerisinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. İade için ürünün orijinal ambalajının açılmamış, bozulmamış ve ürünün kullanılmamış olması şarttır.
          </p>
          <p>
            İade bildirimleri saglikonb@gmail.com adresine yazılı olarak veya site üzerinden İade Talep formu aracılığıyla yapılmalıdır.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">5. ŞİKAYET VE İTİRAZLAR</h2>
          <p>
            Tüketici, şikayet ve itirazları konusunda başvurularını, Ticaret Bakanlığı&apos;nca her yıl Aralık ayında belirlenen parasal sınırlar dahilinde tüketicinin mal veya hizmeti satın aldığı veya ikametgahının bulunduğu yerdeki Tüketici Sorunları Hakem Heyetine veya Tüketici Mahkemesine yapabilir.
          </p>
        </div>
      </div>
    </div>
  );
}
