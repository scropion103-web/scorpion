"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { couponSchema, loginSchema, orderUpdateSchema, productSchema, settingsSchema } from "@/lib/validation";
import { toInternationalPhone } from "@/lib/utils";
import { requireAdmin, requireStaff } from "@/server/guard";
import { uploadImage, validateImage } from "@/server/storage";
import { sendText } from "@/server/whatsapp";
import { buildStatusMessage } from "@/server/order-messages";

export type FormState = { status: "idle" | "ok" | "error"; error?: string; fields?: string[] };

const fieldsOf = (e: z.ZodError) => [...new Set(e.issues.map((i) => String(i.path[0])))];
const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "");
const localeOf = (fd: FormData) => (fd.get("locale") === "en" ? "en" : "ar");

function revalidateShop() {
  revalidatePath("/[locale]", "layout");
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const locale = localeOf(fd);
  const parsed = loginSchema.safeParse({ email: fd.get("email"), password: fd.get("password") });
  if (!parsed.success) return { status: "error", error: "invalid" };
  try {
    await signIn("credentials", { ...parsed.data, redirect: false });
  } catch (e) {
    if (e instanceof AuthError) return { status: "error", error: "invalid" };
    throw e;
  }
  redirect(`/${locale}/admin`);
}

export async function logoutAction(fd: FormData) {
  await signOut({ redirect: false });
  redirect(`/${localeOf(fd)}/admin/login`);
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

function productInput(fd: FormData) {
  return productSchema.safeParse({
    slug: str(fd, "slug"),
    nameAr: str(fd, "nameAr"),
    nameEn: str(fd, "nameEn"),
    notesAr: str(fd, "notesAr"),
    notesEn: str(fd, "notesEn"),
    descriptionAr: str(fd, "descriptionAr"),
    descriptionEn: str(fd, "descriptionEn"),
    category: str(fd, "category"),
    color: str(fd, "color"),
    shape: str(fd, "shape"),
    price50: str(fd, "price50"),
    price100: str(fd, "price100"),
    salePercent: str(fd, "salePercent") || "0",
    stock50: str(fd, "stock50") || "0",
    stock100: str(fd, "stock100") || "0",
    sortOrder: str(fd, "sortOrder") || "0",
    isActive: bool(fd, "isActive"),
    isFeatured: bool(fd, "isFeatured"),
  });
}

async function maybeUpload(fd: FormData): Promise<{ url?: string; error?: string }> {
  const file = fd.get("image");
  if (!(file instanceof File) || file.size === 0) return {};
  const err = validateImage(file);
  if (err) return { error: err };
  try {
    return { url: await uploadImage(file, "products") };
  } catch {
    return { error: "upload" };
  }
}

export async function saveProduct(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireStaff();
  const id = str(fd, "id");
  const parsed = productInput(fd);
  if (!parsed.success) return { status: "error", error: "validation", fields: fieldsOf(parsed.error) };

  const up = await maybeUpload(fd);
  if (up.error) return { status: "error", error: up.error, fields: ["image"] };

  const data = {
    ...parsed.data,
    descriptionAr: parsed.data.descriptionAr || null,
    descriptionEn: parsed.data.descriptionEn || null,
    ...(up.url ? { imageUrl: up.url } : {}),
    ...(bool(fd, "removeImage") && !up.url ? { imageUrl: null } : {}),
  };

  try {
    if (id) await prisma.product.update({ where: { id }, data });
    else await prisma.product.create({ data });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { status: "error", error: "duplicate", fields: ["slug"] };
    }
    throw e;
  }
  revalidateShop();
  redirect(`/${localeOf(fd)}/admin/products`);
}

export async function toggleProduct(fd: FormData) {
  await requireStaff();
  const id = str(fd, "id");
  const p = await prisma.product.findUnique({ where: { id }, select: { isActive: true } });
  if (!p) return;
  await prisma.product.update({ where: { id }, data: { isActive: !p.isActive } });
  revalidateShop();
}

export async function deleteProduct(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  // Order history keeps the product name; the relation is set to NULL
  await prisma.product.delete({ where: { id } });
  revalidateShop();
}

/* ------------------------------------------------------------------ */
/* Coupons                                                             */
/* ------------------------------------------------------------------ */

