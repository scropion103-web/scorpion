"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { basePrice, stockFor, unitPrice, SIZES, type CatalogProduct, type Size } from "@/lib/catalog";
import { cn, formatMoney, formatPercent } from "@/lib/utils";
import { Bottle } from "./bottle";
import { useCart } from "./cart-context";
import { useToast } from "./toast";

export function ProductCard({ product: p, index = 0 }: { product: CatalogProduct; index?: number }) {
  const t = useTranslations("products");
  const tc = useTranslations("categories");
  const locale = useLocale();
  const { sizes, setSize, add } = useCart();
  const { toast } = useToast();
  const groupId = useId();

  const size: Size = sizes[p.id] ?? 50;
  const name = locale === "ar" ? p.nameAr : p.nameEn;
  const notes = locale === "ar" ? p.notesAr : p.notesEn;
  const inStock = stockFor(p, size) > 0;

  const goToCheckout = () => document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth" });

  return (
    <article
      data-testid="product-card"
      className="group flex animate-rise flex-col overflow-hidden rounded-[14px] border border-line bg-card transition-[transform,box-shadow] duration-300 sm:rounded-card [@media(hover:hover)]:hover:-translate-y-1.5 [@media(hover:hover)]:hover:shadow-card"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <div
        className="relative grid aspect-[1/1.02] place-items-center sm:aspect-[4/3.4]"
        style={{
          background: `radial-gradient(circle at 50% 42%, color-mix(in srgb, ${p.color} 16%, var(--color-bg)) 0%, var(--color-bg) 72%)`,
        }}
      >
        {p.imageUrl ? (
          <Image
            src={p.imageUrl}
            alt={name}
            width={320}
            height={320}
            unoptimized
            className="h-auto w-[70%] object-contain drop-shadow-[0_16px_14px_rgba(27,26,23,.28)] transition-transform duration-500 [@media(hover:hover)]:group-hover:scale-[1.07] [@media(hover:hover)]:group-hover:-rotate-2"
          />
        ) : (
          <Bottle
            color={p.color}
            shape={p.shape}
            className="h-auto w-[42%] drop-shadow-[0_16px_14px_rgba(27,26,23,.28)] transition-transform duration-500 sm:w-[44%] [@media(hover:hover)]:group-hover:scale-[1.07] [@media(hover:hover)]:group-hover:-rotate-2"
          />
        )}
        <span className="absolute start-2 top-2 rounded-full bg-ink/8 px-2 text-[.7rem] leading-[1.7] font-bold sm:start-3.5 sm:top-3.5 sm:px-3 sm:text-[.8rem]">
          {tc(p.category)}
        </span>
        {p.salePercent > 0 && (
          <span className="absolute end-2 bottom-2 rounded-full bg-gold px-2 text-[.7rem] leading-[1.7] font-extrabold text-ink sm:end-3.5 sm:top-3.5 sm:bottom-auto sm:px-3 sm:text-[.8rem]">
            {t("sale", { pct: formatPercent(p.salePercent) })}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 px-3 pt-3 pb-3.5 sm:gap-3 sm:px-5 sm:pt-4 sm:pb-5">
        <h3 className="font-display text-[1.05rem] leading-snug font-semibold sm:text-[1.3rem]">{name}</h3>
        <p className="-mt-1 text-[.76rem] leading-relaxed text-ink-soft sm:text-[.9rem]">{notes.join(" · ")}</p>

        <div
          role="radiogroup"
          aria-label={t("size")}
          className="grid grid-cols-2 gap-1 rounded-full border border-line bg-bg p-1"
        >
          {SIZES.map((s) => (
            <label key={s} className="relative cursor-pointer">
              <input
                type="radio"
                name={`size-${groupId}`}
                value={s}
                checked={size === s}
                onChange={() => setSize(p.id, s)}
                className="peer pointer-events-none absolute inset-0 m-0 opacity-0"
              />
              <span className="block rounded-full px-1 py-1.5 text-center text-[.76rem] font-bold transition-colors peer-checked:bg-ink peer-checked:text-bg peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold sm:text-[.9rem]">
                {s} {t("ml")}
              </span>
            </label>
          ))}
        </div>

        <div className="mt-auto flex flex-wrap items-baseline gap-x-2.5 pt-1">
          <span className="text-[1.05rem] font-extrabold sm:text-[1.35rem]">{formatMoney(unitPrice(p, size), locale)}</span>
          {p.salePercent > 0 && (
            <span className="text-[.78rem] text-ink-soft line-through sm:text-[.92rem]">
              {formatMoney(basePrice(p, size), locale)}
            </span>
          )}
        </div>

        <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!inStock}
            className={cn("px-1.5 text-[.86rem]")}
            onClick={() => {
              add(p.id, size);
              toast(t("added"));
            }}
          >
            {inStock ? t("add") : t("outOfStock")}
          </Button>
          <Button
            size="sm"
            disabled={!inStock}
            className="px-1.5 text-[.86rem]"
            onClick={() => {
              add(p.id, size);
              goToCheckout();
            }}
          >
            {t("order")}
          </Button>
        </div>
      </div>
    </article>
  );
}
