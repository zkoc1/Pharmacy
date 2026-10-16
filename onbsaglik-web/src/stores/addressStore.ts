"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  // Geriye dönük uyumluluk için metotlar
  addAddress: (addr: Omit<Address, "id">) => Address;
  removeAddress: (id: string) => void;
  getUserAddresses: (userEmail?: string) => Address[];
}

export const useAddressStore = create<AddressStore>()(
  persist(
    (set, get) => ({
      addresses: [],
      loading: false,

      setAddresses: (addresses) => set({ addresses }),

      syncAddresses: async () => {
        set({ loading: true });
        try {
          const res = await fetch("/api/user/addresses");
          if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.addresses) && data.addresses.length > 0) {
              const mapped = data.addresses.map((a: any) => ({
                id: a.id,
                userEmail: a.user_email,
                title: a.title,
                fullName: a.full_name,
                phone: a.phone,
                city: a.city,
                district: a.district,
                neighborhood: a.neighborhood,
                fullAddress: a.address_line,
                isDefault: a.is_default,
              }));
              set({ addresses: mapped });
            }
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
              neighborhood: addr.neighborhood,
              address_line: addr.fullAddress,
              is_default: addr.isDefault,
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
              neighborhood: updates.neighborhood,
              address_line: updates.fullAddress,
              is_default: updates.isDefault,
            }),
          });
          if (res.ok) await get().syncAddresses();
        } catch (err) {
          console.error(err);
        }
      },

      addAddress: (addr) => {
        get().addAddressAsync(addr);
        const newAddr: Address = { ...addr, id: "addr-" + Date.now() };
        set((s) => ({ addresses: [newAddr, ...s.addresses.filter(a => a.id !== newAddr.id)] }));
        return newAddr;
      },

      removeAddress: (id) => {
        get().removeAddressAsync(id);
        set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) }));
      },

      getUserAddresses: (userEmail) => {
        const list = get().addresses;
        if (!userEmail) return list;
        const filtered = list.filter(
          (a) => !a.userEmail || a.userEmail.toLowerCase() === userEmail.toLowerCase()
        );
        return filtered.length > 0 ? filtered : list;
      },
    }),
    {
      name: "onbsaglik-addresses",
      partialize: (state) => ({ addresses: state.addresses }),
    }
  )
);