export async function saveCoupon(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireStaff();
  const id = str(fd, "id");
  const parsed = couponSchema.safeParse({
    code: str(fd, "code"),
    percent: str(fd, "percent"),
    minSubtotal: str(fd, "minSubtotal") || "0",
    maxUses: str(fd, "maxUses"),
    expiresAt: str(fd, "expiresAt"),
    isActive: bool(fd, "isActive"),
  });
  if (!parsed.success) return { status: "error", error: "validation", fields: fieldsOf(parsed.error) };
  try {
    if (id) await prisma.coupon.update({ where: { id }, data: parsed.data });
    else await prisma.coupon.create({ data: parsed.data });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { status: "error", error: "duplicate", fields: ["code"] };
    }
    throw e;
  }
  revalidateShop();
  return { status: "ok" };
}

export async function deleteCoupon(fd: FormData) {
  await requireAdmin();
  await prisma.coupon.delete({ where: { id: str(fd, "id") } });
  revalidateShop();
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export async function updateOrder(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireStaff();
  const parsed = orderUpdateSchema.safeParse({
    id: str(fd, "id"),
    status: str(fd, "status"),
    paymentStatus: str(fd, "paymentStatus"),
    adminNotes: str(fd, "adminNotes"),
    notifyCustomer: bool(fd, "notifyCustomer"),
  });
  if (!parsed.success) return { status: "error", error: "validation" };
  const { id, notifyCustomer, ...data } = parsed.data;

  const before = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!before) return { status: "error", error: "notfound" };

  await prisma.$transaction(async (tx) => {
    // Restock when an order gets cancelled
    if (data.status === "CANCELLED" && before.status !== "CANCELLED") {
      for (const it of before.items) {
        if (!it.productId) continue;
        await tx.product.update({
          where: { id: it.productId },
          data: it.size === 100 ? { stock100: { increment: it.quantity } } : { stock50: { increment: it.quantity } },
        });
      }
    }
    await tx.order.update({ where: { id }, data: { ...data, adminNotes: data.adminNotes || null } });
  });

  if (notifyCustomer && data.status !== before.status) {
    await sendText(
      toInternationalPhone(before.phone),
      buildStatusMessage(before.ref, data.status, before.locale),
      "customer_status_update",
      before.id,
    );
  }

  revalidateShop();
  return { status: "ok" };
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export async function saveSettings(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse({
    shippingFee: str(fd, "shippingFee"),
    freeShippingFrom: str(fd, "freeShippingFrom"),
    whatsappNumber: str(fd, "whatsappNumber"),
    phoneDisplay: str(fd, "phoneDisplay"),
    instapayHandle: str(fd, "instapayHandle"),
    vodafoneCashNumber: str(fd, "vodafoneCashNumber"),
    featuredCoupon: str(fd, "featuredCoupon"),
    instagramUrl: str(fd, "instagramUrl"),
    facebookUrl: str(fd, "facebookUrl"),
    tiktokUrl: str(fd, "tiktokUrl"),
  });
  if (!parsed.success) return { status: "error", error: "validation", fields: fieldsOf(parsed.error) };
  await prisma.setting.upsert({ where: { id: 1 }, update: parsed.data, create: { id: 1, ...parsed.data } });
  revalidateShop();
  return { status: "ok" };
}

/* ------------------------------------------------------------------ */
/* Team                                                                */
/* ------------------------------------------------------------------ */

const userSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(8).max(200),
  role: z.enum(["ADMIN", "STAFF"]),
});

export async function createUser(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = userSchema.safeParse({
    name: str(fd, "name"),
    email: str(fd, "email"),
    password: str(fd, "password"),
    role: str(fd, "role"),
  });
  if (!parsed.success) return { status: "error", error: "validation", fields: fieldsOf(parsed.error) };
  const { password, ...rest } = parsed.data;
  try {
    await prisma.user.create({ data: { ...rest, passwordHash: await bcrypt.hash(password, 12) } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { status: "error", error: "duplicate", fields: ["email"] };
    }
    throw e;
  }
  revalidateShop();
  return { status: "ok" };
}

export async function deleteUser(fd: FormData) {
  const me = await requireAdmin();
  const id = str(fd, "id");
  if (id === me.id) return;
  await prisma.user.delete({ where: { id } });
  revalidateShop();
}
