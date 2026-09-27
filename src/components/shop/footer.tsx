import { getLocale, getTranslations } from "next-intl/server";

const currentYear = () => new Date().getFullYear();

export async function Footer() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const locale = await getLocale();
  const links = ["products", "offers", "about", "contact"] as const;
  return (
    <footer className="bg-ink pt-12 pb-6 text-bg">
      <div className="container-x">
        <div className="flex flex-col items-center justify-between gap-6 border-b border-line-dark pb-8 text-center sm:flex-row sm:flex-wrap sm:text-start">
          <div>
            <div className="text-[2rem] leading-tight font-bold">مقهى العطور</div>
            <div className="text-[.75rem] font-semibold tracking-[.42em] text-gold">PERFUME CAFÉ</div>
            <p className="mt-2.5 text-[.92rem] text-on-dark">{t("tag")}</p>
          </div>
          <nav aria-label={t("links")} className="flex flex-wrap justify-center gap-x-7 gap-y-2 font-semibold text-on-dark">
            {links.map((k) => (
              <a key={k} href={`/${locale}#${k}`} className="px-1 py-1.5 [@media(hover:hover)]:hover:text-gold">
                {tn(k)}
              </a>
            ))}
          </nav>
        </div>
        <p className="pt-5 text-center text-[.86rem] text-on-dark">{t("rights", { year: currentYear() })}</p>
      </div>
    </footer>
  );
}
