/**
 * Zustand ile global favoriler yönetimi.
 * LocalStorage'a kalıcı kaydedilir.
 */
"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";

interface FavoritesStore {
  items: Product[];
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (product: Product) => void;
  clearFavorites: () => void;
  syncWithServer: () => Promise<void>;
}

const getUserEmail = () => {
  if (typeof window === "undefined") return null;
  const session = localStorage.getItem("user_session");
  if (!session) return null;
  try {
    return JSON.parse(session).email;
  } catch {
    return null;
  }
};

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],
      addFavorite: async (product) => {
        set((s) => ({ items: s.items.some(i => i.id === product.id) ? s.items : [...s.items, product] }));
        const email = getUserEmail();
        if (email) {
          fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, productId: product.id }) }).catch(console.error);
        }
      },
      removeFavorite: async (productId) => {
        set((s) => ({ items: s.items.filter(i => i.id !== productId) }));
        const email = getUserEmail();
        if (email) {
          fetch("/api/favorites", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, productId }) }).catch(console.error);
        }
      },
      isFavorite: (productId) => get().items.some(i => i.id === productId),
      toggleFavorite: (product) => get().isFavorite(product.id) ? get().removeFavorite(product.id) : get().addFavorite(product),
      clearFavorites: () => set({ items: [] }),
      syncWithServer: async () => {
        const email = getUserEmail();
        if (!email) return;
        try {
          const res = await fetch(`/api/favorites?email=${encodeURIComponent(email)}`);
          if (res.ok) {
            const data = await res.json();
            // Data returns array of productIds. We don't have the full Product object from the server here,
            // but if we are just syncing, we might need to fetch the actual products.
            // For now, if the user adds a favorite on this device, it's in localStorage with full Product.
            // If we just want to fetch from server, we should probably fetch the full products from /api/products based on IDs.
          }
        } catch (e) {
          console.error(e);
        }
      }
    }),
    { name: "onbsaglik-favorites" }
  )
);
