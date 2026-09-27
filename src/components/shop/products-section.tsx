"use client";

import { useTranslations } from "next-intl";
import { useRef, useState, type KeyboardEvent } from "react";
import { CATEGORIES, type CategoryKey } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { useCart } from "./cart-context";
import { ProductCard } from "./product-card";
import { Reveal } from "./reveal";
import { SectionHead } from "./section-head";

type Tab = "ALL" | CategoryKey;
const TABS: Tab[] = ["ALL", ...CATEGORIES];

export function ProductsSection() {
  const t = useTranslations("products");
  const tc = useTranslations("categories");
  const { products } = useCart();
  const [tab, setTab] = useState<Tab>("ALL");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const list = tab === "ALL" ? products : products.filter((p) => p.category === tab);

  // Arrow-key navigation between tabs (WAI-ARIA tabs pattern, RTL aware)
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = TABS.indexOf(tab);
    const rtl = document.documentElement.dir === "rtl";
    let next = -1;
    if (e.key === "ArrowRight") next = rtl ? i - 1 : i + 1;
    if (e.key === "ArrowLeft") next = rtl ? i + 1 : i - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = TABS.length - 1;
    if (next === -1) return;
    e.preventDefault();
    next = (next + TABS.length) % TABS.length;
    setTab(TABS[next]);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="products" className="py-12 sm:py-[clamp(3.5rem,8vw,6.5rem)]" aria-labelledby="products-title">
      <div className="container-x">
        <SectionHead id="products-title" eyebrow={t("eyebrow")} title={t("title")} sub={t("sub")} />

        <Reveal>
          <div
            role="tablist"
            aria-label={t("tabs")}
            onKeyDown={onKeyDown}
            className="no-scrollbar -mx-4 mb-8 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
          >
            {TABS.map((c, i) => (
              <button
                key={c}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                type="button"
                id={`tab-${c}`}
                aria-selected={tab === c}
                aria-controls="product-grid"
                tabIndex={tab === c ? 0 : -1}
                onClick={() => setTab(c)}
                className={cn(
                  "min-h-[46px] shrink-0 rounded-full border-[1.5px] border-line px-5 py-2 font-bold transition-colors sm:px-6",
                  tab === c ? "border-ink bg-ink text-bg" : "[@media(hover:hover)]:hover:border-gold",
                )}
              >
                {tc(c)}
              </button>
            ))}
          </div>
        </Reveal>

        <div
          id="product-grid"
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          aria-live="polite"
          className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] sm:gap-6"
        >
          {list.map((p, i) => (
            <ProductCard key={`${tab}-${p.id}`} product={p} index={i} />
          ))}
          {list.length === 0 && <p className="col-span-full py-10 text-center text-ink-soft">{t("empty")}</p>}
        </div>
      </div>
    </section>
  );
}
