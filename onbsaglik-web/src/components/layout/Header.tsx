'use client';

// Header bileşeni, sticky navigasyon ve alışveriş sepeti gibi kullanıcı durumlarını içerir.
import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Heart, User, Search, Menu, X, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const categories = [
    { name: 'Vitamin & Takviye', href: '/kategori/vitamin-takviye' },
    { name: 'Güneş Bakımı', href: '/kategori/gunes-bakimi' },
    { name: 'Saç Bakımı', href: '/kategori/sac-bakimi' },
    { name: 'Cilt Bakımı', href: '/kategori/cilt-bakimi' },
    { name: 'Makyaj', href: '/kategori/makyaj' },
    { name: 'Kişisel Bakım', href: '/kategori/kisisel-bakim' },
    { name: 'Anne & Bebek', href: '/kategori/anne-bebek' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-gray-200">
      {/* Haber Bandı */}
      <div className="bg-emerald-500 text-white text-center text-sm py-1 font-medium">
        Ücretsiz kargo 500 TL üzeri alışverişlerde!
      </div>
      
      <div className="container mx-auto px-4">
        {/* Üst Kısım: Logo, Arama, İkonlar */}
        <div className="flex items-center justify-between py-4">
          {/* Mobil Menü Butonu */}
          <button 
            className="md:hidden p-2 text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-emerald-500 text-white p-2 rounded-lg flex items-center justify-center">
              <span className="font-bold text-xl tracking-tight">OnbSağlık</span>
              <span className="ml-1 text-lg">🌿</span>
            </div>
          </Link>

          {/* Arama Çubuğu (Masaüstü) */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative">
            <input 
              type="text" 
              placeholder="Ürün, marka veya kategori arayın..." 
              className="w-full pl-4 pr-12 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-emerald-600 hover:text-emerald-700">
              <Search size={20} />
            </button>
          </div>

          {/* Sağ İkonlar */}
          <div className="flex items-center gap-4">
            <Link href="/hesabim" className="hidden sm:flex flex-col items-center text-gray-600 hover:text-emerald-600 transition-colors">
              <User size={24} />
              <span className="text-xs mt-1 font-medium">Hesabım</span>
            </Link>
            <Link href="/favoriler" className="hidden sm:flex flex-col items-center text-gray-600 hover:text-emerald-600 transition-colors">
              <Heart size={24} />
              <span className="text-xs mt-1 font-medium">Favoriler</span>
            </Link>
            <button className="flex flex-col items-center text-gray-600 hover:text-emerald-600 transition-colors relative">
              <ShoppingCart size={24} />
              <span className="text-xs mt-1 font-medium">Sepet</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobil Arama (sadece mobilde görünür) */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Ara..." 
              className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      {/* Kategori Navigasyon Menüsü (Masaüstü) */}
      <div className="hidden md:block border-t border-gray-100 bg-white/50">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-center gap-8 py-3">
            {categories.map((cat, idx) => (
              <Link 
                key={idx} 
                href={cat.href}
                className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors flex items-center gap-1"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobil Menü İçeriği */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2 absolute w-full shadow-lg">
          {categories.map((cat, idx) => (
            <Link 
              key={idx} 
              href={cat.href}
              className="block px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 border-b border-gray-50 last:border-0"
              onClick={() => setIsMenuOpen(false)}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
