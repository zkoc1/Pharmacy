"use client";

import { create } from "zustand";

export interface Address {
  id: string;
  userEmail?: string;
  title: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  neighborhood?: string;
  fullAddress: string; // db: address_line
  isDefault?: boolean;
}

interface AddressStore {
  addresses: Address[];
  loading: boolean;
  setAddresses: (addresses: Address[]) => void;
  syncAddresses: () => Promise<void>;
  addAddressAsync: (addr: Omit<Address, "id">) => Promise<void>;
  removeAddressAsync: (id: string) => Promise<void>;
  updateAddressAsync: (id: string, updates: Partial<Address>) => Promise<void>;
  // Geriye dönük uyumluluk için eski metotlar (mock olarak kalsın ama API cagırsın)
  addAddress: (addr: Omit<Address, "id">) => Address;
  removeAddress: (id: string) => void;
  getUserAddresses: (userEmail?: string) => Address[];
}

export const useAddressStore = create<AddressStore>()((set, get) => ({
  addresses: [],
  loading: false,

  setAddresses: (addresses) => set({ addresses }),

  syncAddresses: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/user/addresses");
      if (res.ok) {
        const data = await res.json();
        // Veritabanı yapısını store yapısına çevir
        const mapped = data.addresses.map((a: any) => ({
          id: a.id,
          userEmail: a.user_email,
          title: a.title,
          fullName: a.full_name,
          phone: a.phone,
          city: a.city,
          district: a.district,
          fullAddress: a.address_line,
          isDefault: a.is_default
        }));
        set({ addresses: mapped });
      }
    } catch (error) {
      console.error("Adresler senkronize edilemedi:", error);
    } finally {
      set({ loading: false });
    }
  },

  addAddressAsync: async (addr) => {
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: addr.title,
          full_name: addr.fullName,
          phone: addr.phone,
          city: addr.city,
          district: addr.district,
          address_line: addr.fullAddress,
          is_default: addr.isDefault
        }),
      });
      if (res.ok) {
        await get().syncAddresses();
      }
    } catch (err) {
      console.error(err);
    }
  },

  removeAddressAsync: async (id) => {
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
      if (res.ok) await get().syncAddresses();
    } catch (err) {
      console.error(err);
    }
  },

  updateAddressAsync: async (id, updates) => {
    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updates.title,
          full_name: updates.fullName,
          phone: updates.phone,
          city: updates.city,
          district: updates.district,
          address_line: updates.fullAddress,
          is_default: updates.isDefault
        }),
      });
      if (res.ok) await get().syncAddresses();
    } catch (err) {
      console.error(err);
    }
  },

  // Geriye dönük uyumluluk
  addAddress: (addr) => {
    get().addAddressAsync(addr);
    // Hemen UI güncellensin diye geçici ekle
    const newAddr = { ...addr, id: "temp-" + Date.now() }; set((s) => ({ addresses: [...s.addresses, newAddr] })); return newAddr;
  },
  
  removeAddress: (id) => {
    get().removeAddressAsync(id);
    set((s) => ({ addresses: s.addresses.filter(a => a.id !== id) }));
  },

  getUserAddresses: (userEmail) => {
    if (!userEmail) return get().addresses;
    return get().addresses.filter(a => !a.userEmail || a.userEmail.toLowerCase() === userEmail.toLowerCase());
  }
}));

