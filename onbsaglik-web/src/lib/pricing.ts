import { CartItem } from "@/types";

export const PRICING_RULES = {
  FREE_SHIPPING_THRESHOLD: 3000,
  SHIPPING_COST: 49.90, 
  MULTI_BUY_MIN_ITEMS: 3,
  MULTI_BUY_DISCOUNT_RATE: 0.05,
  EFT_DISCOUNT_RATE: 0.02,
  FIRST_ORDER_COUPON_CODE: "ILK100",
  FIRST_ORDER_MIN_AMOUNT: 500,
  FIRST_ORDER_DISCOUNT_AMOUNT: 100,
  COMPANY_IBAN: "TR31 0001 5001 5800 7319 5604 08",
  COMPANY_NAME: "Onb İnşaat Sanayi Ticaret Ltd. Şti.",
  REVIEW_REWARD_AMOUNT: 5,
};

export function calculateMultiBuyDiscount(items: CartItem[], totalAmount: number): number {
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  if (totalItemsCount >= PRICING_RULES.MULTI_BUY_MIN_ITEMS) {
    return totalAmount * PRICING_RULES.MULTI_BUY_DISCOUNT_RATE;
  }
  return 0;
}

export function calculateEftDiscount(amount: number): number {
  return amount * PRICING_RULES.EFT_DISCOUNT_RATE;
}

export function calculateShipping(amount: number): number {
  if (amount > PRICING_RULES.FREE_SHIPPING_THRESHOLD) {
    return 0;
  }
  return PRICING_RULES.SHIPPING_COST;
}

export function applyCouponDiscount(code: string, amount: number, isFirstOrder: boolean): number {
  if (code.toUpperCase() === PRICING_RULES.FIRST_ORDER_COUPON_CODE) {
    if (!isFirstOrder) {
      throw new Error("Bu kupon sadece ilk alışverişte geçerlidir.");
    }
    if (amount < PRICING_RULES.FIRST_ORDER_MIN_AMOUNT) {
      throw new Error(`Bu kupon minimum ${PRICING_RULES.FIRST_ORDER_MIN_AMOUNT} TL alışverişlerde geçerlidir.`);
    }
    return PRICING_RULES.FIRST_ORDER_DISCOUNT_AMOUNT;
  }
  // Diğer kuponlar eklenebilir
  return 0;
}
