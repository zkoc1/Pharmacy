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
  fullAddress: string;
  isDefault?: boolean;
}

interface AddressStore {
  addresses: Address[];
  addAddress: (addr: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;
  updateAddress: (id: string, addr: Partial<Address>) => void;
  getDefaultAddress: () => Address | undefined;
}

export const useAddressStore = create<AddressStore>()(
  persist(
    (set, get) => ({
      addresses: [
        {
          id: "addr-1",
          title: "Ev Adresim",
          fullName: "Değerli Müşterimiz",
          phone: "05551234567",
          city: "İstanbul",
          district: "Kadıköy",
          fullAddress: "Caferağa Mah. Moda Cad. No: 42 Daire: 5",
          isDefault: true,
        },
      ],

      addAddress: (addr) =>
        set((s) => {
          const newId = `addr-${Date.now()}`;
          const isFirst = s.addresses.length === 0;
          return {
            addresses: [
              ...s.addresses,
              { ...addr, id: newId, isDefault: isFirst || addr.isDefault },
            ],
          };
        }),

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
