import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mesafeli Satış Sözleşmesi | OnbSağlık',
  description: 'OnbSağlık mesafeli satış sözleşmesi, tüketici hakları ve yasal şartlar.',
};

export default function MesafeliSatisSozlesmesi() {
  return (
    <div className="container-custom py-10 max-w-4xl mx-auto">
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-100 shadow-sm space-y-6 text-gray-700 text-sm leading-relaxed">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 border-b pb-4">
          MESAFELİ SATIŞ SÖZLEŞMESİ
        </h1>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">MADDE 1 – TARAFLAR</h2>
          <div>
            <h3 className="font-semibold text-gray-800">1.1. SATICI:</h3>
            <p><strong>Unvan:</strong> ONB Sağlık E-Ticaret</p>
            <p><strong>Konum:</strong> Kayseri / Türkiye</p>
            <p><strong>E-posta:</strong> saglikonb@gmail.com</p>
            <p><strong>Web:</strong> https://onbsaglik.com.tr</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">1.2. ALICI:</h3>
            <p>
              www.onbsaglik.com.tr internet sitesi üzerinden sipariş veren, sipariş formunda belirtilen kişi ve adrestir.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">MADDE 2 – KONU</h2>
          <p>
            İşbu sözleşmenin konusu, ALICI&apos;nın SATICI&apos;ya ait www.onbsaglik.com.tr internet sitesinden elektronik ortamda siparişini yaptığı aşağıda nitelikleri ve satış fiyatı belirtilen ürünün satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">MADDE 3 – SÖZLEŞME KONUSU ÜRÜN VE ÖDEME</h2>
          <p>
            Ürünlerin cinsi, miktarı, marka/modeli, rengi ve tüm vergiler dahil satış bedeli, sitede ilan edilen ve sipariş özetinde gösterilen tutardır. Ödeme kredi kartı, banka kartı (3D Secure) veya havale/EFT yöntemi ile güvenli altyapı üzerinden tahsil edilir.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">MADDE 4 – TESLİMAT VE KARGO</h2>
          <p>
            Ürün, ALICI&apos;nın sipariş formunda belirttiği teslimat adresine anlaşmalı kargo firmaları (HepsiJet, PTT Kargo vb.) aracılığıyla yasal 30 günlük süreyi aşmamak koşulu ile teslim edilir. Siparişler genellikle 1-3 iş günü içerisinde kargoya teslim edilmektedir. 500 TL ve üzeri siparişlerde kargo ücretsizdir.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">MADDE 5 – CAYMA HAKKI</h2>
          <p>
            ALICI, sözleşme konusu ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa tesliminden itibaren 14 (on dört) gün içinde hiçbir gerekçe göstermeksizin cayma hakkını kullanabilir.
          </p>
          <p className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-900 text-xs">
            <strong>Cayma Hakkının Kullanılamayacağı Haller:</strong> Sağlık ve hijyen açısından ambalajı, mührü, bandı açılmış kozmetik, dermokozmetik ve kişisel bakım ürünleri ile takviye edici gıdalarda Mesafeli Sözleşmeler Yönetmeliği uyarınca cayma hakkı kullanılamaz. Ambalajı bozulmamış, açılmamış ve son kullanma tarihi geçerli ürünler iade kapsamındadır.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">MADDE 6 – UYUŞMAZLIKLARIN ÇÖZÜMÜ</h2>
          <p>
            İşbu sözleşmenin uygulanmasında, Ticaret Bakanlığı&apos;nca ilan edilen değere kadar Tüketici Hakem Heyetleri ile ALICI&apos;nın veya SATICI&apos;nın yerleşim yerindeki Tüketici Mahkemeleri yetkilidir.
          </p>
        </div>

        <div className="pt-4 border-t text-xs text-gray-500">
          Son Güncelleme: 2026. ALICI, internet sitesi üzerinden sipariş verdiğinde bu sözleşmenin tüm maddelerini kabul etmiş sayılır.
        </div>
      </div>
    </div>
  );
}
