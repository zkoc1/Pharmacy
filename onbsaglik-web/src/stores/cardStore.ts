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
  syncCards: () => Promise<void>;
  addCardAsync: (card: Omit<SavedCard, "id">) => Promise<void>;
  removeCardAsync: (id: string) => Promise<void>;
}

export const useCardStore = create<CardStore>()(
  persist(
    (set, get) => ({
      cards: [],

      syncCards: async () => {
        try {
          const res = await fetch("/api/user/cards");
          if (res.ok) {
            const data = await res.json();
            const mapped = data.cards.map((c: any) => ({
              id: c.id,
              userEmail: c.user_email,
              cardName: c.card_name,
              cardNumberMasked: c.masked_number,
              cardType: c.card_brand,
              cardLast4: c.masked_number.slice(-4),
              expireMonth: "12",
              expireYear: "2030",
              isDefault: false
            }));
            set({ cards: mapped });
          }
        } catch (e) {
          console.error(e);
        }
      },

      addCardAsync: async (card) => {
        try {
          const res = await fetch("/api/user/cards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              card_name: card.cardName,
              masked_number: card.cardNumberMasked,
              card_brand: card.cardType
            })
          });
          if (res.ok) await get().syncCards();
        } catch (e) {}
      },

      removeCardAsync: async (id) => {
        try {
          const res = await fetch(`/api/user/cards?id=${id}`, { method: "DELETE" });
          if (res.ok) await get().syncCards();
        } catch (e) {}
      },

      addCard: (card) => {
        get().addCardAsync(card);
        const newId = `card-${Date.now()}`;
        const newCard: SavedCard = { ...card, id: newId };
        set((s) => ({ cards: [...s.cards, newCard] }));
        return newCard;
      },

      removeCard: (id) => {
        get().removeCardAsync(id);
        set((s) => ({ cards: s.cards.filter((c) => c.id !== id) }));
      },

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
