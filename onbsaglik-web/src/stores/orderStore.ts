/**
 * Zustand ile Merkezi Sipariş Yönetim Store'u — orderStore.ts
 * İleri Seviye OMS: Zaman Çizelgesi (Timeline), e-Arşiv Fatura No, Toplu İşlemler ve Müşteri Notları.
 * Hem kullanıcı hem admin tarafından erişilir.
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  addOrder: (
    order: Omit<OrderRecord, "id" | "date" | "status" | "trackingNumber" | "adminNote"> & {
      status?: OrderStatus;
    }
  ) => OrderRecord;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  bulkUpdateStatus: (orderIds: string[], status: OrderStatus) => void;
  updateTrackingNumber: (orderId: string, trackingNumber: string) => void;
  updateAdminNote: (orderId: string, note: string) => void;
  deleteOrder: (orderId: string) => void;
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
          invoiceNo: "ONB2026000001",
          date: "18.08.2026 14:32",
          customerEmail: "fkoc899@gmail.com",
          customerName: "Zehra Koç",
          customerPhone: "+90 553 272 38 58",
          items: [
            {
              id: 1,
              slug: "ocean-balik-yagi-surubu-karisik-meyve-aromali-150-ml-cocuklar-icin-omega-3-orzax",
              name: "Ocean Balık Yağı Şurubu Karışık Meyve Aromalı 150 ml",
              brand: "ORZAX",
              price: 479,
              quantity: 1,
              image: "/products/ocean-balik-yagi.png",
            },
          ],
          total: 479,
          carrier: "Kolay Gelsin",
          paymentMethod: "Kredi Kartı",
          status: "Kargoda",
          deliveryAddress: "Kayseri / Kocasinan / Yeni Mah. Bağdat Cad. No: 14 D: 3",
          billingAddress: "Kayseri / Kocasinan / Yeni Mah. Bağdat Cad. No: 14 D: 3",
          trackingNumber: "KG123456789",
          adminNote: "Kargo paketi özenli sarıldı.",
          customerNote: "Zil çalınmasın lütfen, bebek uyuyor.",
          timeline: [
            { status: "Ödeme Bekliyor", date: "18.08.2026 14:32", note: "Sipariş oluşturuldu" },
            { status: "Hazırlanıyor", date: "18.08.2026 15:10", note: "Ödeme onaylandı, depoya iletildi" },
            { status: "Kargoda", date: "19.08.2026 10:00", note: "Kolay Gelsin kuryesine teslim edildi (KG123456789)" },
          ],
        },
        {
          id: "ONB-523018",
          invoiceNo: "ONB2026000002",
          date: "20.08.2026 11:15",
          customerEmail: "fatihselda58@gmail.com",
          customerName: "Fatih Koç",
          customerPhone: "+90 541 317 65 35",
          items: [
            {
              id: 540,
              slug: "la-roche-posay-anthelios-uv-air-serum-spf50-50ml",
              name: "La Roche Posay Anthelios UV Air Serum SPF50+ 50 ml",
              brand: "LA ROCHE POSAY",
              price: 549.5,
              quantity: 1,
              image: "/products/la-roche-posay-anthelios-uv-air-serum-50ml.png",
            },
            {
              id: 545,
              slug: "la-roche-posay-effaclar-gel-400ml",
              name: "La Roche Posay Effaclar Gel 400 ml",
              brand: "LA ROCHE POSAY",
              price: 666,
              quantity: 1,
              image: "/products/la-roche-posay-effaclar-gel-400ml.png",
            },
          ],
          total: 1215.5,
          carrier: "Aras Kargo",
          paymentMethod: "Havale / EFT",
          status: "Hazırlanıyor",
          deliveryAddress: "Ankara / Haymana / Çalış Mh. Atatürk Bulv. No: 42",
          billingAddress: "Ankara / Haymana / Çalış Mh. Atatürk Bulv. No: 42",
          trackingNumber: "",
          adminNote: "Havale dekontu kontrol edildi, tutar hesapta görüldü.",
          timeline: [
            { status: "Ödeme Bekliyor", date: "20.08.2026 11:15", note: "Havale bekleniyor" },
            { status: "Hazırlanıyor", date: "20.08.2026 12:40", note: "Havale onaylandı, ürünler paketleniyor" },
          ],
        },
      ],

      addOrder: (newOrder) => {
        const orderCount = get().orders.length + 1;
        const now = new Date();
        const dateStr = `${now.toLocaleDateString("tr-TR")} ${now.toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
        const initialStatus = newOrder.status || "Hazırlanıyor";

        const record: OrderRecord = {
          ...newOrder,
          id: `ONB-${Math.floor(100000 + Math.random() * 900000)}`,
          invoiceNo: `ONB2026${orderCount.toString().padStart(6, "0")}`,
          date: dateStr,
          status: initialStatus,
          trackingNumber: "",
          adminNote: "",
          timeline: [
            {
              status: initialStatus,
              date: dateStr,
              note: "Sipariş sisteme kaydedildi",
            },
          ],
        };

        set((s) => ({ orders: [record, ...s.orders] }));
        return record;
      },

      updateOrderStatus: (orderId, status, note) => {
        const now = new Date();
        const dateStr = `${now.toLocaleDateString("tr-TR")} ${now.toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        })}`;

        set((s) => ({
          orders: s.orders.map((o) => {
            if (o.id === orderId) {
              const currentTimeline = o.timeline || [];
              return {
                ...o,
                status,
                timeline: [
                  ...currentTimeline,
                  {
                    status,
                    date: dateStr,
                    note: note || `Durum "${status}" olarak güncellendi`,
                  },
                ],
              };
            }
            return o;
          }),
        }));
      },

      bulkUpdateStatus: (orderIds, status) => {
        const now = new Date();
        const dateStr = `${now.toLocaleDateString("tr-TR")} ${now.toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        })}`;

        set((s) => ({
          orders: s.orders.map((o) => {
            if (orderIds.includes(o.id)) {
              const currentTimeline = o.timeline || [];
              return {
                ...o,
                status,
                timeline: [
                  ...currentTimeline,
                  {
                    status,
                    date: dateStr,
                    note: `Toplu işlem: Durum "${status}" yapıldı`,
                  },
                ],
              };
            }
            return o;
          }),
        }));
      },

      updateTrackingNumber: (orderId, trackingNumber) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === orderId ? { ...o, trackingNumber } : o)),
        })),

      updateAdminNote: (orderId, note) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === orderId ? { ...o, adminNote: note } : o)),
        })),

      deleteOrder: (orderId) =>
        set((s) => ({
          orders: s.orders.filter((o) => o.id !== orderId),
        })),

      getOrders: () => get().orders,

      getOrdersByEmail: (email) =>
        get().orders.filter(
          (o) => o.customerEmail && o.customerEmail.toLowerCase() === email.toLowerCase()
        ),

      getOrderById: (id) => get().orders.find((o) => o.id === id),
    }),
    { name: "onbsaglik_all_orders" }
  )
);
