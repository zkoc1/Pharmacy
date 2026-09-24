"use client";
// Server Component - Statik footer içeriği
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail } from 'lucide-react';

const InstagramSvg = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

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
            <h3 className="text-lg font-semibold text-white mb-4">İletişim</h3>
            <div className="flex flex-col space-y-3 text-sm text-emerald-100/80">
              <a
                href="mailto:saglikonb@gmail.com"
                className="hover:text-white transition-colors flex items-center gap-2 group"
              >
                <Mail size={16} className="text-emerald-400 shrink-0 group-hover:text-white transition-colors" />
                <span>saglikonb@gmail.com</span>
              </a>
              <a
                href="https://www.instagram.com/onbsaglik"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-2 group"
              >
                <InstagramSvg size={16} />
                <span>Instagram (@onbsaglik)</span>
              </a>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-white mb-2">Güvenli Alışveriş</h4>
              <div className="flex gap-2 text-xs font-mono text-emerald-200">
                <span className="border border-emerald-700 px-2 py-1 rounded bg-emerald-800/50">PayTR</span>
                <span className="border border-emerald-700 px-2 py-1 rounded bg-emerald-800/50">SSL</span>
                <span className="border border-emerald-700 px-2 py-1 rounded bg-emerald-800/50">3D Secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alt Kısım */}
        <div className="border-t border-emerald-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-emerald-200/60">
          <p>© 2024 onbsaglik.com.tr. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
