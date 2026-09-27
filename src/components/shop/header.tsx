"use client";

import Image from "next/image";
import NextLink from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useCart } from "./cart-context";

const NAV = ["products", "offers", "about", "contact"] as const;

const subscribeScroll = (cb: () => void) => {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
};

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { count, setDrawerOpen } = useCart();
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 24,
    () => false,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const prevCount = useRef(count);
  const [bump, setBump] = useState(0);

  // close the mobile menu on outside click / Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // badge "bump" animation when an item is added
  useEffect(() => {
    if (count > prevCount.current) {
      const id = requestAnimationFrame(() => setBump((b) => b + 1));
      prevCount.current = count;
      return () => cancelAnimationFrame(id);
    }
    prevCount.current = count;
  }, [count]);

  const switchLocale = (next: "ar" | "en") => {
    if (next === locale) return;
    router.replace(pathname, { locale: next, scroll: false });
  };

  return (
    <header
      ref={headerRef}
      id="top"
      className="sticky top-0 z-50 border-b border-line bg-bg"
    >
      <div
        className={cn(
          "container-x flex items-center justify-between gap-4 transition-[min-height] duration-300",
          scrolled ? "min-h-[68px]" : "min-h-[76px] md:min-h-[92px]",
        )}
      >
        <Link href="/" className="flex shrink-0 items-center" aria-label={t("home")}>
          <Image
            src="/logo.png"
            alt="مقهى العطور | Perfume Café"
            width={196}
            height={176}
            priority
            className={cn(
              "w-auto transition-[height] duration-300",
              scrolled ? "h-12 md:h-[52px]" : "h-[58px] md:h-20",
            )}
          />
        </Link>

        <nav
          id="main-nav"
          aria-label={t("main")}
          className={cn(
            "items-center gap-9 max-md:absolute max-md:inset-x-0 max-md:top-full max-md:flex-col max-md:items-stretch max-md:gap-0 max-md:border-b max-md:border-line max-md:bg-bg max-md:px-4 max-md:pt-2 max-md:pb-4",
            menuOpen ? "flex max-md:animate-rise" : "hidden md:flex",
          )}
        >
          {NAV.map((key) => (
            <NextLink
              key={key}
              href={`/${locale}#${key}`}
              onClick={() => setMenuOpen(false)}
              className="group relative py-1.5 font-semibold max-md:border-b max-md:border-line max-md:px-1.5 max-md:py-3.5"
            >
              {t(key)}
              <span className="absolute inset-x-0 bottom-0 h-0.5 origin-center scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100 max-md:hidden" />
            </NextLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <div role="group" aria-label={t("lang")} className="inline-flex rounded-full border-[1.5px] border-ink p-[3px]">
            {(["ar", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                lang={l}
                aria-pressed={locale === l}
                onClick={() => switchLocale(l)}
                className={cn(
                  "min-h-[34px] min-w-[38px] rounded-full px-2 text-[.82rem] font-extrabold tracking-wider transition-colors sm:min-w-[44px] sm:px-3",
                  locale === l && "bg-ink text-bg",
                )}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setDrawerOpen(true);
            }}
            aria-label={t("cart")}
            data-testid="cart-button"
            className="relative grid size-[46px] place-items-center rounded-full border-[1.5px] border-line bg-card transition-colors hover:border-gold"
          >
            <ShoppingBag className="size-[22px]" strokeWidth={1.8} aria-hidden />
            {count > 0 && (
              <span
                key={bump}
                data-testid="cart-count"
                className="absolute -end-1.5 -top-1.5 grid h-[22px] min-w-[22px] animate-bump place-items-center rounded-full bg-gold px-1.5 text-xs leading-none font-extrabold text-ink"
              >
                {count}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={t("menu")}
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            className="grid size-[46px] place-items-center rounded-full border-[1.5px] border-line bg-card md:hidden"
          >
            {menuOpen ? <X className="size-[22px]" aria-hidden /> : <Menu className="size-[22px]" aria-hidden />}
          </button>
        </div>
      </div>
    </header>
  );
}
