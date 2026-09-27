/**
 * Shared, serialisable shapes used by both Server and Client Components.
 * (Client components never import the Prisma client.)
 */

export const CATEGORIES = ["MEN", "WOMEN", "UNISEX", "NICHE"] as const;
export type CategoryKey = (typeof CATEGORIES)[number];

export const SIZES = [50, 100] as const;
export type Size = (typeof SIZES)[number];

export const PAYMENT_METHODS = ["COD", "INSTAPAY", "VODAFONE_CASH"] as const;
export type PaymentMethodKey = (typeof PAYMENT_METHODS)[number];

export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
export type OrderStatusKey = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["PENDING", "AWAITING_VERIFICATION", "PAID", "FAILED", "REFUNDED"] as const;
export type PaymentStatusKey = (typeof PAYMENT_STATUSES)[number];

export type CatalogProduct = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  notesAr: string[];
  notesEn: string[];
  category: CategoryKey;
  color: string;
  shape: number;
  price50: number;
  price100: number;
  salePercent: number;
  stock50: number;
  stock100: number;
  imageUrl: string | null;
};

export type StoreSettings = {
  shippingFee: number;
  freeShippingFrom: number;
  whatsappNumber: string;
  phoneDisplay: string;
  instapayHandle: string;
  vodafoneCashNumber: string;
  featuredCoupon: string | null;
  featuredCouponPercent: number | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
};

export function basePrice(p: Pick<CatalogProduct, "price50" | "price100">, size: Size) {
  return size === 100 ? p.price100 : p.price50;
}

export function unitPrice(p: Pick<CatalogProduct, "price50" | "price100" | "salePercent">, size: Size) {
  return Math.round(basePrice(p, size) * (1 - (p.salePercent || 0) / 100));
}

export function stockFor(p: Pick<CatalogProduct, "stock50" | "stock100">, size: Size) {
  return size === 100 ? p.stock100 : p.stock50;
}

export type Totals = { subtotal: number; discount: number; shipping: number; total: number };

export function computeTotals(
  lines: { unit: number; qty: number }[],
  couponPercent: number,
  settings: Pick<StoreSettings, "shippingFee" | "freeShippingFrom">,
): Totals {
  const subtotal = lines.reduce((s, l) => s + l.unit * l.qty, 0);
  const discount = Math.round((subtotal * couponPercent) / 100);
  const after = subtotal - discount;
  const shipping = lines.length && after < settings.freeShippingFrom ? settings.shippingFee : 0;
  return { subtotal, discount, shipping, total: after + shipping };
}
