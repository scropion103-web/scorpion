"use client";

import { Minus, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatMoney } from "@/lib/utils";
import { Bottle } from "./bottle";
import { useCart } from "./cart-context";

export function CartLines() {
  const t = useTranslations("checkout");
  const tp = useTranslations("products");
  const tcart = useTranslations("cart");
  const locale = useLocale();
  const { lines, changeQty, remove } = useCart();

  if (!lines.length) return <p className="px-2 py-6 text-center text-ink-soft">{tcart("empty")}</p>;

  return (
    <ul>
      {lines.map((l) => {
        const name = locale === "ar" ? l.product.nameAr : l.product.nameEn;
        return (
          <li
            key={`${l.productId}-${l.size}`}
            data-testid="cart-line"
            className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-2.5 border-b border-line py-3 first:pt-0 sm:grid-cols-[56px_1fr_auto] sm:gap-3"
          >
            <div
              className="grid h-14 w-12 place-items-center rounded-xl sm:h-16 sm:w-14"
              style={{ background: `color-mix(in srgb, ${l.product.color} 14%, var(--color-bg))` }}
            >
              <Bottle color={l.product.color} shape={l.product.shape} className="h-auto w-6" />
            </div>
            <div className="min-w-0">
              <strong className="block text-[.95rem] leading-snug">{name}</strong>
              <small className="block text-ink-soft">
                {l.size} {tp("ml")} · {formatMoney(l.unit, locale)}
              </small>
              <div className="mt-1 inline-flex items-center rounded-full border border-line bg-bg">
                <button
                  type="button"
                  aria-label={t("qtyDec")}
                  onClick={() => changeQty(l.productId, l.size, -1)}
                  className="grid size-[30px] place-items-center rounded-full hover:bg-gold/25"
                >
                  <Minus className="size-3.5" aria-hidden />
                </button>
                <span className="min-w-[26px] text-center text-[.92rem] font-bold" aria-live="polite">
                  {l.qty}
                </span>
                <button
                  type="button"
                  aria-label={t("qtyInc")}
                  onClick={() => changeQty(l.productId, l.size, 1)}
                  className="grid size-[30px] place-items-center rounded-full hover:bg-gold/25"
                >
                  <Plus className="size-3.5" aria-hidden />
                </button>
              </div>
            </div>
            <div className="text-end text-[.95rem] font-extrabold">
              {formatMoney(l.lineTotal, locale)}
              <button
                type="button"
                onClick={() => remove(l.productId, l.size)}
                className="ms-auto mt-1.5 block text-[.8rem] font-normal text-ink-soft underline hover:text-danger"
              >
                {t("remove")}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function CartTotals({ className }: { className?: string }) {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const { lines, totals, coupon } = useCart();
  if (!lines.length) return null;
  const m = (n: number) => formatMoney(n, locale);
  return (
    <dl className={className ?? "grid gap-2 pt-4"} data-testid="cart-totals">
      <div className="flex justify-between gap-4 text-[.95rem]">
        <dt>{t("subtotal")}</dt>
        <dd>{m(totals.subtotal)}</dd>
      </div>
      {totals.discount > 0 && (
        <div className="flex justify-between gap-4 text-[.95rem] font-bold text-gold-text">
          <dt>
            {t("discount")} ({coupon?.code})
          </dt>
          <dd>− {m(totals.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between gap-4 text-[.95rem]">
        <dt>{t("shipping")}</dt>
        <dd>{totals.shipping ? m(totals.shipping) : t("free")}</dd>
      </div>
      <div className="mt-1 flex justify-between gap-4 border-t border-line pt-3 text-xl font-extrabold">
        <dt>{t("total")}</dt>
        <dd data-testid="grand-total">{m(totals.total)}</dd>
      </div>
    </dl>
  );
}
