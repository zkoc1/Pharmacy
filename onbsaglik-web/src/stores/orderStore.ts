/**
 * Zustand ile Merkezi Sipariş Yönetim Store'u — orderStore.ts
 * İleri Seviye OMS: Zaman Çizelgesi (Timeline), e-Arşiv Fatura No, Toplu İşlemler ve Müşteri Notları.
 * Hem kullanıcı hem admin tarafından erişilir.
 */

"use client";

import { create } from "zustand";

export interface OrderItem {
  id: number;
  slug?: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus =
  | "Ödeme Bekliyor"
  | "Mail Order Bekliyor"
  | "Hazırlanıyor"
  | "Kargoda"
  | "Teslim Edildi"
  | "İptal Edildi";

export interface OrderTimelineItem {
  status: OrderStatus;
  date: string;
  note?: string;
}

export interface OrderRecord {
  id: string;
  invoiceNo?: string;
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
  billingAddress?: string;
  trackingNumber: string;
  adminNote: string;
  customerNote?: string;
  timeline?: OrderTimelineItem[];
}

interface OrderStore {
  orders: OrderRecord[];
  fetchOrders: () => Promise<void>;
  addOrder: (order: any) => Promise<string>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  bulkUpdateStatus: (orderIds: string[], status: OrderStatus) => Promise<void>;
  updateTrackingNumber: (orderId: string, trackingNumber: string) => Promise<void>;
  updateAdminNote: (orderId: string, note: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  getOrdersByEmail: (email: string) => OrderRecord[];
  getOrderById: (id: string) => OrderRecord | undefined;
}

export const useOrderStore = create<OrderStore>()((set, get) => ({
  orders: [],

  fetchOrders: async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        set({ orders: data });
      }
    } catch (error) {
      console.error("fetchOrders error:", error);
    }
  },

  addOrder: async (newOrder) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder)
      });
      if (res.ok) {
        const data = await res.json();
        await get().fetchOrders();
        return data.id;
      }
      return "";
    } catch (error) {
      console.error("addOrder error:", error);
      return "";
    }
  },

  updateOrderStatus: async (orderId, status, note) => {
    try {
      // Optimizasyon: Önce UI'ı güncelle
      set((s) => ({
        orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o))
      }));
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error(error);
    }
  },

  bulkUpdateStatus: async (orderIds, status) => {
    try {
      set((s) => ({
        orders: s.orders.map((o) => (orderIds.includes(o.id) ? { ...o, status } : o))
      }));
      for (const id of orderIds) {
        await fetch(`/api/admin/orders/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status })
        });
      }
    } catch (error) {
      console.error(error);
    }
  },

  updateTrackingNumber: async (orderId, trackingNumber) => {
    try {
      set((s) => ({
        orders: s.orders.map((o) => (o.id === orderId ? { ...o, trackingNumber } : o))
      }));
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber })
      });
    } catch (error) {
      console.error(error);
    }
  },

  updateAdminNote: async (orderId, adminNote) => {
    try {
      set((s) => ({
        orders: s.orders.map((o) => (o.id === orderId ? { ...o, adminNote } : o))
      }));
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote })
      });
    } catch (error) {
      console.error(error);
    }
  },

  deleteOrder: async (orderId) => {
    try {
      set((s) => ({
        orders: s.orders.filter((o) => o.id !== orderId)
      }));
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE"
      });
    } catch (error) {
      console.error(error);
    }
  },

  getOrdersByEmail: (email) => {
    return get().orders.filter(
      (o) => o.customerEmail && o.customerEmail.toLowerCase() === email.toLowerCase()
    );
  },

  getOrderById: (id) => {
    return get().orders.find((o) => o.id === id);
  }
}));
