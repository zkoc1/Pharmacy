import { create } from "zustand";
import type { Product } from "@/types";

interface AdminProductState {
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: number, updates: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  toggleStatus: (id: number) => void;
}

export const useAdminProductStore = create<AdminProductState>((set) => ({
  products: [],
  setProducts: (products) => set({ products }),
  addProduct: (newProd) => set((state) => ({ 
    products: [newProd, ...state.products] 
  })),
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
}));
