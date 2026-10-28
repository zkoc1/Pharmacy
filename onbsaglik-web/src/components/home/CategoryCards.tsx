// Server Component - Minimal & Zarif Kategori Şeridi
import React from 'react';
import Link from 'next/link';

interface CategoryPill {
  name: string;
  href: string;
}

const CATEGORIES: CategoryPill[] = [
  { name: 'Takviye Gıda', href: '/kategori/vitamin-ve-takviye' },
  { name: 'Bebek&Çocuk', href: '/kategori/anne-bebek' },
  { name: 'Cilt Bakımı', href: '/kategori/cilt-bakimi' },
  { name: 'Güneş Koruma', href: '/kategori/gunes-bakimi' },
  { name: 'Kişisel Bakım', href: '/kategori/kisisel-bakim' },
  { name: 'Saç Bakımı', href: '/kategori/sac-bakimi' },
  { name: 'Kolajen', href: '/ara?q=kolajen' },
  { name: 'Multivitamin', href: '/ara?q=multivitamin' },
];

export default function CategoryCards() {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-3 sm:py-4">
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 justify-start lg:justify-center min-w-max mx-auto">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-[#FFF9F6] border border-[#FFE8DC] text-[#B45309] hover:text-[#92400E] hover:bg-[#FFF2EB] hover:border-[#FFD2BC] font-bold text-xs sm:text-[14px] tracking-tight transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
