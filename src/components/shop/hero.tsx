import { Check } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { HeroBottle } from "./bottle";
import { Reveal } from "./reveal";

export async function Hero() {
  const t = await getTranslations("hero");
  const locale = await getLocale();
  return (
    <section className="overflow-hidden bg-[radial-gradient(55%_75%_at_78%_45%,rgba(184,137,63,.24),transparent_65%),var(--color-ink)] text-bg">
      <div className="container-x">
        <div className="grid items-center gap-3 pt-6 pb-5 text-center sm:gap-8 sm:py-14 lg:grid-cols-[1.1fr_.9fr] lg:py-20 lg:text-start">
          <Reveal>
            <p className="mb-3 text-[.74rem] font-semibold tracking-[.3em] text-gold sm:mb-4 sm:text-[.82rem] sm:tracking-[.42em]">
              PERFUME CAFÉ
            </p>
            <h1 className="font-display text-[2.1rem] leading-[1.25] font-semibold sm:text-[clamp(2.2rem,5.6vw,4.5rem)]">
              <span className="block">{t("t1")}</span>
              <span className="block text-gold">{t("t2")}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-[34rem] text-base text-on-dark sm:mt-6 sm:text-lg lg:mx-0">{t("sub")}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 sm:mt-8 lg:justify-start">
              <a href={`/${locale}#products`} className={buttonVariants({ className: "flex-[1_1_150px] sm:flex-none" })}>
                {t("cta1")}
              </a>
              <a
                href={`/${locale}#offers`}
                className={buttonVariants({ variant: "outlineLight", className: "flex-[1_1_150px] sm:flex-none" })}
              >
                {t("cta2")}
              </a>
            </div>
          </Reveal>
          <Reveal className="order-first grid place-items-center lg:order-none" delay={0.1}>
            <HeroBottle className="h-auto w-[140px] sm:w-[min(280px,70%)] lg:w-[min(400px,100%)]" />
          </Reveal>
        </div>

        <ul className="flex flex-col items-center gap-x-9 gap-y-2.5 border-t border-line-dark pt-5 pb-6 text-[.95rem] text-on-dark sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
          {(["f1", "f2", "f3"] as const).map((k) => (
            <li key={k} className="flex items-center gap-2.5">
              <Check className="size-5 text-gold" aria-hidden />
              <span>{t(k)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
