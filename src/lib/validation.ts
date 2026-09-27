import { z } from "zod";
import { CATEGORIES, ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from "./catalog";
import { toLatinDigits } from "./utils";

const phone = z
  .string()
  .trim()
  .transform(toLatinDigits)
  .pipe(z.string().regex(/^[0-9+\s-]{8,16}$/, "phone"));

export const checkoutSchema = z.object({
  name: z.string().trim().min(3, "name").max(80),
  phone,
  address: z.string().trim().min(8, "address").max(400),
  payment: z.enum(PAYMENT_METHODS),
  suggestion: z.string().trim().max(1000).optional().default(""),
  coupon: z.string().trim().toUpperCase().max(40).optional().default(""),
  locale: z.enum(["ar", "en"]).default("ar"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        size: z.union([z.literal(50), z.literal(100)]),
        qty: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "empty")
    .max(40),
});
export type CheckoutInput = z.input<typeof checkoutSchema>;

export const couponCheckSchema = z.object({
  code: z.string().trim().toUpperCase().min(2).max(40),
  subtotal: z.number().int().min(0),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(6).max(200),
});

const optionalUrl = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .pipe(z.url().nullable());

const notes = z
  .string()
  .trim()
  .transform((v) =>
    v
      .split(/[,،\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8),
  );

export const productSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug"),
  nameAr: z.string().trim().min(2).max(80),
  nameEn: z.string().trim().min(2).max(80),
  notesAr: notes,
  notesEn: notes,
  descriptionAr: z.string().trim().max(2000).optional().default(""),
  descriptionEn: z.string().trim().max(2000).optional().default(""),
  category: z.enum(CATEGORIES),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "color"),
  shape: z.coerce.number().int().min(0).max(3),
  price50: z.coerce.number().int().min(0).max(1_000_000),
  price100: z.coerce.number().int().min(0).max(1_000_000),
  salePercent: z.coerce.number().int().min(0).max(90),
  stock50: z.coerce.number().int().min(0).max(100_000),
  stock100: z.coerce.number().int().min(0).max(100_000),
  sortOrder: z.coerce.number().int().min(0).max(10_000).default(0),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});

export const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{3,40}$/, "code"),
  percent: z.coerce.number().int().min(1).max(90),
  minSubtotal: z.coerce.number().int().min(0).default(0),
  maxUses: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v)))
    .pipe(z.number().int().min(1).nullable()),
  expiresAt: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : new Date(v)))
    .pipe(z.date().nullable()),
  isActive: z.boolean(),
});

export const settingsSchema = z.object({
  shippingFee: z.coerce.number().int().min(0),
  freeShippingFrom: z.coerce.number().int().min(0),
  whatsappNumber: z.string().trim().regex(/^\d{8,15}$/, "whatsapp"),
  phoneDisplay: z.string().trim().min(6).max(30),
  instapayHandle: z.string().trim().min(3).max(80),
  vodafoneCashNumber: z.string().trim().transform(toLatinDigits).pipe(z.string().regex(/^0\d{10}$/, "vodafone")),
  featuredCoupon: z
    .string()
    .trim()
    .toUpperCase()
    .transform((v) => (v === "" ? null : v)),
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  tiktokUrl: optionalUrl,
});

export const orderUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(ORDER_STATUSES),
  paymentStatus: z.enum(PAYMENT_STATUSES),
  adminNotes: z.string().trim().max(2000).optional().default(""),
  notifyCustomer: z.boolean().default(false),
});

export const paymentProofSchema = z.object({
  ref: z.string().trim().min(4).max(20),
  reference: z.string().trim().max(80).optional().default(""),
});

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
