/**
 * Zustand ile müşteri yorumları yönetimi.
 * LocalStorage'a kalıcı kaydedilir (persist).
 */
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Review {
  id: string;
  productId?: number;
  productSlug: string;
  authorName: string;
  email?: string;
  rating: number; // 1 - 5
  comment: string;
  createdAt: string; // ISO date string
}

interface ReviewState {
  reviews: Review[];
  addReview: (review: Omit<Review, "id" | "createdAt">) => void;
  getProductReviews: (slug: string) => Review[];
  getAverageRating: (slug: string) => { average: number; count: number };
}

// Varsayılan ilk örnek yorumlar (Mağaza açılışı için gerçekçi kullanıcı deneyimi)
const initialReviews: Review[] = [
  {
    id: "rev-sample-1",
    productSlug: "solgar-ester-c-plus-1000-mg-90-tablet",
    authorName: "Ahmet Yılmaz",
    rating: 5,
    comment: "Düzenli kullandığım bir ürün, orijinal ve son kullanma tarihi oldukça ileri. Paketleme çok özenliydi, hızlı teslimat için teşekkürler.",
    createdAt: "2024-03-15T10:30:00.000Z",
  },
  {
    id: "rev-sample-2",
    productSlug: "solgar-ester-c-plus-1000-mg-90-tablet",
    authorName: "Selin Kaya",
    rating: 5,
    comment: "Mideyi kesinlikle rahatsız etmeyen C vitamini. Kış aylarında bağışıklık için birebir.",
    createdAt: "2024-03-18T14:20:00.000Z",
  },
  {
    id: "rev-sample-3",
    productSlug: "supradyn-all-day-30-tablet",
    authorName: "Mehmet Demir",
    rating: 4,
    comment: "Güne enerjik başlamak için harika bir multivitamin. Fiyatı eczanelere göre çok daha uygun.",
    createdAt: "2024-03-20T09:15:00.000Z",
  },
  {
    id: "rev-sample-4",
    productSlug: "bioderma-sensibio-h2o-500-ml",
    authorName: "Ayşe Çelik",
    rating: 5,
    comment: "Hassas ciltler için en iyi temizleme suyu. Asla yakma ve kızarıklık yapmıyor. Hızlı kargo.",
    createdAt: "2024-03-22T16:45:00.000Z",
  },
];

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      reviews: initialReviews,

      addReview: (reviewData) => {
        const newReview: Review = {
          ...reviewData,
          id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          reviews: [newReview, ...state.reviews],
        }));
      },

      getProductReviews: (slug: string) => {
        return get().reviews.filter((r) => r.productSlug === slug);
      },

      getAverageRating: (slug: string) => {
        const productReviews = get().reviews.filter((r) => r.productSlug === slug);
        if (productReviews.length === 0) {
          return { average: 0, count: 0 };
        }
        const total = productReviews.reduce((sum, r) => sum + r.rating, 0);
        const average = Number((total / productReviews.length).toFixed(1));
        return { average, count: productReviews.length };
      },
    }),
    {
      name: "onbsaglik-reviews",
    }
  )
);
