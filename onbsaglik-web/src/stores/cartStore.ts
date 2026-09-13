/**
 * Zustand ile kullanıcı hesabına özel sepet yönetimi.
 * Her kullanıcının sepeti kendi hesabına kaydedilir (hesap değişince sepet karışmaz).
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAccountExtrasStore } from "./accountExtrasStore";
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
  /** DB ve kampanya durumuna göre sepeti güncelle (geçersiz/bitmiş fiyatları düzeltir) */
  syncCartPrices: (products: Product[], activeCampaigns: any[]) => void;
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
        // Stok Alarm Kontrolü
        if (product.stock < 10) {
          const { addStockAlert, stockAlerts } = useAccountExtrasStore.getState();
          const currentEmail = get().userEmail || "guest";
          const alreadyExists = stockAlerts.some(
            (a) => a.productId === product.id && a.userEmail === currentEmail
          );
          if (!alreadyExists && currentEmail !== "guest") {
            addStockAlert({
              userEmail: currentEmail,
              productId: product.id,
              productSlug: product.slug,
              productName: product.name,
              productImage: product.images[0] || "/placeholder.png",
              price: product.price,
              email: currentEmail,
            });
          }
        }

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

      syncCartPrices: (allProducts, activeCampaigns) => {
        set((state) => {
          const currentEmail = state.userEmail || "guest";
          const currentItems = state.cartsByUser[currentEmail] || state.items || [];
          
          let changed = false;
          const newItems = currentItems.map(item => {
            const realProduct = allProducts.find((p) => p.id === item.product.id);
            if (!realProduct) return item;

            let correctPrice = realProduct.price;

            // Is there an active campaign?
            const camp = activeCampaigns.find((c: any) => c.productId === realProduct.id || c.comboProductId === realProduct.id);
            if (camp) {
               if (camp.type !== "combo" && camp.productId === realProduct.id && camp.discountedPrice) {
                 correctPrice = camp.discountedPrice;
               } else if (camp.type === "combo" && camp.comboProductId === realProduct.id && camp.comboPrice) {
                 correctPrice = camp.comboPrice;
               }
            }

            if (item.product.price !== correctPrice || item.product.stock !== realProduct.stock) {
               changed = true;
               return {
                 ...item,
                 product: {
                    ...item.product,
                    price: correctPrice,
                    stock: realProduct.stock,
                    marketPrice: realProduct.marketPrice
                 }
               };
            }
            return item;
          });

          if (!changed) return state;

          return {
             ...state,
             items: currentEmail === state.userEmail ? newItems : state.items,
             cartsByUser: {
               ...state.cartsByUser,
               [currentEmail]: newItems
             }
          };
        });
      },
    }),
    {
      name: "onbsaglik-cart-v2",
    }
  )
);
