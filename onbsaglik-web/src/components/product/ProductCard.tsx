'use client';

// Ürün kartı bileşeni, etkileşimli öğeler barındırır.
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { calcDiscount, formatPrice } from '@/lib/products';
import { useCartStore } from '@/stores/cartStore';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  
  // İndirim oranı hesaplama
  const discountRate = product.marketPrice ? calcDiscount(product.marketPrice, product.price) : 0;
  
  // İlk görseli veya placeholder'ı al
  const imageUrl = (product.images && product.images.length > 0) ? product.images[0] : '/placeholder.png';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Linke tıklamayı engelle, sadece sepete ekle
    addItem(product, 1);
  };

  return (
    <Link href={`/urun/${product.slug}`} className="group flex flex-col bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative">
      {/* İndirim Rozeti */}
      {discountRate > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
          %{discountRate}
        </div>
      )}
      
      {/* Görsel Alanı */}
      <div className="relative aspect-square w-full mb-4 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center">
        <Image 
          src={imageUrl} 
          alt={product.name} 
          fill
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          unoptimized={true}
        />
      </div>

      {/* İçerik */}
      <div className="flex flex-col flex-grow">
        {/* Marka */}
        <span className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">
          {product.brand}
        </span>
        
        {/* Ürün Adı */}
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 leading-snug group-hover:text-emerald-600 transition-colors">
          {product.name}
        </h3>
        
        <div className="mt-auto pt-3">
          <div className="flex flex-col mb-3">
            {/* Market Fiyatı (Üstü Çizili) */}
            {product.marketPrice && product.marketPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.marketPrice)}
              </span>
            )}
            {/* Güncel Fiyat */}
            <span className="text-lg font-bold text-emerald-600">
              {formatPrice(product.price)}
            </span>
          </div>
          
          {/* Sepete Ekle Butonu */}
          <button 
            onClick={handleAddToCart}
            className="w-full bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-200 hover:border-transparent transition-colors py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
          >
            Sepete Ekle
          </button>
        </div>
      </div>
    </Link>
  );
}
