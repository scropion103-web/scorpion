import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { CatalogProduct, StoreSettings } from "@/lib/catalog";

export const getSettings = cache(async (): Promise<StoreSettings> => {
  const s = await prisma.setting.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  let featuredCouponPercent: number | null = null;
  if (s.featuredCoupon) {
    const c = await prisma.coupon.findUnique({ where: { code: s.featuredCoupon } });
    if (c?.isActive) featuredCouponPercent = c.percent;
  }
  return {
    shippingFee: s.shippingFee,
    freeShippingFrom: s.freeShippingFrom,
    whatsappNumber: s.whatsappNumber,
    phoneDisplay: s.phoneDisplay,
    instapayHandle: s.instapayHandle,
    vodafoneCashNumber: s.vodafoneCashNumber,
    featuredCoupon: featuredCouponPercent ? s.featuredCoupon : null,
    featuredCouponPercent,
    instagramUrl: s.instagramUrl,
    facebookUrl: s.facebookUrl,
    tiktokUrl: s.tiktokUrl,
  };
});

export const getCatalog = cache(async (): Promise<CatalogProduct[]> => {
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      slug: true,
      nameAr: true,
      nameEn: true,
      notesAr: true,
      notesEn: true,
      category: true,
      color: true,
      shape: true,
      price50: true,
      price100: true,
      salePercent: true,
      stock50: true,
      stock100: true,
      imageUrl: true,
    },
  });
  return rows;
});

export async function getPublicOrder(ref: string) {
  return prisma.order.findUnique({
    where: { ref },
    select: {
      ref: true,
      customerName: true,
      paymentMethod: true,
      paymentStatus: true,
      paymentProofUrl: true,
      status: true,
      subtotal: true,
      discount: true,
      shipping: true,
      total: true,
      couponCode: true,
      createdAt: true,
      items: { select: { id: true, nameAr: true, nameEn: true, size: true, quantity: true, lineTotal: true } },
    },
  });
}
