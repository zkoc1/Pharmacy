// Server Component - Kategori hızlı erişim kartları
import React from 'react';
import Link from 'next/link';

// Kategori SVG ikonları — emoji yerine profesyonel SVG
const ICONS: Record<string, React.ReactNode> = {
  vitamin: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/>
      <path d="M12 8v4M12 16h.01"/>
    </svg>
  ),
  gunes: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  ),
  sac: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  cilt: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  makyaj: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>
    </svg>
  ),
  kisisel: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  anne: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
};

export default function CategoryCards() {
  const categories = [
    { id: 'vitamin', name: 'Vitamin & Takviye', href: '/kategori/vitamin-ve-takviye', color: '#10b981' },
    { id: 'gunes', name: 'Güneş Bakımı', href: '/kategori/gunes-bakimi', color: '#f59e0b' },
    { id: 'sac', name: 'Saç Bakımı', href: '/kategori/sac-bakimi', color: '#8b5cf6' },
    { id: 'cilt', name: 'Cilt Bakımı', href: '/kategori/cilt-bakimi', color: '#ec4899' },
    { id: 'makyaj', name: 'Makyaj', href: '/kategori/makyaj', color: '#ef4444' },
    { id: 'kisisel', name: 'Kişisel Bakım', href: '/kategori/kisisel-bakim', color: '#06b6d4' },
    { id: 'anne', name: 'Anne & Bebek', href: '/kategori/anne-bebek', color: '#3b82f6' },
  ];

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Kategorileri Keşfet</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              href={cat.href}
              className="group flex flex-col items-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-400 hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              {/* SVG ikonu — emoji yerine */}
              <span
                className="mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{ color: cat.color }}
              >
                {ICONS[cat.id]}
              </span>
              <h3 className="text-sm font-semibold text-gray-800 text-center mb-2">
                {cat.name}
              </h3>
              <span className="text-xs font-medium text-emerald-600 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                İncele &rarr;
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
