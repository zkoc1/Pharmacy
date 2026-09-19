/**
 * Zustand ile Stok Alarmları, Fiyat Alarmları, Havale Bildirimleri ve Hediye Çekleri Yönetimi.
 * Kullanıcı kimliğine (userEmail) göre kişiye özel saklanır.
 * LocalStorage'a kalıcı kaydedilir (persist).
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
  status: "İnceleniyor" | "Onaylandı" | "Reddedildi";
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

  // Yeni Backend Metotları
  syncAlarms: () => Promise<void>;
  removeStockAlertAsync: (id: string) => Promise<void>;
  removePriceAlertAsync: (id: string) => Promise<void>;

  syncTransferNotifications: () => Promise<void>;
  addTransferNotificationAsync: (notif: Omit<TransferNotification, "id" | "status" | "createdAt">) => Promise<void>;

  // Stok Alarmı Eylemleri
  addStockAlert: (alert: Omit<StockAlertItem, "id" | "createdAt">) => void;
  removeStockAlert: (id: string) => void;
  getUserStockAlerts: (userEmail?: string) => StockAlertItem[];

  // Fiyat Alarmı Eylemleri
  addPriceAlert: (alert: Omit<PriceAlertItem, "id" | "createdAt">) => void;
  removePriceAlert: (id: string) => void;
  getUserPriceAlerts: (userEmail?: string) => PriceAlertItem[];

  // Havale Bildirimi Eylemleri
  addTransferNotification: (notif: Omit<TransferNotification, "id" | "status" | "createdAt">) => void;
  getUserTransferNotifications: (userEmail?: string) => TransferNotification[];

  // Kupon / Hediye Çeki Eylemleri
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
          console.error("Alarmlar eşitlenemedi", error);
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
          return { success: false, message: `"${clean}" kuponu zaten hesabınızda tanımlı.` };
        }

        const validCoupons: Record<string, { amount: number; min: number; desc: string }> = {
          ONB100: { amount: 100, min: 500, desc: "500 TL üzeri 100 TL İndirim Kuponu" },
          HOSGELDIN50: { amount: 50, min: 250, desc: "Hoş Geldin 50 TL İndirim Kuponu" },
          SAGLIK20: { amount: 20, min: 100, desc: "Tüm Ürünlerde Geçerli 20 TL İndirim Kuponu" },
          ECZANE150: { amount: 150, min: 750, desc: "Bahar Kampanyası 150 TL İndirim Kuponu" },
          ILK100: { amount: 100, min: 500, desc: "İlk Siparişe Özel 100 TL İndirim" },
          YORUM5: { amount: 5, min: 0, desc: "Yorum Ödülü 5 TL Hediye Çeki" },
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
          return { success: true, message: `"${clean}" hediye çeki başarıyla hesabınıza eklendi! ğŸ‰`, coupon: newCoupon };
        }

        return { success: false, message: "Geçersiz veya süresi dolmuş bir kupon kodu girdiniz." };
      },

      grantReviewReward: (userEmail: string) => {
        const rewardCode = `YORUM5-${Date.now()}`;
        const newCoupon: UserCoupon = {
          id: `cp-${Date.now()}`,
          userEmail,
          code: rewardCode,
          discountAmount: 5,
          minSpend: 0,
          description: "Yorum Ödülü 5 TL Hediye Çeki",
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
