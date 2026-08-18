/**
 * Kampanya yönetimi store — localStorage tabanlı.
 * Admin panelinden kampanya eklenir, ürün kartlarında rozetler gösterilir.
 */
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CampaignType = "flash" | "combo" | "discount" | "free_shipping";

export interface Campaign {
  id: string;
  productId: number;
  productName: string;
  type: CampaignType;
  /** Flash kampanya için bitiş tarihi */
  endsAt?: string;
  /** İndirimli fiyat (discount tipinde) */
  discountedPrice?: number;
  /** Combo açıklaması: "Bu ürünü alana X ürün Y TL" */
  comboDescription?: string;
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
      campaigns: [],

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
        get().campaigns.find((c) => c.productId === productId && c.active),

      getActiveCampaigns: () =>
        get().campaigns.filter((c) => {
          if (!c.active) return false;
          if (c.endsAt && new Date(c.endsAt) < new Date()) return false;
          return true;
        }),
    }),
    { name: "onbsaglik-campaigns" }
  )
);
