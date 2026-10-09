import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'İptal ve İade Koşulları | OnbSağlık',
  description: 'OnbSağlık sipariş iptal ve iade süreçleri, cayma hakkı ve geri ödeme prosedürü.',
};

export default function IadeKosullari() {
  return (
    <div className="container-custom py-10 max-w-4xl mx-auto">
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-100 shadow-sm space-y-6 text-gray-700 text-sm leading-relaxed">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 border-b pb-4">
          İPTAL VE İADE KOŞULLARI
        </h1>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">1. Sipariş İptali</h2>
          <p>
            Henüz kargoya teslim edilmemiş siparişlerinizi, web sitemizdeki <Link href="/hesabim/siparislerim" className="text-emerald-600 underline font-semibold">Siparişlerim</Link> ekranından veya <strong>saglikonb@gmail.com</strong> e-posta adresimiz üzerinden müşteri hizmetlerimize bildirerek anında iptal edebilirsiniz.
          </p>
          <p>
            Siparişiniz kargoya verilmişse iptal işlemi yapılamaz; ürün tarafınıza ulaştıktan sonra 14 gün içinde yasal iade sürecini başlatabilirsiniz.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">2. 14 Günlük İade Hakkı</h2>
          <p>
            Tüketicinin Korunması Hakkında Kanun uyarınca, teslim aldığınız tarihten itibaren <strong>14 gün içinde</strong> herhangi bir gerekçe göstermeksizin ürünleri iade etme hakkına sahipsiniz.
          </p>
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-900">
            <h3 className="font-bold text-sm mb-1">İade Kabul Şartları:</h3>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
              <li>Ürün orijinal ambalajında, kutusu ve faturası ile birlikte gönderilmelidir.</li>
              <li>Ürünün koruma bandı, jelatini veya güvenlik mührü açılmamış olmalıdır.</li>
              <li>Dermokozmetik, cilt bakımı ve takviye edici gıdalarda hijyen ve sağlık gerekçesiyle açılmış/kullanılmış ürünler iade alınamaz.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">3. Hasarlı veya Kusurlu Ürünler</h2>
          <p>
            Kargo teslimatı sırasında paketin hasarlı, yırtık veya ezilmiş olduğunu fark ederseniz kargo görevlisine <strong>Hasar Tespit Tutanağı</strong> tutturunuz ve paketi teslim almayınız. Hasarlı ürünlerin değişimi veya ücret iadesi derhal ücretsiz olarak yapılmaktadır.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">4. Para İadesi Süreci</h2>
          <p>
            İade ettiğiniz ürün depomuza ulaşıp uzman ekibimiz tarafından kontrol edildikten sonra (en geç 2 iş günü), onaylanan iadelerin tutarı ödeme yaptığınız kredi kartı / banka hesabınıza iade edilir. Bankanızın süreçlerine bağlı olarak tutarın ekstrenize yansıması 2-5 iş günü sürebilir.
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <h3 className="font-bold text-gray-900">İade Adresi & Destek:</h3>
          <p><strong>İade Kabul:</strong> Kayseri / Türkiye (Müşteri Desteği ile Anlaşmalı Kargo Kodu Alınız)</p>
          <p><strong>E-posta:</strong> saglikonb@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
