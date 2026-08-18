/**
 * Kampanya yönetimi store — localStorage tabanlı.
 * Admin panelinden kampanya eklenir, ürün kartlarında ve kampanya sayfasında gösterilir.
 */
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CampaignType = "flash" | "combo" | "discount" | "free_shipping";

export interface Campaign {
  id: string;
  /** 1. Ürün (Ana Ürün) */
  productId: number;
  productName: string;
  type: CampaignType;
  /** Flash kampanya için bitiş tarihi */
  endsAt?: string;
  /** İndirimli fiyat (discount tipinde) */
  discountedPrice?: number;
  
  /** Combo Teklif Detayları */
  /** 2. Ürün (Birlikte Alınacak / Hediye Ürün) */
  comboProductId?: number;
  comboProductName?: string;
  /** 2. Ürünün Özel Kampanyalı Fiyatı (TL) */
  comboPrice?: number;
  /** Combo açıklaması: "Bu ürünü alana X ürün Y TL" */
  comboDescription?: string;

  /** Kampanya Görseli veya Banner Başlığı */
  bannerTitle?: string;

  /** Aktif mi? */
  active: boolean;
  createdAt: string;
}

interface CampaignStore {
  campaigns: Campaign[];
  addCampaign: (c: Omit<Campaign, "id" | "createdAt">) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  removeCampaign: (id: string) => void;
  getProductCampaign: (productId: number) => Campaign | undefined;
  getActiveCampaigns: () => Campaign[];
}

export const useCampaignStore = create<CampaignStore>()(
  persist(
    (set, get) => ({
      campaigns: [
        // Varsayılan dermoeczanem tarzı zengin kampanyalar
        {
          id: "camp-default-1",
          productId: 1,
          productName: "Ocean Balık Yağı Şurubu Karışık Meyve Aromalı 150 ml",
          type: "combo",
          comboProductId: 544,
          comboProductName: "La Roche Posay Anthelios Uvmune Fluid SPF50+ 50 ml",
          comboPrice: 149.90,
          comboDescription: "Bu Ürünü Alana La Roche Posay Güneş Kremi 329 TL yerine SADECE 149.90 TL!",
          bannerTitle: "Süper Fırsat İkilisi",
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: "camp-default-2",
          productId: 543,
          productName: "La Roche Posay Effaclar Gel Temizleme Jeli 400 ml",
          type: "flash",
          endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          discountedPrice: 499.00,
          bannerTitle: "⚡ Flash Hafta Sonu İndirimi",
          active: true,
          createdAt: new Date().toISOString(),
        }
      ],

      addCampaign: (c) =>
        set((s) => ({
          campaigns: [
            ...s.campaigns,
            {
              ...c,
              id: `camp-${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateCampaign: (id, updates) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      removeCampaign: (id) =>
        set((s) => ({
          campaigns: s.campaigns.filter((c) => c.id !== id),
        })),

      getProductCampaign: (productId) =>
        get().campaigns.find((c) => (c.productId === productId || c.comboProductId === productId) && c.active),

      getActiveCampaigns: () =>
        get().campaigns.filter((c) => {
          if (!c.active) return false;
          if (c.endsAt && new Date(c.endsAt) < new Date()) return false;
          return true;
        }),
    }),
    { name: "onbsaglik-campaigns-v2" }
  )
);
