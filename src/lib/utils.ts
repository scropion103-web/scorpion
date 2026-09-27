import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Locale = "ar" | "en";

/** Formats an EGP amount, e.g. "1,400 ج.م" / "1,400 EGP" */
export function formatMoney(amount: number, locale: Locale | string) {
  const n = Math.round(amount).toLocaleString("en-US");
  return locale === "ar" ? `${n} ج.م` : `${n} EGP`;
}

/** Keeps "15%" readable inside RTL text */
export function formatPercent(pct: number) {
  return `⁦${Math.round(pct)}%⁩`;
}

/** Normalises Arabic-Indic digits to Latin digits */
export function toLatinDigits(value: string) {
  return value.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** Egyptian phone → international format without "+" (01xxxxxxxxx → 201xxxxxxxxx) */
export function toInternationalPhone(phone: string) {
  const digits = toLatinDigits(phone).replace(/\D/g, "");
  if (digits.startsWith("20")) return digits;
  if (digits.startsWith("0")) return `2${digits}`;
  return digits;
}

export function waLink(number: string, text?: string) {
  const base = `https://wa.me/${number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
