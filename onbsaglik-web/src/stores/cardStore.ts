/**
 * Zustand ile Kayıtlı Kartlar Yönetimi — cardStore.ts
 * Kullanıcının ödemelerde tek tıkla seçebilmesi için kayıtlı kartları yönetir.
 * Güvenlik (PCI-DSS): CVV asla saklanmaz, kart numarası maskelenir.
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SavedCard {
  id: string;
  cardName: string;
  cardNumberMasked: string; // Örn: 5528 **** **** 4829
  cardLast4: string;
  expireMonth: string;
  expireYear: string;
  cardType: "Mastercard" | "Visa" | "Troy" | "Diğer";
  isDefault?: boolean;
}

interface CardStore {
  cards: SavedCard[];
  addCard: (card: Omit<SavedCard, "id">) => SavedCard;
  removeCard: (id: string) => void;
  getCards: () => SavedCard[];
}

export const useCardStore = create<CardStore>()(
  persist(
    (set, get) => ({
      cards: [],

      addCard: (card) => {
        const newId = `card-${Date.now()}`;
        const isFirst = get().cards.length === 0;
        const newCard: SavedCard = {
          ...card,
          id: newId,
          isDefault: isFirst || card.isDefault,
        };
        set((s) => ({
          cards: [...s.cards, newCard],
        }));
        return newCard;
      },

      removeCard: (id) =>
        set((s) => ({
          cards: s.cards.filter((c) => c.id !== id),
        })),

      getCards: () => get().cards,
    }),
    { name: "onbsaglik-saved-cards" }
  )
);
