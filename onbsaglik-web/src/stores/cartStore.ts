/**
 * Zustand ile global sepet yönetimi.
 * Sepet işlemleri (ekle, çıkar, güncelle, temizle) tek bir state üzerinden yönetilir.
 * LocalStorage'a kalıcı olarak kaydedilir — sayfa yenilenince kaybolmaz.
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types";

interface CartStore {
  /** Sepetteki ürün listesi */
  items: CartItem[];
  /** Sepete ürün ekle — mevcut ürün varsa miktarı artır */
  addItem: (product: Product, quantity?: number) => void;
  /** Sepetten ürün çıkar */
  removeItem: (productId: number) => void;
  /** Ürün miktarını güncelle */
  updateQuantity: (productId: number, quantity: number) => void;
  /** Sepeti tamamen temizle */
  clearCart: () => void;
  /** Sepetteki toplam ürün adedi */
  getTotalCount: () => number;
  /** Sepet toplam tutarı (TL) */
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            // Mevcut ürünün miktarını artır
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          // Yeni ürün ekle
          return { items: [...state.items, { product, quantity }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "onbsaglik-cart", // LocalStorage anahtarı
    }
  )
);
