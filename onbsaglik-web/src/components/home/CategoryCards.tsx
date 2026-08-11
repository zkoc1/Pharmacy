// Server Component - Kategori hızlı erişim kartları
import React from 'react';
import Link from 'next/link';

export default function CategoryCards() {
  const categories = [
    { id: 'vitamin', name: 'Vitamin & Takviye', emoji: '💊', href: '/kategori/vitamin-takviye' },
    { id: 'gunes', name: 'Güneş Bakımı', emoji: '☀️', href: '/kategori/gunes-bakimi' },
    { id: 'sac', name: 'Saç Bakımı', emoji: '💆', href: '/kategori/sac-bakimi' },
    { id: 'cilt', name: 'Cilt Bakımı', emoji: '✨', href: '/kategori/cilt-bakimi' },
    { id: 'makyaj', name: 'Makyaj', emoji: '💄', href: '/kategori/makyaj' },
    { id: 'kisisel', name: 'Kişisel Bakım', emoji: '🧴', href: '/kategori/kisisel-bakim' },
    { id: 'anne', name: 'Anne & Bebek', emoji: '👶', href: '/kategori/anne-bebek' },
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
              <span className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {cat.emoji}
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
