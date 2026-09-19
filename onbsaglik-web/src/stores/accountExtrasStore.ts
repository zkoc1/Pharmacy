/**
 * Zustand ile Stok AlarmlarÄ±, Fiyat AlarmlarÄ±, Havale Bildirimleri ve Hediye Ã‡ekleri YÃ¶netimi.
 * KullanÄ±cÄ± kimliÄŸine (userEmail) gÃ¶re kiÅŸiye Ã¶zel saklanÄ±r.
 * LocalStorage'a kalÄ±cÄ± kaydedilir (persist).
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface StockAlertItem {
  id: string;
  userEmail?: string;
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
  userEmail?: string;
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
  userEmail?: string;
  orderId: string;
  bankName: string;
  senderName: string;
  amount: number;
  transferDate: string;
  note?: string;
  status: "Ä°nceleniyor" | "OnaylandÄ±" | "Reddedildi";
  createdAt: string;
}

export interface UserCoupon {
  id: string;
  userEmail?: string;
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

  // Yeni Backend MetotlarÄ±
  syncAlarms: () => Promise<void>;
  removeStockAlertAsync: (id: string) => Promise<void>;
  removePriceAlertAsync: (id: string) => Promise<void>;

  syncTransferNotifications: () => Promise<void>;
  addTransferNotificationAsync: (notif: Omit<TransferNotification, "id" | "status" | "createdAt">) => Promise<void>;

  // Stok AlarmÄ± Eylemleri
  addStockAlert: (alert: Omit<StockAlertItem, "id" | "createdAt">) => void;
  removeStockAlert: (id: string) => void;
  getUserStockAlerts: (userEmail?: string) => StockAlertItem[];

  // Fiyat AlarmÄ± Eylemleri
  addPriceAlert: (alert: Omit<PriceAlertItem, "id" | "createdAt">) => void;
  removePriceAlert: (id: string) => void;
  getUserPriceAlerts: (userEmail?: string) => PriceAlertItem[];

  // Havale Bildirimi Eylemleri
  addTransferNotification: (notif: Omit<TransferNotification, "id" | "status" | "createdAt">) => void;
  getUserTransferNotifications: (userEmail?: string) => TransferNotification[];

  // Kupon / Hediye Ã‡eki Eylemleri
  addCoupon: (code: string, userEmail?: string) => { success: boolean; message: string; coupon?: UserCoupon };
  useCoupon: (code: string) => void;
  getUserCoupons: (userEmail?: string) => UserCoupon[];
  grantReviewReward: (userEmail: string) => string;
}

export const useAccountExtrasStore = create<AccountExtrasState>()(
  persist(
    (set, get) => ({
      stockAlerts: [],
      priceAlerts: [],
      transferNotifications: [],


      syncAlarms: async () => {
        try {
          const resPrice = await fetch("/api/user/alarms?type=price");
          if (resPrice.ok) {
            const data = await resPrice.json();
            const mappedPrice = data.alarms.map((a: any) => ({
              id: a.id,
              userEmail: a.user_email,
              productId: a.product_id,
              productSlug: a.products?.slug,
              productName: a.products?.name,
              productImage: a.products?.images?.[0] || "/placeholder.png",
              currentPrice: a.products?.price,
              targetPrice: a.target_price,
              createdAt: a.created_at,
            }));
            set({ priceAlerts: mappedPrice });
          }

          const resStock = await fetch("/api/user/alarms?type=stock");
          if (resStock.ok) {
            const data = await resStock.json();
            const mappedStock = data.alarms.map((a: any) => ({
              id: a.id,
              userEmail: a.user_email,
              productId: a.product_id,
              productSlug: a.products?.slug,
              productName: a.products?.name,
              productImage: a.products?.images?.[0] || "/placeholder.png",
              price: a.products?.price || 0,
              createdAt: a.created_at,
            }));
            set({ stockAlerts: mappedStock });
          }
        } catch (error) {
          console.error("Alarmlar eÅŸitlenemedi", error);
        }
      },

      removeStockAlertAsync: async (id) => {
        try {
          const res = await fetch(`/api/user/alarms?type=stock&id=${id}`, { method: "DELETE" });
          if (res.ok) await get().syncAlarms();
        } catch (e) {}
      },

      removePriceAlertAsync: async (id) => {
        try {
          const res = await fetch(`/api/user/alarms?type=price&id=${id}`, { method: "DELETE" });
          if (res.ok) await get().syncAlarms();
        } catch (e) {}
      },

      syncTransferNotifications: async () => {
        try {
          const res = await fetch("/api/user/transfer-notifications");
          if (res.ok) {
            const data = await res.json();
            const mapped = data.notifications.map((n: any) => ({
              id: n.id,
              userEmail: n.user_email,
              bankName: n.bank_name,
              senderName: n.sender_name,
              amount: n.amount,
              transferDate: n.transfer_date,
              status: n.status,
              createdAt: new Date(n.created_at).toLocaleDateString("tr-TR"),
            }));
            set({ transferNotifications: mapped });
          }
        } catch (e) {
          console.error(e);
        }
      },

      addTransferNotificationAsync: async (notif) => {
        try {
          const res = await fetch("/api/user/transfer-notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bank_name: notif.bankName,
              sender_name: notif.senderName,
              amount: notif.amount,
              transfer_date: notif.transferDate
            })
          });
          if (res.ok) await get().syncTransferNotifications();
        } catch (e) {}
      },

      coupons: [
        {
          id: "cp-1",
          code: "HOSGELDIN50",
          discountAmount: 50,
          minSpend: 250,
          description: "Yeni Ã¼yelere Ã¶zel 250 TL Ã¼zeri alÄ±ÅŸveriÅŸlerde 50 TL indirim",
          expireDate: "31.12.2026",
          isUsed: false,
        },
        {
          id: "cp-2",
          code: "ONB100",
          discountAmount: 100,
          minSpend: 500,
          description: "500 TL Ã¼zeri tÃ¼m sipariÅŸlerde 100 TL sÃ¼per indirim",
          expireDate: "30.09.2026",
          isUsed: false,
        },
      ],

      addStockAlert: (alert) =>
        set((s) => ({
          stockAlerts: [
            ...s.stockAlerts.filter((a) => a.productId !== alert.productId || (alert.userEmail && a.userEmail !== alert.userEmail)),
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

      getUserStockAlerts: (userEmail?: string) => {
        if (!userEmail) return get().stockAlerts;
        return get().stockAlerts.filter(
          (a) => !a.userEmail || a.userEmail.toLowerCase() === userEmail.toLowerCase()
        );
      },

      addPriceAlert: (alert) =>
        set((s) => ({
          priceAlerts: [
            ...s.priceAlerts.filter((a) => a.productId !== alert.productId || (alert.userEmail && a.userEmail !== alert.userEmail)),
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

      getUserPriceAlerts: (userEmail?: string) => {
        if (!userEmail) return get().priceAlerts;
        return get().priceAlerts.filter(
          (a) => !a.userEmail || a.userEmail.toLowerCase() === userEmail.toLowerCase()
        );
      },

      addTransferNotification: (notif) => {
        get().addTransferNotificationAsync(notif);
      },

      getUserTransferNotifications: (userEmail?: string) => {
        if (!userEmail) return get().transferNotifications;
        return get().transferNotifications.filter(
          (n) => !n.userEmail || n.userEmail.toLowerCase() === userEmail.toLowerCase()
        );
      },

      addCoupon: (code, userEmail?: string) => {
        const clean = code.trim().toUpperCase();
        const existing = get().coupons.find(
          (c) => c.code === clean && (!userEmail || !c.userEmail || c.userEmail === userEmail)
        );
        if (existing) {
          return { success: false, message: `"${clean}" kuponu zaten hesabÄ±nÄ±zda tanÄ±mlÄ±.` };
        }

        const validCoupons: Record<string, { amount: number; min: number; desc: string }> = {
          ONB100: { amount: 100, min: 500, desc: "500 TL Ã¼zeri 100 TL Ä°ndirim Kuponu" },
          HOSGELDIN50: { amount: 50, min: 250, desc: "HoÅŸ Geldin 50 TL Ä°ndirim Kuponu" },
          SAGLIK20: { amount: 20, min: 100, desc: "TÃ¼m ÃœrÃ¼nlerde GeÃ§erli 20 TL Ä°ndirim Kuponu" },
          ECZANE150: { amount: 150, min: 750, desc: "Bahar KampanyasÄ± 150 TL Ä°ndirim Kuponu" },
          ILK100: { amount: 100, min: 500, desc: "Ä°lk SipariÅŸe Ã–zel 100 TL Ä°ndirim" },
          YORUM5: { amount: 5, min: 0, desc: "Yorum Ã–dÃ¼lÃ¼ 5 TL Hediye Ã‡eki" },
        };

        if (validCoupons[clean]) {
          const info = validCoupons[clean];
          const newCoupon: UserCoupon = {
            id: `cp-${Date.now()}`,
            userEmail,
            code: clean,
            discountAmount: info.amount,
            minSpend: info.min,
            description: info.desc,
            expireDate: "31.12.2026",
            isUsed: false,
          };
          set((s) => ({ coupons: [newCoupon, ...s.coupons] }));
          return { success: true, message: `"${clean}" hediye Ã§eki baÅŸarÄ±yla hesabÄ±nÄ±za eklendi! ğŸ‰`, coupon: newCoupon };
        }

        return { success: false, message: "GeÃ§ersiz veya sÃ¼resi dolmuÅŸ bir kupon kodu girdiniz." };
      },

      grantReviewReward: (userEmail: string) => {
        const rewardCode = `YORUM5-${Date.now()}`;
        const newCoupon: UserCoupon = {
          id: `cp-${Date.now()}`,
          userEmail,
          code: rewardCode,
          discountAmount: 5,
          minSpend: 0,
          description: "Yorum Ã–dÃ¼lÃ¼ 5 TL Hediye Ã‡eki",
          expireDate: "31.12.2026",
          isUsed: false,
        };
        set((s) => ({ coupons: [newCoupon, ...s.coupons] }));
        return rewardCode;
      },

      useCoupon: (code) =>
        set((s) => ({
          coupons: s.coupons.map((c) => (c.code === code ? { ...c, isUsed: true } : c)),
        })),

      getUserCoupons: (userEmail?: string) => {
        if (!userEmail) return get().coupons;
        return get().coupons.filter(
          (c) => !c.userEmail || c.userEmail.toLowerCase() === userEmail.toLowerCase()
        );
      },
    }),
    { name: "onbsaglik-account-extras" }
  )
);
