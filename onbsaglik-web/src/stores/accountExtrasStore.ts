/**
 * Zustand ile Stok Alarmları, Fiyat Alarmları, Havale Bildirimleri ve Hediye Çekleri Yönetimi.
 * LocalStorage'a kalıcı kaydedilir (persist).
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface StockAlertItem {
  id: string;
  productId: number;
  productSlug: string;
  productName: string;
  productImage: string;
  price: number;
  email: string;
  createdAt: string;
}

export interface PriceAlertItem {
  id: string;
  productId: number;
  productSlug: string;
  productName: string;
  productImage: string;
  currentPrice: number;
  targetPrice: number;
  createdAt: string;
}

export interface TransferNotification {
  id: string;
  orderId: string;
  bankName: string;
  senderName: string;
  amount: number;
  transferDate: string;
  note?: string;
  status: "İnceleniyor" | "Onaylandı" | "Reddedildi";
  createdAt: string;
}

export interface UserCoupon {
  id: string;
  code: string;
  discountAmount: number;
  minSpend: number;
  description: string;
  expireDate: string;
  isUsed: boolean;
}

interface AccountExtrasState {
  stockAlerts: StockAlertItem[];
  priceAlerts: PriceAlertItem[];
  transferNotifications: TransferNotification[];
  coupons: UserCoupon[];

  // Stok Alarmı Eylemleri
  addStockAlert: (alert: Omit<StockAlertItem, "id" | "createdAt">) => void;
  removeStockAlert: (id: string) => void;

  // Fiyat Alarmı Eylemleri
  addPriceAlert: (alert: Omit<PriceAlertItem, "id" | "createdAt">) => void;
  removePriceAlert: (id: string) => void;

  // Havale Bildirimi Eylemleri
  addTransferNotification: (notif: Omit<TransferNotification, "id" | "status" | "createdAt">) => void;

  // Kupon / Hediye Çeki Eylemleri
  addCoupon: (code: string) => { success: boolean; message: string; coupon?: UserCoupon };
  useCoupon: (code: string) => void;
}

export const useAccountExtrasStore = create<AccountExtrasState>()(
  persist(
    (set, get) => ({
      stockAlerts: [
        {
          id: "stock-1",
          productId: 540,
          productSlug: "la-roche-posay-anthelios-uv-air-serum-spf50-50ml",
          productName: "La Roche Posay Anthelios UV Air Serum SPF50+ 50 ml",
          productImage: "/products/la-roche-posay-anthelios-uv-air-serum-50ml.png",
          price: 549.5,
          email: "saglikonb@gmail.com",
          createdAt: "2026-08-27T10:00:00.000Z",
        },
      ],

      priceAlerts: [
        {
          id: "price-1",
          productId: 546,
          productSlug: "la-roche-posay-effaclar-duo-m-cilt-kusurlari-karsiti-bakim-kremi-40ml",
          productName: "La Roche Posay Effaclar Duo+ M Cilt Kusurları Karşıtı Bakım Kremi 40 ml",
          productImage: "/products/la-roche-posay-effaclar-duo-m-40ml.png",
          currentPrice: 630,
          targetPrice: 550,
          createdAt: "2026-08-27T14:30:00.000Z",
        },
      ],

      transferNotifications: [],

      coupons: [
        {
          id: "cp-1",
          code: "HOSGELDIN50",
          discountAmount: 50,
          minSpend: 250,
          description: "Yeni üyelere özel 250 TL üzeri alışverişlerde 50 TL indirim",
          expireDate: "31.12.2026",
          isUsed: false,
        },
        {
          id: "cp-2",
          code: "ONB100",
          discountAmount: 100,
          minSpend: 500,
          description: "500 TL üzeri tüm siparişlerde 100 TL süper indirim",
          expireDate: "30.09.2026",
          isUsed: false,
        },
      ],

      addStockAlert: (alert) =>
        set((s) => ({
          stockAlerts: [
            ...s.stockAlerts.filter((a) => a.productId !== alert.productId),
            {
              ...alert,
              id: `stock-${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      removeStockAlert: (id) =>
        set((s) => ({
          stockAlerts: s.stockAlerts.filter((a) => a.id !== id),
        })),

      addPriceAlert: (alert) =>
        set((s) => ({
          priceAlerts: [
            ...s.priceAlerts.filter((a) => a.productId !== alert.productId),
            {
              ...alert,
              id: `price-${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      removePriceAlert: (id) =>
        set((s) => ({
          priceAlerts: s.priceAlerts.filter((a) => a.id !== id),
        })),

      addTransferNotification: (notif) =>
        set((s) => ({
          transferNotifications: [
            {
              ...notif,
              id: `HV-${Date.now().toString().slice(-6)}`,
              status: "İnceleniyor",
              createdAt: new Date().toLocaleDateString("tr-TR"),
            },
            ...s.transferNotifications,
          ],
        })),

      addCoupon: (code) => {
        const clean = code.trim().toUpperCase();
        const existing = get().coupons.find((c) => c.code === clean);
        if (existing) {
          return { success: false, message: `"${clean}" kuponu zaten hesabınızda tanımlı.` };
        }

        const validCoupons: Record<string, { amount: number; min: number; desc: string }> = {
          ONB100: { amount: 100, min: 500, desc: "500 TL üzeri 100 TL İndirim Kuponu" },
          HOSGELDIN50: { amount: 50, min: 250, desc: "Hoş Geldin 50 TL İndirim Kuponu" },
          SAGLIK20: { amount: 20, min: 100, desc: "Tüm Ürünlerde Geçerli 20 TL İndirim Kuponu" },
          ECZANE150: { amount: 150, min: 750, desc: "Bahar Kampanyası 150 TL İndirim Kuponu" },
        };

        if (validCoupons[clean]) {
          const info = validCoupons[clean];
          const newCoupon: UserCoupon = {
            id: `cp-${Date.now()}`,
            code: clean,
            discountAmount: info.amount,
            minSpend: info.min,
            description: info.desc,
            expireDate: "31.12.2026",
            isUsed: false,
          };
          set((s) => ({ coupons: [newCoupon, ...s.coupons] }));
          return { success: true, message: `"${clean}" hediye çeki başarıyla hesabınıza eklendi! 🎉`, coupon: newCoupon };
        }

        return { success: false, message: "Geçersiz veya süresi dolmuş bir kupon kodu girdiniz." };
      },

      useCoupon: (code) =>
        set((s) => ({
          coupons: s.coupons.map((c) => (c.code === code ? { ...c, isUsed: true } : c)),
        })),
    }),
    { name: "onbsaglik-account-extras" }
  )
);
