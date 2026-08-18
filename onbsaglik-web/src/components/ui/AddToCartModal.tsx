/**
 * Ürün Başarıyla Sepete Eklendi Açılır Modal Penceresi (Görsel 1 Birebir)
 * Ürün eklendiğinde açılır; adet değişimi, birlikte alınabilecek öneri ürünleri,
 * "ALIŞVERİŞE DEVAM ET", "SEPETE GİT" ve "SATIN AL" butonlarını barındırır.
 */

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, ShoppingCart, ChevronLeft } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/products";
import { useCartStore } from "@/stores/cartStore";

interface Props {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddToCartModal({ product, isOpen, onClose }: Props) {
  const { addItem, updateQuantity, items } = useCartStore();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [addedRecs, setAddedRecs] = useState<Record<number, boolean>>({});

  const cartItem = product ? items.find((i) => i.product.id === product.id) : null;
  const quantity = cartItem ? cartItem.quantity : 1;

  useEffect(() => {
    if (isOpen) {
      import("@/data/products.json").then((m) => {
        const all = m.default as Product[];
        const recs = all.filter((p) => p.id !== product?.id).slice(0, 4);
        setRecommendations(recs);
      });
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleAddRec = (rec: Product) => {
    addItem(rec, 1);
    setAddedRecs((prev) => ({ ...prev, [rec.id]: true }));
    setTimeout(() => setAddedRecs((prev) => ({ ...prev, [rec.id]: false })), 2000);
  };

  const totalPrice = product.price * quantity;

  return (
    <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 relative shadow-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between">
        
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>

        <div>
          {/* Başlık */}
          <h2 className="text-xl font-extrabold text-gray-900 mb-6 border-b pb-3">
            Ürün Başarıyla Sepete Eklendi
          </h2>

          {/* Ürün Detay Satırı (Görsel 1 Birebir) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50/70 p-4 rounded-2xl border border-gray-100 mb-6">
            <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded-xl p-2 border">
              <Image
                src={product.images?.[0] || "/placeholder.png"}
                alt={product.name}
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            <div className="flex-grow text-center sm:text-left">
              <span className="text-xs font-bold text-gray-500 uppercase">{product.brand}</span>
              <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{product.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">Birim Fiyat: {formatPrice(product.price)}</p>

              {/* Miktar Seçici */}
              <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden mt-2 bg-white">
                <button
                  onClick={() => updateQuantity(product.id, Math.max(1, quantity - 1))}
                  className="px-2.5 py-1 text-gray-500 hover:bg-gray-100"
                >
                  <Minus size={14} />
                </button>
                <span className="px-3 py-1 font-bold text-xs">{quantity}</span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="px-2.5 py-1 text-gray-500 hover:bg-gray-100"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <span className="text-xs text-gray-400 font-medium block">Toplam Fiyat</span>
              <span className="text-lg font-extrabold text-rose-500">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          {/* Birlikte Alınabilecek Ürünler ! (Görsel 1 Birebir) */}
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-2">
              Birlikte Alınabilecek Ürünler !
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recommendations.map((rec) => (
                <div key={rec.id} className="border border-gray-200 rounded-2xl p-3 text-center bg-white flex flex-col justify-between hover:border-emerald-500 transition-colors">
                  <div className="relative aspect-square w-full mb-2 bg-gray-50 rounded-lg p-1">
                    <Image
                      src={rec.images?.[0] || "/placeholder.png"}
                      alt={rec.name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase truncate">{rec.brand}</span>
                    <p className="text-xs font-bold text-gray-800 line-clamp-2 h-8">{rec.name}</p>
                    <p className="text-xs font-extrabold text-gray-900 mt-1">{formatPrice(rec.price)}</p>
                  </div>
                  <button
                    onClick={() => handleAddRec(rec)}
                    className="mt-2 w-full bg-gray-50 hover:bg-emerald-600 hover:text-white border text-gray-800 font-bold py-1.5 rounded-xl text-[11px] flex items-center justify-center gap-1 transition-colors"
                  >
                    <ShoppingCart size={12} /> {addedRecs[rec.id] ? "Eklendi!" : "Sepete Ekle"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Alt Buton (Görsel 1 Birebir: ALIŞVERİŞE DEVAM ET, SEPETE GİT, SATIN AL) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full border-2 border-rose-400 text-rose-500 hover:bg-rose-50 font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-1 transition-colors uppercase"
          >
            <ChevronLeft size={16} /> ALIŞVERİŞE DEVAM ET
          </button>

          <Link
            href="/sepet"
            onClick={onClose}
            className="w-full bg-rose-400 hover:bg-rose-500 text-white font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-1 transition-colors uppercase text-center"
          >
            SEPETE GİT
          </Link>

          <Link
            href="/odeme"
            onClick={onClose}
            className="w-full bg-gray-900 hover:bg-black text-white font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-1 transition-colors uppercase text-center"
          >
            SATIN AL
          </Link>
        </div>

      </div>
    </div>
  );
}
