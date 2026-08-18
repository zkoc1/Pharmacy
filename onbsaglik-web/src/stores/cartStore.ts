/**
 * Zustand ile kullanıcı hesabına özel sepet yönetimi.
 * Her kullanıcının sepeti kendi hesabına kaydedilir (hesap değişince sepet karışmaz).
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types";

export type { CartItem };

interface CartStore {
  /** Aktif kullanıcının e-posta adresi (guest için 'guest') */
  userEmail: string;
  /** Kullanıcı bazlı sepet saklama sözlüğü: { "ahmet@gmail.com": [...items] } */
  cartsByUser: Record<string, CartItem[]>;
  
  /** Aktif sepet ürünleri */
  items: CartItem[];
  
  /** Aktif kullanıcıyı ayarla (oturum açılınca veya kapanınca çağrılır) */
  setUserEmail: (email: string) => void;
  
  /** Sepete ürün ekle */
  addItem: (product: Product, quantity?: number) => void;
  /** Sepetten ürün çıkar */
  removeItem: (productId: number) => void;
  /** Miktar güncelle */
  updateQuantity: (productId: number, quantity: number) => void;
  /** Sepeti temizle */
  clearCart: () => void;
  /** Toplam ürün adedi */
  getTotalCount: () => number;
  /** Toplam tutar (TL) */
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      userEmail: "guest",
      cartsByUser: { guest: [] },
      items: [],

      setUserEmail: (email: string) => {
        const targetEmail = email || "guest";
        const currentCarts = get().cartsByUser || {};
        const userItems = currentCarts[targetEmail] || [];
        set({
          userEmail: targetEmail,
          items: userItems,
          cartsByUser: {
            ...currentCarts,
            [targetEmail]: userItems,
          },
        });
      },

      addItem: (product, quantity = 1) => {
        set((state) => {
          const currentEmail = state.userEmail || "guest";
          const currentItems = state.cartsByUser[currentEmail] || state.items || [];
          
          const existing = currentItems.find((i) => i.product.id === product.id);
          let newItems: CartItem[];

          if (existing) {
            newItems = currentItems.map((i) =>
              i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
            );
          } else {
            newItems = [...currentItems, { product, quantity }];
          }

          return {
            items: newItems,
            cartsByUser: {
              ...state.cartsByUser,
              [currentEmail]: newItems,
            },
          };
        });
      },

      removeItem: (productId) => {
        set((state) => {
          const currentEmail = state.userEmail || "guest";
          const currentItems = state.cartsByUser[currentEmail] || state.items || [];
          const newItems = currentItems.filter((i) => i.product.id !== productId);

          return {
            items: newItems,
            cartsByUser: {
              ...state.cartsByUser,
              [currentEmail]: newItems,
            },
          };
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => {
          const currentEmail = state.userEmail || "guest";
          const currentItems = state.cartsByUser[currentEmail] || state.items || [];
          const newItems = currentItems.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          );

          return {
            items: newItems,
            cartsByUser: {
              ...state.cartsByUser,
              [currentEmail]: newItems,
            },
          };
        });
      },

      clearCart: () => {
        set((state) => {
          const currentEmail = state.userEmail || "guest";
          return {
            items: [],
            cartsByUser: {
              ...state.cartsByUser,
              [currentEmail]: [],
            },
          };
        });
      },

      getTotalCount: () => {
        const state = get();
        const currentEmail = state.userEmail || "guest";
        const currentItems = state.cartsByUser[currentEmail] || state.items || [];
        return currentItems.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const state = get();
        const currentEmail = state.userEmail || "guest";
        const currentItems = state.cartsByUser[currentEmail] || state.items || [];
        return currentItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
      },
    }),
    {
      name: "onbsaglik-cart-v2",
    }
  )
);
