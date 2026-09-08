import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";

interface AdminProductState {
  products: Product[];
  setInitialProducts: (products: Product[]) => void;
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: number, updates: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  toggleStatus: (id: number) => void;
}

export const useAdminProductStore = create<AdminProductState>()(
  persist(
    (set) => ({
      products: [],
      setInitialProducts: (initialProducts) => set((state) => {
        // Only load if state is empty
        if (state.products.length === 0) {
          return { products: initialProducts };
        }
        return state;
      }),
      addProduct: (newProd) => set((state) => {
        const newId = state.products.length > 0 ? Math.max(...state.products.map(p => p.id)) + 1 : 1;
        const fullProduct: Product = {
          ...newProd,
          id: newId,
        };
        return { products: [fullProduct, ...state.products] };
      }),
      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),
      toggleStatus: (id) => set((state) => ({
        products: state.products.map(p => 
          p.id === id 
            ? { ...p, status: p.status === "active" ? "draft" : "active" } 
            : p
        )
      })),
    }),
    {
      name: "admin-product-store",
    }
  )
);
