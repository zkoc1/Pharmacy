import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kargo ve Teslimat Bilgileri | OnbSağlık',
  description: 'OnbSağlık kargo teslimat süreleri, ücretsiz kargo şartları ve kargo takip süreçleri.',
};

export default function KargoVeTeslimat() {
  return (
    <div className="container-custom py-10 max-w-4xl mx-auto">
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-100 shadow-sm space-y-6 text-gray-700 text-sm leading-relaxed">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 border-b pb-4">
          KARGO VE TESLİMAT BİLGİLERİ
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
            <span className="text-2xl block mb-1">🚚</span>
            <strong className="text-emerald-900 block text-sm">500 TL Üzeri</strong>
            <span className="text-emerald-700 text-xs">ÜCRETSİZ KARGO</span>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
            <span className="text-2xl block mb-1">⚡</span>
            <strong className="text-blue-900 block text-sm">Hızlı Kargo</strong>
            <span className="text-blue-700 text-xs">Aynı Gün / 24 Saatte Kargoda</span>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
            <span className="text-2xl block mb-1">📦</span>
            <strong className="text-purple-900 block text-sm">Özenli Paketleme</strong>
            <span className="text-purple-700 text-xs">Kırılmaya Karşı Güvenli Ambalaj</span>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">1. Teslimat Süresi</h2>
          <p>
            Hafta içi saat 15:00&apos;e kadar verilen siparişler aynı gün veya en geç 1 iş günü içerisinde özenle hazırlanarak kargo firmasına teslim edilir. Kargo teslimat süresi teslimat adresinin il ve ilçesine göre 1 ile 3 iş günü arasında değişmektedir.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">2. Kargo Ücretlendirmesi</h2>
          <p>
            Sepet tutarınız <strong>500 TL ve üzerinde</strong> olduğunda Türkiye&apos;nin her yerine kargo <strong>tamamen ücretsizdir</strong>. 500 TL altındaki siparişlerde standart anlaşmalı indirimli kargo bedeli uygulanır.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">3. Kargo Takibi</h2>
          <p>
            Siparişiniz kargoya teslim edildiğinde sistemimize kayıtlı e-posta ve telefon numaranıza kargo takip numarası gönderilir. Ayrıca sitemiz üzerinden <strong className="text-emerald-600">Hesabım &gt; Siparişlerim</strong> sekmesinden siparişinizin anlık kargo durumunu ve kurye hareketlerini takip edebilirsiniz.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">4. Teslim Alırken Dikkat Edilmesi Gerekenler</h2>
          <p>
            Lütfen kargonuzu teslim alırken dış paketin ezik, ıslak veya yırtık olup olmadığını kontrol ediniz. Eğer hasar varsa kargo kuryesine tutanak tutturarak ürünü kabul etmeyiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
