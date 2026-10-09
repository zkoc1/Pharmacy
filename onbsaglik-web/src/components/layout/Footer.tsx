"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, MapPin, Phone, ShieldCheck, Lock } from 'lucide-react';

const InstagramSvg = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-[#064e3b] text-emerald-50 pt-14 pb-8 mt-auto border-t-2 border-emerald-700/50">
      <div className="container-custom">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo ve Hakkında */}
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-black text-white flex items-center gap-2 text-decoration-none">
              <span className="bg-emerald-500 p-2 rounded-xl inline-flex items-center justify-center shadow-xs">🌿</span>
              <span>OnbSağlık</span>
            </Link>
            <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed">
              15 yıllık tecrübemiz ve eczane güvencemizle; orijinal dermokozmetik, vitamin ve takviye edici gıdaları en uygun fiyat garantisiyle kapınıza ulaştırıyoruz.
            </p>
            <div className="pt-2 text-xs text-emerald-200/90 space-y-1.5 border-t border-emerald-800/80">
              <p className="flex items-center gap-1.5">
                <Mail size={15} className="shrink-0 text-amber-400" />
                <a href="mailto:saglikonb@gmail.com" className="hover:text-white transition-colors">saglikonb@gmail.com</a>
              </p>
            </div>
          </div>

          {/* Kategoriler */}
          <div>
            <h3 className="text-base font-bold text-white mb-3 sm:mb-4 border-b border-emerald-800/60 pb-2">
              Kategoriler
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-emerald-100/80">
              <li><Link href="/kategori/vitamin-ve-takviye" className="hover:text-white transition-colors">Vitamin & Takviye</Link></li>
              <li><Link href="/kategori/gunes-bakimi" className="hover:text-white transition-colors">Güneş Bakımı</Link></li>
              <li><Link href="/kategori/sac-bakimi" className="hover:text-white transition-colors">Saç Bakımı</Link></li>
              <li><Link href="/kategori/cilt-bakimi" className="hover:text-white transition-colors">Cilt Bakımı</Link></li>
              <li><Link href="/kategori/anne-bebek" className="hover:text-white transition-colors">Anne & Bebek</Link></li>
              <li><Link href="/urunler" className="hover:text-white transition-colors font-semibold text-amber-300">Tüm Ürünler →</Link></li>
            </ul>
          </div>

          {/* Yasal & Müşteri Hizmetleri (Banka Denetimi İçin Zorunlu) */}
          <div>
            <h3 className="text-base font-bold text-white mb-3 sm:mb-4 border-b border-emerald-800/60 pb-2">
              Kurumsal & Yasal
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-emerald-100/80">
              <li><Link href="/mesafeli-satis-sozlesmesi" className="hover:text-white transition-colors">Mesafeli Satış Sözleşmesi</Link></li>
              <li><Link href="/on-bilgilendirme-formu" className="hover:text-white transition-colors">Ön Bilgilendirme Formu</Link></li>
              <li><Link href="/iade-kosullari" className="hover:text-white transition-colors">İptal ve İade Koşulları</Link></li>
              <li><Link href="/gizlilik-politikasi" className="hover:text-white transition-colors">Gizlilik ve KVKK Politikası</Link></li>
              <li><Link href="/kargo-ve-teslimat" className="hover:text-white transition-colors">Kargo ve Teslimat</Link></li>
              <li><Link href="/hakkimizda" className="hover:text-white transition-colors">Hakkımızda</Link></li>
              <li><Link href="/iletisim" className="hover:text-white transition-colors">İletişim</Link></li>
            </ul>
          </div>

          {/* Güvenli Ödeme & Sosyal Medya */}
          <div>
            <h3 className="text-base font-bold text-white mb-3 sm:mb-4 border-b border-emerald-800/60 pb-2">
              Güvenli Ödeme
            </h3>
            <p className="text-xs text-emerald-100/80 mb-3">
              Ödemeleriniz BDDK ve TCMB lisanslı banka 3D Secure güvenli ortak ödeme altyapısıyla korunmaktadır.
            </p>

            {/* Banka & Kart Güvenlik Rozetleri */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <span className="bg-white/10 border border-white/20 text-white rounded-lg py-1 px-2 text-xs font-bold">VISA</span>
              <span className="bg-white/10 border border-white/20 text-white rounded-lg py-1 px-2 text-xs font-bold">Mastercard</span>
              <span className="bg-white/10 border border-white/20 text-white rounded-lg py-1 px-2 text-xs font-bold">TROY</span>
              <span className="bg-white/10 border border-white/20 text-amber-300 rounded-lg py-1 px-2 text-[11px] font-bold">3D Secure</span>
              <span className="bg-white/10 border border-white/20 text-emerald-300 rounded-lg py-1 px-2 text-[11px] font-bold">256-Bit SSL</span>
              <span className="bg-white/10 border border-white/20 text-white rounded-lg py-1 px-2 text-[11px] font-bold">VakıfBank</span>
            </div>

            <div className="pt-2">
              <a
                href="https://www.instagram.com/onbsaglik"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
              >
                <InstagramSvg size={16} />
                <span>Instagram @onbsaglik</span>
              </a>
            </div>
          </div>
        </div>

        {/* Alt Telif & Bilgi Bandı */}
        <div className="border-t border-emerald-800/80 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-emerald-200/70">
          <p>© {new Date().getFullYear()} ONB Sağlık E-Ticaret (onbsaglik.com.tr). Tüm hakları saklıdır.</p>
          <p className="flex items-center gap-2 text-[11px]">
            <Lock size={12} className="text-amber-400" /> 256-Bit SSL Sertifikalı Güvenli Alışveriş
          </p>
        </div>
      </div>
    </footer>
  );
}
