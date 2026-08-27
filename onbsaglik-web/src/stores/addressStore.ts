/**
 * Zustand ile müşteri teslimat adresleri yönetimi.
 * LocalStorage'a kalıcı kaydedilir.
 */
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Address {
  id: string;
  title: string; // Ev, İş, Yazlık vb.
  fullName: string;
  phone: string;
  city: string;
  district: string;
  neighborhood?: string;
  fullAddress: string;
  isDefault?: boolean;
}

interface AddressStore {
  addresses: Address[];
  addAddress: (addr: Omit<Address, "id">) => Address;
  removeAddress: (id: string) => void;
  updateAddress: (id: string, addr: Partial<Address>) => void;
  getDefaultAddress: () => Address | undefined;
}

export const useAddressStore = create<AddressStore>()(
  persist(
    (set, get) => ({
      addresses: [],

      addAddress: (addr) => {
        const newId = `addr-${Date.now()}`;
        const isFirst = get().addresses.length === 0;
        const newAddr = { ...addr, id: newId, isDefault: isFirst || addr.isDefault };
        set((s) => ({
          addresses: [...s.addresses, newAddr],
        }));
        return newAddr;
      },

      removeAddress: (id) =>
        set((s) => ({
          addresses: s.addresses.filter((a) => a.id !== id),
        })),

      updateAddress: (id, updates) =>
        set((s) => ({
          addresses: s.addresses.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),

      getDefaultAddress: () => {
        const list = get().addresses;
        return list.find((a) => a.isDefault) || list[0];
      },
    }),
    { name: "onbsaglik-addresses" }
  )
);
