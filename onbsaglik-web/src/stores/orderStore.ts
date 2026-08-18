/**
 * Zustand ile Kullanıcı Siparişleri Yönetim Store'u.
 * Siparişler localStorage'a kaydedilir ve Hesabım > Siparişlerim sayfasında gösterilir.
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "./cartStore";

export interface OrderRecord {
  id: string;
  date: string;
  items: {
    id: number;
    name: string;
    brand: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  total: number;
  carrier: string;
  paymentMethod: string;
  status: "Hazırlanıyor" | "Kargoda" | "Teslim Edildi" | "Ödeme Bekliyor";
  deliveryAddress: string;
}

interface OrderStore {
  orders: OrderRecord[];
  addOrder: (order: Omit<OrderRecord, "id" | "date" | "status">) => OrderRecord;
  getOrders: () => OrderRecord[];
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [
        {
          id: "ONB-20260818-8472",
          date: "18.08.2026",
          items: [
            {
              id: 1,
              name: "Ocean Balık Yağı Şurubu Karışık Meyve Aromalı 150 ml",
              brand: "ORZAX",
              price: 249.9,
              quantity: 1,
              image: "/placeholder.png",
            },
          ],
          total: 249.9,
          carrier: "Kolay Gelsin",
          paymentMethod: "Kredi Kartı",
          status: "Kargoda",
          deliveryAddress: "Kayseri / Kocasinan / YENİ MAH",
        },
      ],
      addOrder: (newOrder) => {
        const orderRecord: OrderRecord = {
          ...newOrder,
          id: `ONB-${Date.now().toString().slice(-6)}`,
          date: new Date().toLocaleDateString("tr-TR"),
          status: "Hazırlanıyor",
        };
        set((state) => ({ orders: [orderRecord, ...state.orders] }));
        return orderRecord;
      },
      getOrders: () => get().orders,
    }),
    { name: "onbsaglik_user_orders" }
  )
);
