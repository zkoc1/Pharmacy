'use client';

// Sepet özeti ve yönetimi için yandan kayan panel (Drawer)
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/products';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Hydration hatasını önlemek için
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Overlay arka plan */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer paneli */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Üst Bilgi (Header) */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-800">Sepetim</h2>
            <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full">
              {items.length} ürün
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sepet İçeriği */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
              <ShoppingBag size={48} className="text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-800 mb-2">Sepetiniz boş</p>
              <p className="text-sm mb-6">İhtiyacınız olan ürünleri sepetinize eklemeye başlayın.</p>
              <button 
                onClick={onClose}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Alışverişe Devam Et
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                  {/* Ürün Görseli */}
                  <div className="relative w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                    <Image 
                      src={item.product.images?.[0] || '/placeholder.png'} 
                      alt={item.product.name} 
                      fill 
                      className="object-contain p-2"
                      unoptimized={true}
                    />
                  </div>

                  {/* Ürün Detayları */}
                  <div className="flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
                        {item.product.name}
                      </h3>
                      <div className="text-emerald-600 font-bold mt-1">
                        {formatPrice(item.product.price)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Miktar Kontrolü */}
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button 
                          onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100 rounded-l-lg transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 py-1 text-sm font-medium text-gray-800">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100 rounded-r-lg transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Silme Butonu */}
                      <button 
                        onClick={() => removeItem(item.product.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Ürünü Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alt Bilgi ve Ödeme (Footer) */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-medium">Toplam Tutar:</span>
              <span className="text-xl font-bold text-emerald-600">
                {formatPrice(getTotalPrice())}
              </span>
            </div>
            
            <Link 
              href="/sepet"
              onClick={onClose}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-center flex items-center justify-center transition-colors shadow-md"
            >
              Sepete Git ve Tamamla
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
