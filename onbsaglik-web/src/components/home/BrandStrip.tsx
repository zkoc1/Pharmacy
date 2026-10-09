// Server Component - Markaların kesintisiz ve akıcı kayan şeridi
import React from 'react';
import Link from 'next/link';
import type { Brand } from '@/types';

interface BrandStripProps {
  brands: Brand[];
}

export default function BrandStrip({ brands }: BrandStripProps) {
  if (!brands || brands.length === 0) return null;

  // Kusursuz döngü (infinite marquee) için 2 özdeş set:
  // %50 kaydığında tam olarak başa sarar ve göze hiçbir atlama/takılma hissettirmez
  const marqueeBrands = [...brands, ...brands];

  return (
    <div className="w-full overflow-hidden bg-slate-50/80 py-6 border-y border-slate-200/60 select-none">
      <div className="relative flex w-full max-w-full overflow-hidden group">
        {/* Sol yumuşak degradeli gölge */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>

        {/* Akıcı Kayan İçerik — Sakin ve profesyonel hız (65sn) */}
        <div className="flex gap-4 sm:gap-6 animate-scroll-smooth whitespace-nowrap px-4 py-2 hover:[animation-play-state:paused] active:[animation-play-state:paused]">
          {marqueeBrands.map((brand, idx) => (
            <Link
              key={`${brand.id || brand.slug}-${idx}`}
              href={`/marka/${brand.slug || ''}`}
              className="inline-flex items-center justify-center bg-white px-5 sm:px-7 py-3 rounded-xl shadow-xs border border-slate-200/80 min-w-[130px] sm:min-w-[150px] transition-all duration-200 hover:border-emerald-500 hover:shadow-sm hover:scale-105 group/item cursor-pointer text-decoration-none"
            >
              <span className="font-bold text-xs sm:text-sm text-slate-600 group-hover/item:text-emerald-700 tracking-wider uppercase transition-colors">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Sağ yumuşak degradeli gölge */}
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>
      </div>
    </div>
  );
}
