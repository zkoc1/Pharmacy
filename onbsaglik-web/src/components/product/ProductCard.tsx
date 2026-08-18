'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Heart, ShoppingCart, Check, Sparkles } from 'lucide-react';
import type { Product } from '@/types';
import { calcDiscount, formatPrice } from '@/lib/products';
import { useCartStore } from '@/stores/cartStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import AddToCartModal from '@/components/ui/AddToCartModal';
import LoginModal from '@/components/ui/LoginModal';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { data: session } = useSession();
  const addItem = useCartStore((state) => state.addItem);
  const isFavorite = useFavoritesStore((state) => state.items.some((i) => i.id === product.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isOutOfStock = product.stock === 0;

  const discountRate = product.marketPrice ? calcDiscount(product.marketPrice, product.price) : 0;
  const imageUrl = (product.images && product.images.length > 0 && product.images[0]) ? product.images[0] : '/placeholder.png';

  const checkIsLoggedIn = () => {
    return !!session || !!localStorage.getItem("user_session");
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Kullanıcı giriş yapmadıysa Görsel 1 birebir Üye Girişi Modalı açılır
    if (!checkIsLoggedIn()) {
      setShowLoginModal(true);
      return;
    }

    if (isOutOfStock) return;
    addItem(product, 1);
    setAdded(true);
    setShowModal(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Kullanıcı giriş yapmadıysa Görsel 1 birebir Üye Girişi Modalı açılır
    if (!checkIsLoggedIn()) {
      setShowLoginModal(true);
      return;
    }

    toggleFavorite(product);
  };

  return (
    <>
      <Link href={`/urun/${product.slug}`} className="group flex flex-col bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative">
        {/* İndirim Rozeti */}
        {discountRate > 0 && (
          <div className="absolute top-3 left-3 z-10 bg-rose-500 text-white text-xs font-extrabold px-2 py-0.5 rounded-md shadow-sm">
            %{discountRate}
          </div>
        )}

        {/* Favori Butonu */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all duration-200 flex items-center justify-center cursor-pointer"
          aria-label={isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
        >
          <Heart
            size={18}
            className={isFavorite ? "text-rose-500" : "text-gray-400 hover:text-rose-500"}
            fill={isFavorite ? "#f43f5e" : "none"}
          />
        </button>
        
        {/* Görsel Alanı */}
        <div className="relative aspect-square w-full mb-4 bg-gray-50/80 rounded-xl overflow-hidden flex items-center justify-center border border-gray-50">
          {imgError ? (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 shadow-inner">
                <Sparkles size={28} />
              </div>
              <span className="text-xs font-bold text-gray-800 line-clamp-1 uppercase">{product.brand}</span>
              <span className="text-[10px] text-gray-400 font-medium mt-0.5">Orijinal Eczane Ürünü</span>
            </div>
          ) : (
            <Image 
              src={imageUrl} 
              alt={product.name} 
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              unoptimized={true}
              onError={() => setImgError(true)}
            />
          )}
        </div>

        {/* İçerik */}
        <div className="flex flex-col flex-grow">
          <span className="text-xs text-gray-400 font-bold mb-1 uppercase tracking-wide">
            {product.brand}
          </span>
          
          <h3 className="text-xs font-bold text-gray-800 line-clamp-2 mb-2 leading-snug group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>
          
          <div className="mt-auto pt-3">
            <div className="flex flex-col mb-3">
              {product.marketPrice && product.marketPrice > product.price && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(product.marketPrice)}
                </span>
              )}
              <span className="text-base font-extrabold text-emerald-600">
                {formatPrice(product.price)}
              </span>
            </div>
            
            {/* Stok Kontrollü Sepete Ekle Butonu */}
            <button 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : added
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-200 hover:border-transparent'
              }`}
            >
              {isOutOfStock ? (
                'Stokta Yok'
              ) : added ? (
                <>
                  <Check size={16} /> Sepete Eklendi!
                </>
              ) : (
                <>
                  <ShoppingCart size={16} /> Sepete Ekle
                </>
              )}
            </button>
          </div>
        </div>
      </Link>

      {/* Ürün Sepete Eklendi Modalı */}
      <AddToCartModal
        product={product}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      {/* Giriş Yapılmamışsa Açılan Üye Girişi Modalı (Görsel 1 Birebir) */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}
