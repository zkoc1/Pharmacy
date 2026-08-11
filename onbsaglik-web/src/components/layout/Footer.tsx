// Server Component - Statik footer içeriği
import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#064e3b] text-emerald-50 pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo ve Hakkında */}
          <div>
            <div className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="bg-emerald-500 p-2 rounded-lg inline-block">OnbSağlık 🌿</span>
            </div>
            <p className="text-emerald-100/80 text-sm leading-relaxed mb-6">
              Sağlığınız ve güzelliğiniz için en güvenilir markaları, en uygun fiyatlarla kapınıza getiriyoruz. Müşteri memnuniyeti odaklı hizmet anlayışımızla yanınızdayız.
            </p>
          </div>

          {/* Kategoriler */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Kategoriler</h3>
            <ul className="space-y-2 text-sm text-emerald-100/80">
              <li><Link href="/kategori/vitamin-ve-takviye" className="hover:text-white transition-colors">Vitamin & Takviye</Link></li>
              <li><Link href="/kategori/gunes-bakimi" className="hover:text-white transition-colors">Güneş Bakımı</Link></li>
              <li><Link href="/kategori/sac-bakimi" className="hover:text-white transition-colors">Saç Bakımı</Link></li>
              <li><Link href="/kategori/cilt-bakimi" className="hover:text-white transition-colors">Cilt Bakımı</Link></li>
              <li><Link href="/kategori/anne-bebek" className="hover:text-white transition-colors">Anne & Bebek</Link></li>
              <li><Link href="/urunler" className="hover:text-white transition-colors">Tüm Ürünler</Link></li>
            </ul>
          </div>

          {/* Müşteri Hizmetleri */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Müşteri Hizmetleri</h3>
            <ul className="space-y-2 text-sm text-emerald-100/80">
              <li><Link href="/hakkimizda" className="hover:text-white transition-colors">Hakkımızda</Link></li>
              <li><Link href="/iletisim" className="hover:text-white transition-colors">İletişim</Link></li>
              <li><Link href="/sepet" className="hover:text-white transition-colors">Alışveriş Sepeti</Link></li>
              <li><Link href="/kargo-ve-teslimat" className="hover:text-white transition-colors">Kargo ve Teslimat</Link></li>
              <li><Link href="/iade-kosullari" className="hover:text-white transition-colors">İade Koşulları</Link></li>
              <li><Link href="/gizlilik-politikasi" className="hover:text-white transition-colors">Gizlilik Politikası</Link></li>
            </ul>
          </div>

          {/* İletişim & Sosyal Medya */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Bizi Takip Edin</h3>
            <div className="flex flex-col space-y-3 text-sm text-emerald-100/80">
              <a href="https://www.instagram.com/onbsaglik" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                📸 Instagram
              </a>
              <a href="https://github.com/zkoc1" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                🐙 GitHub
              </a>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-white mb-2">Güvenli Alışveriş</h4>
              <div className="flex gap-2 text-xs font-mono text-emerald-200">
                <span className="border border-emerald-700 px-2 py-1 rounded bg-emerald-800/50">iyzico</span>
                <span className="border border-emerald-700 px-2 py-1 rounded bg-emerald-800/50">SSL</span>
                <span className="border border-emerald-700 px-2 py-1 rounded bg-emerald-800/50">3D Secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alt Kısım */}
        <div className="border-t border-emerald-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-emerald-200/60">
          <p>© 2024 onbsaglik.com. Tüm hakları saklıdır.</p>
          <p>
            Developed by <a href="https://github.com/zkoc1" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-white transition-colors">zkoc1</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
