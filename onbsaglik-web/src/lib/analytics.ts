/**
 * Merkezi E-Ticaret Dönüşüm & Reklam Piksel Takip Kütüphanesi (GA4 + Google Ads + Meta Pixel)
 * Sepete ekleme (AddToCart), Ödeme Başlatma (InitiateCheckout) ve Satın Alma (Purchase)
 * olaylarını hem Google hem Meta (Instagram/Facebook) reklam algoritmalarına bildirir.
 */

export function trackAddToCart(product: {
  id: number | string;
  name: string;
  brand?: string;
  category?: string;
  price: number;
  quantity?: number;
}) {
  if (typeof window === "undefined") return;
  const qty = product.quantity || 1;
  const value = Number((product.price * qty).toFixed(2));

  // 1. Meta (Facebook / Instagram) Pixel
  try {
    const fbq = (window as any).fbq;
    if (typeof fbq === "function") {
      fbq("track", "AddToCart", {
        content_ids: [`ONB-${product.id}`],
        content_name: product.name,
        content_type: "product",
        value,
        currency: "TRY",
      });
    }
  } catch {}

  // 2. Google Analytics 4 & Google Ads (gtag)
  try {
    const gtag = (window as any).gtag;
    if (typeof gtag === "function") {
      gtag("event", "add_to_cart", {
        currency: "TRY",
        value,
        items: [
          {
            item_id: `ONB-${product.id}`,
            item_name: product.name,
            item_brand: product.brand || "OnbSağlık",
            item_category: product.category || "Sağlık",
            price: product.price,
            quantity: qty,
          },
        ],
      });
    }
  } catch {}
}

export function trackPurchase(order: {
  id: string;
  total: number;
  items?: Array<{
    id: number | string;
    name: string;
    brand?: string;
    price: number;
    quantity: number;
  }>;
}) {
  if (typeof window === "undefined" || !order?.id) return;

  // Aynı sipariş için mükerrer dönüşüm sayılmasını önle
  const storageKey = `tracked_purchase_${order.id}`;
  try {
    if (sessionStorage.getItem(storageKey)) return;
    sessionStorage.setItem(storageKey, "1");
  } catch {}

  const value = Number(order.total || 0);
  const items = order.items || [];

  // 1. Meta Pixel Purchase Event
  try {
    const fbq = (window as any).fbq;
    if (typeof fbq === "function") {
      fbq("track", "Purchase", {
        content_ids: items.map((i) => `ONB-${i.id}`),
        content_type: "product",
        value,
        currency: "TRY",
        num_items: items.reduce((acc, i) => acc + (i.quantity || 1), 0),
      });
    }
  } catch {}

  // 2. Google Analytics 4 & Google Ads Purchase Event
  try {
    const gtag = (window as any).gtag;
    if (typeof gtag === "function") {
      gtag("event", "purchase", {
        transaction_id: order.id,
        value,
        currency: "TRY",
        items: items.map((i) => ({
          item_id: `ONB-${i.id}`,
          item_name: i.name,
          item_brand: i.brand || "OnbSağlık",
          price: i.price,
          quantity: i.quantity || 1,
        })),
      });
    }
  } catch {}
}
