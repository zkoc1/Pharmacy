/**
 * Zustand ile global favoriler yönetimi.
 * LocalStorage'a kalıcı kaydedilir.
 */
"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";

interface FavoritesStore {
  userEmail: string;
  favoritesByUser: Record<string, Product[]>;
  items: Product[];
  setUserEmail: (email: string) => void;
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (product: Product) => void;
  clearFavorites: () => void;
  syncWithServer: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      userEmail: "guest",
      favoritesByUser: { guest: [] },
      items: [],

      setUserEmail: (email: string) => {
        const targetEmail = email || "guest";
        const currentFavorites = get().favoritesByUser || {};
        const userItems = currentFavorites[targetEmail] || [];
        set({
          userEmail: targetEmail,
          items: userItems,
          favoritesByUser: {
            ...currentFavorites,
            [targetEmail]: userItems,
          },
        });
      },

      addFavorite: async (product) => {
        set((state) => {
          const email = state.userEmail || "guest";
          const currentItems = state.favoritesByUser[email] || state.items || [];
          if (currentItems.some((i) => i.id === product.id)) return state;

          const newItems = [...currentItems, product];
          return {
            items: newItems,
            favoritesByUser: {
              ...state.favoritesByUser,
              [email]: newItems,
            },
          };
        });

        const email = get().userEmail;
        if (email && email !== "guest") {
          fetch("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, productId: product.id }),
          }).catch(console.error);
        }
      },

      removeFavorite: async (productId) => {
        set((state) => {
          const email = state.userEmail || "guest";
          const currentItems = state.favoritesByUser[email] || state.items || [];
          const newItems = currentItems.filter((i) => i.id !== productId);

          return {
            items: newItems,
            favoritesByUser: {
              ...state.favoritesByUser,
              [email]: newItems,
            },
          };
        });

        const email = get().userEmail;
        if (email && email !== "guest") {
          fetch("/api/favorites", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, productId }),
          }).catch(console.error);
        }
      },

      isFavorite: (productId) => {
        const email = get().userEmail || "guest";
        const items = get().favoritesByUser[email] || get().items || [];
        return items.some((i) => i.id === productId);
      },

      toggleFavorite: (product) => {
        get().isFavorite(product.id) ? get().removeFavorite(product.id) : get().addFavorite(product);
      },

      clearFavorites: () => {
        set((state) => {
          const email = state.userEmail || "guest";
          return {
            items: [],
            favoritesByUser: {
              ...state.favoritesByUser,
              [email]: [],
            },
          };
        });
      },

      syncWithServer: async () => {
        const email = get().userEmail;
        if (!email || email === "guest") return;
        
        try {
          const [favRes, prodRes] = await Promise.all([
            fetch(`/api/favorites?email=${encodeURIComponent(email)}`),
            fetch(`/api/products`)
          ]);

          if (favRes.ok && prodRes.ok) {
            const favData = await favRes.json();
            const prodData = await prodRes.json();

            if (favData.success && favData.favorites) {
              const favoriteIds = favData.favorites; // array of numbers
              const serverFavorites = prodData.filter((p: Product) => favoriteIds.includes(p.id));

              set((state) => {
                // Merge local favorites with server favorites
                const currentLocal = state.favoritesByUser[email] || [];
                const mergedMap = new Map<number, Product>();
                
                // Add local first
                currentLocal.forEach(p => mergedMap.set(p.id, p));
                // Add server (overwrites if exist, but it's the same product)
                serverFavorites.forEach((p: Product) => mergedMap.set(p.id, p));

                const newItems = Array.from(mergedMap.values());

                return {
                  items: newItems,
                  favoritesByUser: {
                    ...state.favoritesByUser,
                    [email]: newItems,
                  },
                };
              });
            }
          }
        } catch (e) {
          console.error("syncWithServer error:", e);
        }
      },
    }),
    { name: "onbsaglik-favorites" }
  )
);
