// Server Component - Modern & Şık Kategori Kartları
import React from 'react';
import Link from 'next/link';

interface CategoryItem {
  id: string;
  name: string;
  tagline: string;
  href: string;
  iconBg: string;
  borderHover: string;
  glowColor: string;
  badgeText: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'vitamin',
    name: 'Vitamin & Takviye',
    tagline: 'Bağışıklık & Enerji',
    href: '/kategori/vitamin-ve-takviye',
    iconBg: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white',
    borderHover: 'hover:border-emerald-300',
    glowColor: 'group-hover:shadow-[0_16px_32px_-8px_rgba(16,185,129,0.25)]',
    badgeText: 'Popüler',
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Kapsül & Sağlık Işıltısı */}
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
        <path d="m8.5 8.5 7 7" />
        <path d="M4 3h.01M20 21h.01M3 8h.01" strokeWidth="3" />
      </svg>
    ),
  },
  {
    id: 'gunes',
    name: 'Güneş Bakımı',
    tagline: 'SPF 50+ & Koruma',
    href: '/kategori/gunes-bakimi',
    iconBg: 'bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white',
    borderHover: 'hover:border-amber-300',
    glowColor: 'group-hover:shadow-[0_16px_32px_-8px_rgba(245,158,11,0.25)]',
    badgeText: 'Mevsimsel',
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Parlayan Güneş & Koruma Kalkanı */}
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    ),
  },
  {
    id: 'sac',
    name: 'Saç Bakımı',
    tagline: 'Dökülme & Onarım',
    href: '/kategori/sac-bakimi',
    iconBg: 'bg-purple-50 text-purple-600 group-hover:bg-purple-500 group-hover:text-white',
    borderHover: 'hover:border-purple-300',
    glowColor: 'group-hover:shadow-[0_16px_32px_-8px_rgba(139,92,246,0.25)]',
    badgeText: 'Klinik',
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Saç Damlası & Kalkan */}
        <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z" />
        <path d="M12 6a3 3 0 0 0-3 3" />
      </svg>
    ),
  },
  {
    id: 'cilt',
    name: 'Cilt Bakımı',
    tagline: 'Anti-Aging & Serum',
    href: '/kategori/cilt-bakimi',
    iconBg: 'bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white',
    borderHover: 'hover:border-rose-300',
    glowColor: 'group-hover:shadow-[0_16px_32px_-8px_rgba(244,63,94,0.25)]',
    badgeText: 'Dermokozmetik',
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Parıltı & Yüz Bakım Işıltısı */}
        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
        <path d="M19 3v4M21 5h-4" />
      </svg>
    ),
  },
  {
    id: 'makyaj',
    name: 'Makyaj',
    tagline: 'Dermatolojik Renkli',
    href: '/kategori/makyaj',
    iconBg: 'bg-pink-50 text-pink-600 group-hover:bg-pink-500 group-hover:text-white',
    borderHover: 'hover:border-pink-300',
    glowColor: 'group-hover:shadow-[0_16px_32px_-8px_rgba(236,72,153,0.25)]',
    badgeText: 'Hassas',
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Ruj & Renkli Bakım */}
        <path d="m3 21 7.5-7.5" />
        <path d="m15.5 8.5 3 3" />
        <path d="M9 15l2 2" />
        <path d="M13 5.5a2.12 2.12 0 0 1 3 3L11 13.5l-4.5.5.5-4.5 6-6Z" />
        <path d="m17 4 3 3" />
      </svg>
    ),
  },
  {
    id: 'kisisel',
    name: 'Kişisel Bakım',
    tagline: 'Vücut & Ağız Sağlığı',
    href: '/kategori/kisisel-bakim',
    iconBg: 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white',
    borderHover: 'hover:border-cyan-300',
    glowColor: 'group-hover:shadow-[0_16px_32px_-8px_rgba(6,182,212,0.25)]',
    badgeText: 'Günlük',
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Losyon & Pompa Şişesi */}
        <path d="M10 2h4" />
        <path d="M12 2v4" />
        <rect width="12" height="14" x="6" y="8" rx="3" />
        <path d="M6 12h12" />
        <circle cx="12" cy="16" r="1.5" />
      </svg>
    ),
  },
  {
    id: 'anne',
    name: 'Anne & Bebek',
    tagline: 'Hassas & Organik',
    href: '/kategori/anne-bebek',
    iconBg: 'bg-blue-50 text-blue-600 group-hover:bg-blue-500 group-hover:text-white',
    borderHover: 'hover:border-blue-300',
    glowColor: 'group-hover:shadow-[0_16px_32px_-8px_rgba(59,130,246,0.25)]',
    badgeText: 'Güvenli',
    icon: (
      <svg className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Kalp & Şefkat / Bebek */}
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <path d="M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      </svg>
    ),
  },
];

export default function CategoryCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 lg:gap-5">
      {CATEGORIES.map((cat, idx) => (
        <Link
          key={cat.id}
          href={cat.href}
          className={`group relative flex flex-col items-center justify-between p-4 sm:p-5 bg-white/95 backdrop-blur-xs rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer ${cat.borderHover} ${cat.glowColor} ${
            idx === 6 ? 'col-span-2 sm:col-span-1' : ''
          }`}
        >
          {/* Üst Rozet / Etiket */}
          <div className="w-full flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-100/90 text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">
              {cat.badgeText}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-emerald-500 transition-colors duration-300" />
          </div>

          {/* İkon Kapsülü */}
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-xs transition-all duration-300 ${cat.iconBg}`}
          >
            {cat.icon}
          </div>

          {/* Metinler */}
          <div className="text-center w-full">
            <h3 className="text-xs sm:text-[13px] font-bold text-slate-800 group-hover:text-slate-950 transition-colors duration-200 leading-tight">
              {cat.name}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-1 group-hover:text-slate-600 transition-colors duration-200 truncate">
              {cat.tagline}
            </p>
          </div>

          {/* Alt Aksiyon Çizgisi ve Ok */}
          <div className="mt-3 pt-2.5 w-full border-t border-slate-100 flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-600 opacity-80 group-hover:opacity-100 transition-all duration-300">
            <span>Keşfet</span>
            <svg
              className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  );
}
