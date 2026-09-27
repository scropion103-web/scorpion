import "server-only";
import { formatMoney } from "@/lib/utils";

type MsgOrder = {
  ref: string;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode: string | null;
  suggestion: string | null;
  items: { nameAr: string; size: number; quantity: number; lineTotal: number }[];
};

const PAYMENT_AR: Record<string, string> = {
  COD: "الدفع عند الاستلام",
  INSTAPAY: "إنستاباي InstaPay",
  VODAFONE_CASH: "فودافون كاش",
};

export const STATUS_AR: Record<string, string> = {
  PENDING: "قيد المراجعة",
  CONFIRMED: "تم التأكيد",
  PROCESSING: "جاري التجهيز",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
};

/** The same message format as the original site, used for wa.me links and admin alerts */
export function buildOrderMessage(o: MsgOrder) {
  const m = (n: number) => formatMoney(n, "ar");
  return [
    `طلب جديد من موقع مقهى العطور — ${o.ref}`,
    "",
    `الاسم: ${o.customerName}`,
    `الهاتف: ${o.phone}`,
    `العنوان: ${o.address}`,
    `طريقة الدفع: ${PAYMENT_AR[o.paymentMethod] ?? o.paymentMethod}`,
    "",
    "الطلبات:",
    ...o.items.map((i) => `• ${i.nameAr} (${i.size} ملي) × ${i.quantity} = ${m(i.lineTotal)}`),
    "",
    `المجموع: ${m(o.subtotal)}`,
    o.discount ? `خصم (${o.couponCode}): -${m(o.discount)}` : null,
    `الشحن: ${o.shipping ? m(o.shipping) : "مجاني"}`,
    `الإجمالي: ${m(o.total)}`,
    o.suggestion ? `\nاقتراح لتحسين جودة الخدمة:\n${o.suggestion}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

export function buildStatusMessage(ref: string, status: string, locale: string) {
  if (locale === "en") {
    return `Perfume Café — order ${ref}\nStatus: ${status.toLowerCase().replace("_", " ")}.\nThank you for shopping with us.`;
  }
  return `مقهى العطور — الطلب ${ref}\nالحالة: ${STATUS_AR[status] ?? status}.\nشكراً لثقتك بنا.`;
}
