// Server Component - Ana sayfa üst banner alanı
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Truck, Sparkles, Award } from 'lucide-react';

export default function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl mx-4 my-6 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 border border-emerald-700/30 shadow-2xl">
      {/* Dekoratif Arka Plan Işıkları */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-25 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-amber-400 blur-3xl"></div>
        <div className="absolute top-1/2 right-10 w-96 h-96 rounded-full bg-emerald-400 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 py-10 lg:py-14 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Sol Metin ve Eylemler */}
          <div className="w-full lg:w-7/12 text-white">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-bold tracking-wide uppercase mb-4 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>15. Yılımıza Özel Büyük Fırsat</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-4">
              Tüm Ürünlerde <br />
              <span className="text-amber-400">En Uygun Fiyat</span> Garantisi!
            </h1>
            
            <p className="text-emerald-100 text-base sm:text-lg lg:text-xl font-normal mb-6 max-w-xl leading-relaxed">
              15 yıllık tecrübe ve eczane güvencesiyle; Ocean, Dermoskin, Bioxcin ve 60+ güvenilir markanın 500’den fazla orijinal dermokozmetik ve takviye ürünü en avantajlı fiyatlarla tek adreste.
            </p>

            {/* Güven Rozetleri */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-white">%100 Orijinal Ürün</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2.5">
                <Truck className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-white">500 ₺ Üzeri Ücretsiz Kargo</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2.5">
                <Award className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-white">HepsiJet Hızlı Teslimat</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link 
                href="/urunler" 
                className="bg-amber-400 hover:bg-amber-300 text-emerald-950 px-8 py-4 rounded-xl font-extrabold text-base sm:text-lg shadow-lg hover:shadow-amber-400/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 inline-flex items-center justify-center"
              >
                Alışverişe Başla
              </Link>
              <Link 
                href="/urunler" 
                className="border-2 border-white/30 hover:border-white text-white px-8 py-4 rounded-xl font-bold text-base sm:text-lg backdrop-blur-sm bg-white/5 hover:bg-white/15 transition-all duration-300 inline-flex items-center justify-center"
              >
                Tüm Ürünleri İncele
              </Link>
            </div>
          </div>

          {/* Sağ: Reklam Görseli */}
          <div className="w-full lg:w-5/12 flex justify-center">
            <Link 
              href="/urunler" 
              className="group relative block w-full max-w-[420px] aspect-square rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/40 hover:border-amber-400 transition-all duration-300 hover:scale-[1.02]"
              title="15. Yıla Özel Kampanyayı Keşfet"
            >
              <Image 
                src="/banner-15yil.jpg" 
                alt="15. Yılımıza Özel Tüm Ürünlerde En Uygun Fiyat Garantisi - OnbSağlık" 
                fill
                priority
                sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 420px"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity"></div>
              
              {/* Köşe Rozeti */}
              <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-md border border-white/20 text-white rounded-xl p-2.5 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 group-hover:bg-emerald-950/80 transition-colors">
                <span>Kampanyalı Ürünleri Keşfet</span>
                <span className="text-amber-400 text-base font-bold">→</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Alt Hızlı İstatistik Çubuğu */}
        <div className="mt-10 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center md:text-left">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">15. Yıl</p>
            <p className="text-xs sm:text-sm text-emerald-100">Sektör Tecrübesi</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">500+</p>
            <p className="text-xs sm:text-sm text-emerald-100">Orijinal Ürün Çeşidi</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">60+</p>
            <p className="text-xs sm:text-sm text-emerald-100">Güvenilir Marka</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">500 ₺</p>
            <p className="text-xs sm:text-sm text-emerald-100">Üzeri Ücretsiz Kargo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
