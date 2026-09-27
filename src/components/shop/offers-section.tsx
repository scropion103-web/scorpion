"use client";

import { Gift, Percent, Truck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { formatMoney, formatPercent } from "@/lib/utils";
import { useCart } from "./cart-context";
import { ProductCard } from "./product-card";
import { Reveal } from "./reveal";
import { SectionHead } from "./section-head";
import { useToast } from "./toast";
import { useApplyCoupon } from "./use-apply-coupon";

export function OffersSection() {
  const t = useTranslations("offers");
  const locale = useLocale();
  const { products, settings } = useCart();
  const { toast } = useToast();
  const { apply, pending } = useApplyCoupon();

  const onSale = products.filter((p) => p.salePercent > 0);
  const code = settings.featuredCoupon;
  const pct = settings.featuredCouponPercent;

  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // clipboard may be blocked; the code is visible anyway
    }
    toast(t("copied"));
  };

  const cards = [
    { icon: Truck, title: t("c1t"), text: t("c1d", { amount: formatMoney(settings.freeShippingFrom, locale) }) },
    { icon: Gift, title: t("c2t"), text: t("c2d") },
    { icon: Percent, title: t("c3t"), text: t("c3d") },
  ];

  return (
    <section
      id="offers"
      aria-labelledby="offers-title"
      className="relative overflow-hidden bg-ink py-12 text-bg sm:py-[clamp(3.5rem,8vw,6.5rem)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -start-[200px] -top-40 size-[520px] rounded-full bg-[radial-gradient(circle,rgba(184,137,63,.22),transparent_68%)]"
      />
      <div className="container-x relative">
        <SectionHead id="offers-title" dark eyebrow={t("eyebrow")} title={t("title")} sub={t("sub")} />

        {code && pct ? (
          <Reveal className="grid items-center gap-8 rounded-[20px] border border-gold/55 bg-[linear-gradient(135deg,rgba(184,137,63,.18),rgba(184,137,63,.04))] px-4 py-6 text-center sm:rounded-[26px] sm:p-[clamp(1.6rem,4vw,3rem)] md:grid-cols-[1.3fr_.7fr] md:text-start">
            <div>
              <span className="inline-block rounded-full bg-gold px-3.5 py-0.5 text-[.85rem] font-extrabold text-ink">
                {t("tag")}
              </span>
              <h3 className="mt-3.5 mb-2 font-display text-[clamp(1.7rem,3.4vw,2.5rem)] leading-snug font-semibold">
                {t("featTitle", { pct: formatPercent(pct) })}
              </h3>
              <p className="mx-auto max-w-[32rem] text-on-dark md:mx-0">{t("featText")}</p>
              <div className="my-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-[14px] border-[1.5px] border-dashed border-gold px-2.5 py-3 sm:inline-flex sm:py-2 sm:ps-4 md:justify-start">
                <span className="basis-full text-[.9rem] text-on-dark sm:basis-auto">{t("code")}</span>
                <strong dir="ltr" className="text-xl tracking-[.14em] text-gold">
                  {code}
                </strong>
                <button
                  type="button"
                  onClick={copy}
                  className="min-h-9 rounded-full bg-bg px-4 text-[.85rem] font-bold text-ink"
                >
                  {t("copy")}
                </button>
              </div>
              <div>
                <Button
                  disabled={pending}
                  onClick={() =>
                    apply(code, () => document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth" }))
                  }
                >
                  {t("apply")}
                </Button>
              </div>
            </div>
            <div
              aria-hidden
              dir="ltr"
              className="order-first text-center font-display text-[5.5rem] leading-none font-bold text-transparent [-webkit-text-stroke:2px_var(--color-gold)] sm:text-[6.5rem] md:order-none md:text-[clamp(6rem,15vw,11rem)]"
            >
              {pct}%
            </div>
          </Reveal>
        ) : null}

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {cards.map(({ icon: Icon, title, text }, i) => (
            <Reveal
              key={title}
              delay={i * 0.08}
              className="rounded-card border border-line-dark bg-bg/[.04] p-5 transition-[border-color,transform] duration-300 sm:p-6 [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:border-gold"
            >
              <Icon className="mb-3 size-[34px] text-gold" strokeWidth={1.6} aria-hidden />
              <h3 className="mb-1 text-[1.15rem] font-bold">{title}</h3>
              <p className="text-[.95rem] text-on-dark">{text}</p>
            </Reveal>
          ))}
        </div>

        {onSale.length > 0 && (
          <>
            <h3 className="mt-9 mb-5 font-display text-[1.35rem] font-semibold sm:mt-12 sm:text-[1.6rem]">
              {t("saleTitle")}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-ink sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] sm:gap-6">
              {onSale.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
