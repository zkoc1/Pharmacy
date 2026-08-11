// Server Component - Markaların kayan şeridi
import React from 'react';
import type { Brand } from '@/types';

interface BrandStripProps {
  brands: Brand[];
}

export default function BrandStrip({ brands }: BrandStripProps) {
  // Animasyonun kesintisiz görünmesi için markaları çoğaltıyoruz
  const displayBrands = [...brands, ...brands, ...brands];

  return (
    <div className="w-full overflow-hidden bg-gray-50 py-10 border-y border-gray-100">
      <div className="container mx-auto px-4 mb-6 text-center">
        <h2 className="text-xl font-bold text-gray-700">Güvenilir Markalar</h2>
      </div>
      
      <div className="relative flex max-w-[100vw] overflow-hidden">
        {/* Sol Gölge */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
        
        {/* Kayan İçerik */}
        <div className="flex gap-6 animate-scroll-x whitespace-nowrap px-6">
          {displayBrands.map((brand, idx) => (
            <div 
              key={`${brand.id}-${idx}`} 
              className="flex items-center justify-center bg-white px-8 py-4 rounded-xl shadow-sm border border-gray-100 min-w-[150px] transition-colors hover:border-emerald-300"
            >
              <span className="font-semibold text-gray-500 uppercase tracking-wider">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
        
        {/* Sağ Gölge */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-50 to-transparent z-10"></div>
      </div>
    </div>
  );
}
