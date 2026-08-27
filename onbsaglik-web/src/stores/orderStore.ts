/**
 * Zustand ile Merkezi Sipariş Yönetim Store'u.
 * Hem kullanıcı hem admin tarafından erişilir.
 * Tüm siparişler localStorage'da merkezi olarak saklanır.
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OrderItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus = "Ödeme Bekliyor" | "Mail Order Bekliyor" | "Hazırlanıyor" | "Kargoda" | "Teslim Edildi" | "İptal Edildi";

export interface OrderRecord {
  id: string;
  date: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  carrier: string;
  paymentMethod: string;
  status: OrderStatus;
  deliveryAddress: string;
  trackingNumber: string;
  adminNote: string;
}

interface OrderStore {
  orders: OrderRecord[];
  addOrder: (order: Omit<OrderRecord, "id" | "date" | "status" | "trackingNumber" | "adminNote"> & { status?: OrderStatus }) => OrderRecord;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateTrackingNumber: (orderId: string, trackingNumber: string) => void;
  updateAdminNote: (orderId: string, note: string) => void;
  getOrders: () => OrderRecord[];
  getOrdersByEmail: (email: string) => OrderRecord[];
  getOrderById: (id: string) => OrderRecord | undefined;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [
        {
          id: "ONB-847291",
          date: "18.08.2026",
          customerEmail: "fkoc899@gmail.com",
          customerName: "Zehra Koç",
          customerPhone: "+90 553 272 38 58",
          items: [
            { id: 1, name: "Ocean Balık Yağı Şurubu Karışık Meyve Aromalı 150 ml", brand: "ORZAX", price: 479, quantity: 1, image: "/placeholder.png" },
          ],
          total: 479,
          carrier: "Kolay Gelsin",
          paymentMethod: "Kredi Kartı",
          status: "Kargoda",
          deliveryAddress: "Kayseri / Kocasinan / Yeni Mah.",
          trackingNumber: "KG123456789",
          adminNote: "",
        },
        {
          id: "ONB-523018",
          date: "20.08.2026",
          customerEmail: "fatihselda58@gmail.com",
          customerName: "Fatih Koç",
          customerPhone: "+90 541 317 65 35",
          items: [
            { id: 5, name: "La Roche Posay Anthelios UV Air Serum SPF50+", brand: "LA ROCHE POSAY", price: 549.5, quantity: 1, image: "/placeholder.png" },
            { id: 8, name: "La Roche Posay Effaclar Gel 400 ml", brand: "LA ROCHE POSAY", price: 666, quantity: 1, image: "/placeholder.png" },
          ],
          total: 1215.5,
          carrier: "Aras Kargo",
          paymentMethod: "Havale / EFT",
          status: "Hazırlanıyor",
          deliveryAddress: "Ankara / Haymana / Çalış Mh.",
          trackingNumber: "",
          adminNote: "",
        },
      ],

      addOrder: (newOrder) => {
        const record: OrderRecord = {
          ...newOrder,
          id: `ONB-${Math.floor(100000 + Math.random() * 900000)}`,
          date: new Date().toLocaleDateString("tr-TR"),
          status: newOrder.status || "Hazırlanıyor",
          trackingNumber: "",
          adminNote: "",
        };
        set((s) => ({ orders: [record, ...s.orders] }));
        return record;
      },

      updateOrderStatus: (orderId, status) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)) })),

      updateTrackingNumber: (orderId, trackingNumber) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === orderId ? { ...o, trackingNumber } : o)) })),

      updateAdminNote: (orderId, note) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === orderId ? { ...o, adminNote: note } : o)) })),

      getOrders: () => get().orders,

      getOrdersByEmail: (email) => get().orders.filter((o) => o.customerEmail === email),

      getOrderById: (id) => get().orders.find((o) => o.id === id),
    }),
    { name: "onbsaglik_all_orders" }
  )
);
