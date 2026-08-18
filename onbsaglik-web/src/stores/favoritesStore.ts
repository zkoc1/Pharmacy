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
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],
      addFavorite: (product) => set((s) => ({ items: s.items.some(i => i.id === product.id) ? s.items : [...s.items, product] })),
      removeFavorite: (productId) => set((s) => ({ items: s.items.filter(i => i.id !== productId) })),
      isFavorite: (productId) => get().items.some(i => i.id === productId),
      toggleFavorite: (product) => get().isFavorite(product.id) ? get().removeFavorite(product.id) : get().addFavorite(product),
      clearFavorites: () => set({ items: [] }),
    }),
    { name: "onbsaglik-favorites" }
  )
);
