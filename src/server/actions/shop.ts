"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { computeTotals, stockFor, unitPrice, type Size } from "@/lib/catalog";
import { checkoutSchema, couponCheckSchema, paymentProofSchema, type CheckoutInput } from "@/lib/validation";
import { toInternationalPhone, waLink } from "@/lib/utils";
import { getSettings } from "@/server/queries";
import { uploadImage, validateImage } from "@/server/storage";
import { sendTemplate, sendText } from "@/server/whatsapp";
import { buildOrderMessage } from "@/server/order-messages";

/* ------------------------------------------------------------------ */
/* Coupons                                                             */
/* ------------------------------------------------------------------ */

type CouponResult = { ok: true; code: string; percent: number } | { ok: false; error: "invalid" | "min" };

async function resolveCoupon(code: string, subtotal: number): Promise<CouponResult> {
  const c = await prisma.coupon.findUnique({ where: { code } });
  if (!c || !c.isActive) return { ok: false, error: "invalid" };
  if (c.expiresAt && c.expiresAt < new Date()) return { ok: false, error: "invalid" };
  if (c.maxUses !== null && c.usedCount >= c.maxUses) return { ok: false, error: "invalid" };
  if (subtotal < c.minSubtotal) return { ok: false, error: "min" };
  return { ok: true, code: c.code, percent: c.percent };
}

export async function checkCoupon(code: string, subtotal: number): Promise<CouponResult> {
  const parsed = couponCheckSchema.safeParse({ code, subtotal });
  if (!parsed.success) return { ok: false, error: "invalid" };
  return resolveCoupon(parsed.data.code, parsed.data.subtotal);
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

const REF_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
function newRef() {
  let s = "";
  for (let i = 0; i < 7; i++) s += REF_ALPHABET[randomInt(REF_ALPHABET.length)];
  return `PC-${s}`;
}

export type PlaceOrderResult =
  | { ok: true; ref: string; waUrl: string }
  | {
      ok: false;
      error: "validation" | "empty" | "unavailable" | "stock" | "coupon" | "server";
      fields?: string[];
    };

class StockError extends Error {}

export async function placeOrder(input: CheckoutInput): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((i) => String(i.path[0])))];
    return { ok: false, error: fields.includes("items") ? "empty" : "validation", fields };
  }
  const data = parsed.data;

  // merge duplicate lines
  const merged = new Map<string, { productId: string; size: Size; qty: number }>();
  for (const it of data.items) {
    const key = `${it.productId}:${it.size}`;
    const prev = merged.get(key);
    merged.set(key, { productId: it.productId, size: it.size, qty: (prev?.qty ?? 0) + it.qty });
  }
  const lines = [...merged.values()];

  const products = await prisma.product.findMany({
    where: { id: { in: lines.map((l) => l.productId) }, isActive: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));
  if (lines.some((l) => !byId.has(l.productId))) return { ok: false, error: "unavailable" };
  if (lines.some((l) => stockFor(byId.get(l.productId)!, l.size) < l.qty)) return { ok: false, error: "stock" };

  const items = lines.map((l) => {
    const p = byId.get(l.productId)!;
    const unit = unitPrice(p, l.size);
    return {
      productId: p.id,
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      size: l.size,
      unitPrice: unit,
      quantity: l.qty,
      lineTotal: unit * l.qty,
    };
  });

  const settings = await getSettings();
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);

  let couponPercent = 0;
  let couponCode: string | null = null;
  if (data.coupon) {
    const c = await resolveCoupon(data.coupon, subtotal);
    if (!c.ok) return { ok: false, error: "coupon" };
    couponPercent = c.percent;
    couponCode = c.code;
  }

  const totals = computeTotals(
    items.map((i) => ({ unit: i.unitPrice, qty: i.quantity })),
    couponPercent,
    settings,
  );

  for (let attempt = 0; attempt < 3; attempt++) {
    const ref = newRef();
    try {
      const order = await prisma.$transaction(async (tx) => {
        for (const l of lines) {
          const res =
            l.size === 100
              ? await tx.product.updateMany({
                  where: { id: l.productId, stock100: { gte: l.qty } },
                  data: { stock100: { decrement: l.qty } },
                })
              : await tx.product.updateMany({
                  where: { id: l.productId, stock50: { gte: l.qty } },
                  data: { stock50: { decrement: l.qty } },
                });
          if (res.count !== 1) throw new StockError();
        }
        if (couponCode) {
          await tx.coupon.update({ where: { code: couponCode }, data: { usedCount: { increment: 1 } } });
        }
        return tx.order.create({
          data: {
            ref,
            customerName: data.name,
            phone: data.phone,
            address: data.address,
            locale: data.locale,
            paymentMethod: data.payment,
            subtotal: totals.subtotal,
            discount: totals.discount,
            shipping: totals.shipping,
            total: totals.total,
            couponCode,
            suggestion: data.suggestion || null,
            items: { create: items },
          },
          include: { items: true },
        });
      });

      const message = buildOrderMessage(order);

      // Notifications run after the response is sent
      after(async () => {
        const adminNumber = process.env.WHATSAPP_ADMIN_NUMBER || settings.whatsappNumber;
        await sendText(adminNumber, message, "admin_new_order", order.id);
        const template = process.env.WHATSAPP_ORDER_TEMPLATE;
        if (template) {
          await sendTemplate(
            toInternationalPhone(order.phone),
            template,
            [order.customerName, order.ref, String(order.total)],
            "customer_order_confirmation",
            order.id,
          );
        }
      });

      return { ok: true, ref: order.ref, waUrl: waLink(settings.whatsappNumber, message) };
    } catch (e) {
      if (e instanceof StockError) return { ok: false, error: "stock" };
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue; // ref collision
      console.error("placeOrder failed", e);
      return { ok: false, error: "server" };
    }
  }
  return { ok: false, error: "server" };
}

/* ------------------------------------------------------------------ */
/* Payment proof (InstaPay / Vodafone Cash)                            */
/* ------------------------------------------------------------------ */

export type ProofState = { status: "idle" | "ok" | "error"; error?: string };

export async function submitPaymentProof(_prev: ProofState, formData: FormData): Promise<ProofState> {
  const parsed = paymentProofSchema.safeParse({
    ref: formData.get("ref"),
    reference: formData.get("reference") ?? "",
  });
  if (!parsed.success) return { status: "error", error: "validation" };

  const file = formData.get("proof");
  const fileError = validateImage(file);
  if (fileError) return { status: "error", error: fileError };

  const order = await prisma.order.findUnique({ where: { ref: parsed.data.ref } });
  if (!order || order.paymentMethod === "COD") return { status: "error", error: "notfound" };
  if (order.paymentStatus === "PAID" || order.status === "CANCELLED") return { status: "error", error: "closed" };

  try {
    const url = await uploadImage(file as File, "payments");
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentProofUrl: url,
        paymentReference: parsed.data.reference || null,
        paymentStatus: "AWAITING_VERIFICATION",
      },
    });
    revalidatePath("/[locale]", "layout");
    after(async () => {
      const settings = await getSettings();
      await sendText(
        process.env.WHATSAPP_ADMIN_NUMBER || settings.whatsappNumber,
        `تم رفع إثبات دفع للطلب ${order.ref} (${order.paymentMethod}). راجع لوحة التحكم للتأكيد.`,
        "admin_payment_proof",
        order.id,
      );
    });
    return { status: "ok" };
  } catch (e) {
    console.error("submitPaymentProof failed", e);
    return { status: "error", error: "upload" };
  }
}
