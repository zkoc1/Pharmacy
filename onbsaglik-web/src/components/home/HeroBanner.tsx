// Server Component - Ana sayfa üst banner alanı
import React from 'react';
import Link from 'next/link';

export default function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl mx-4 my-6 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-600">
      {/* Dekoratif Arka Plan Şekilleri */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-6 py-16 md:py-24 relative z-10 flex flex-col md:flex-row items-center justify-between">
        {/* Sol İçerik */}
        <div className="w-full md:w-1/2 text-white mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            Sağlığınız İçin <br/>
            <span className="text-amber-400">En İyi Ürünler</span>
          </h1>
          <p className="text-emerald-50 text-lg md:text-xl font-medium mb-8 max-w-lg">
            500+ ürün, 63 marka, güvenli alışveriş ile tüm dermokozmetik ve takviye ihtiyaçlarınız tek adreste.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/urunler" 
              className="bg-white text-emerald-800 hover:bg-emerald-50 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              Alışverişe Başla
            </Link>
            <Link 
              href="/urunler" 
              className="border-2 border-emerald-400/50 hover:border-emerald-300 text-white px-8 py-4 rounded-xl font-bold text-lg backdrop-blur-sm bg-black/10 hover:bg-black/20 transition-all duration-300"
            >
              Ürünleri Keşfet
            </Link>
          </div>
        </div>

        {/* Sağ: Güven rozetleri ve istatistikler */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: '184+', sub: 'Ürün Çeşidi' },
              { label: '63', sub: 'Güvenilir Marka' },
              { label: '%100', sub: 'Orijinal Ürün' },
              { label: '500₺', sub: 'Ücretsiz Kargo' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center text-white"
              >
                <p className="text-3xl font-extrabold text-amber-400">{stat.label}</p>
                <p className="text-sm text-emerald-100 mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
