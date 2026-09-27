import { Heart, MessageCircle, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa6";
import { buttonVariants } from "@/components/ui/button";
import type { StoreSettings } from "@/lib/catalog";
import { waLink } from "@/lib/utils";
import { Reveal } from "./reveal";
import { SectionHead } from "./section-head";

export async function ContactSection({ settings }: { settings: StoreSettings }) {
  const t = await getTranslations("contact");
  const wa = waLink(settings.whatsappNumber, t("greeting"));
  const socials = [
    { href: settings.instagramUrl, label: "Instagram", icon: FaInstagram },
    { href: settings.facebookUrl, label: "Facebook", icon: FaFacebookF },
    { href: settings.tiktokUrl, label: "TikTok", icon: FaTiktok },
    { href: wa, label: "WhatsApp", icon: FaWhatsapp },
  ].filter((s): s is typeof s & { href: string } => Boolean(s.href));

  const card = "flex flex-col items-start gap-2 rounded-card border border-line bg-card p-6 sm:p-7";

  return (
    <section id="contact" aria-labelledby="contact-title" className="py-12 sm:py-[clamp(3.5rem,8vw,6.5rem)]">
      <div className="container-x">
        <SectionHead id="contact-title" eyebrow={t("eyebrow")} title={t("title")} sub={t("sub")} />
        <div className="grid gap-5 md:grid-cols-3">
          <Reveal className={card}>
            <MessageCircle className="size-[34px] text-gold-text" strokeWidth={1.6} aria-hidden />
            <h3 className="text-[1.2rem] font-bold">{t("waT")}</h3>
            <p className="text-[.95rem] text-ink-soft">{t("waD")}</p>
            <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonVariants({ className: "mt-auto" })}>
              {t("waBtn")}
            </a>
          </Reveal>

          <Reveal className={card} delay={0.08}>
            <Phone className="size-[34px] text-gold-text" strokeWidth={1.6} aria-hidden />
            <h3 className="text-[1.2rem] font-bold">{t("telT")}</h3>
            <p className="text-[.95rem] text-ink-soft">{t("telD")}</p>
            <a
              href={`tel:+${settings.whatsappNumber}`}
              dir="ltr"
              className="inline-block py-1 text-[1.15rem] font-extrabold [unicode-bidi:isolate]"
            >
              {settings.phoneDisplay}
            </a>
          </Reveal>

          <Reveal className={card} delay={0.16}>
            <Heart className="size-[34px] text-gold-text" strokeWidth={1.6} aria-hidden />
            <h3 className="text-[1.2rem] font-bold">{t("socT")}</h3>
            <p className="text-[.95rem] text-ink-soft">{t("socD")}</p>
            <div className="mt-1.5 flex gap-2.5">
              {socials.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-[46px] place-items-center rounded-full border-[1.5px] border-ink transition-[background,color,transform] [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:bg-ink [@media(hover:hover)]:hover:text-gold"
                >
                  <Icon className="size-5" aria-hidden />
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
