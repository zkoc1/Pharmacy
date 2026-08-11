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
              href="/alisveris" 
              className="bg-white text-emerald-800 hover:bg-emerald-50 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              Alışverişe Başla
            </Link>
            <Link 
              href="/kategoriler" 
              className="border-2 border-emerald-400/50 hover:border-emerald-300 text-white px-8 py-4 rounded-xl font-bold text-lg backdrop-blur-sm bg-black/10 hover:bg-black/20 transition-all duration-300"
            >
              Ürünleri Keşfet
            </Link>
          </div>
        </div>

        {/* Sağ Kolaj/Animasyon Alanı (CSS ile) */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          <div className="relative w-72 h-72 md:w-96 md:h-96">
            {/* Merkez Daire */}
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full border border-emerald-400/30 backdrop-blur-md shadow-2xl animate-pulse"></div>
            
            {/* CSS İkonları (Haplar, Yapraklar, Yıldızlar) */}
            <div className="absolute top-10 left-10 text-4xl animate-bounce" style={{ animationDuration: '3s' }}>💊</div>
            <div className="absolute top-20 right-16 text-5xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>🌿</div>
            <div className="absolute bottom-20 left-16 text-6xl animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>🧴</div>
            <div className="absolute bottom-10 right-20 text-4xl animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}>✨</div>
            
            {/* Dekoratif Yüzen Kart */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="w-32 h-32 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                <span className="text-6xl">✨</span>
              </div>
              <div className="h-2 w-24 bg-gray-200 rounded-full mb-2"></div>
              <div className="h-2 w-16 bg-emerald-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
