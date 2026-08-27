/**
 * Zustand ile Kayıtlı Kartlar Yönetimi — cardStore.ts
 * Kullanıcı kimliğine (userEmail) göre kişiye özel saklanır.
 * Güvenlik (PCI-DSS): CVV asla saklanmaz, kart numarası maskelenir.
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SavedCard {
  id: string;
  userEmail?: string;
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
  getUserCards: (userEmail?: string) => SavedCard[];
}

export const useCardStore = create<CardStore>()(
  persist(
    (set, get) => ({
      cards: [],

      addCard: (card) => {
        const newId = `card-${Date.now()}`;
        const userList = card.userEmail
          ? get().cards.filter((c) => c.userEmail === card.userEmail)
          : get().cards;
        const isFirst = userList.length === 0;
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

      getUserCards: (userEmail?: string) => {
        if (!userEmail) return get().cards;
        return get().cards.filter(
          (c) => !c.userEmail || c.userEmail.toLowerCase() === userEmail.toLowerCase()
        );
      },
    }),
    { name: "onbsaglik-saved-cards" }
  )
);
