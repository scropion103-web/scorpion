import { FlaskConical, Layers, MessageCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { DropMark } from "./bottle";
import { Reveal } from "./reveal";

export async function AboutSection() {
  const t = await getTranslations("about");
  const values = [
    { icon: FlaskConical, title: t("v1t"), text: t("v1d") },
    { icon: Layers, title: t("v2t"), text: t("v2d") },
    { icon: MessageCircle, title: t("v3t"), text: t("v3d") },
  ];
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="border-y border-line bg-card py-12 sm:py-[clamp(3.5rem,8vw,6.5rem)]"
    >
      <div className="container-x">
        <div className="grid items-center gap-[clamp(2rem,5vw,4.5rem)] lg:grid-cols-2">
          <Reveal>
            <span className="mb-1 inline-block text-[.95rem] font-bold text-gold-text">{t("eyebrow")}</span>
            <h2 id="about-title" className="section-title after:ms-0!">
              {t("title")}
            </h2>
            <p className="mt-4 text-[1.05rem] text-ink-soft">{t("p1")}</p>
            <p className="mt-4 text-[1.05rem] text-ink-soft">{t("p2")}</p>
          </Reveal>
          <Reveal
            delay={0.1}
            className="grid place-items-center gap-4 rounded-[26px] bg-[radial-gradient(70%_70%_at_50%_35%,rgba(184,137,63,.3),transparent_70%),var(--color-ink)] px-8 py-14 text-center text-bg"
          >
            <DropMark className="h-auto w-[84px]" />
            <div className="text-[2.3rem] leading-tight font-bold">مقهى العطور</div>
            <div className="text-[.82rem] font-semibold tracking-[.42em] text-gold">PERFUME CAFÉ</div>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {values.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.08} className="rounded-card border border-line bg-bg p-6">
              <Icon className="mb-2.5 size-[30px] text-gold-text" strokeWidth={1.6} aria-hidden />
              <h3 className="text-[1.1rem] font-bold">{title}</h3>
              <p className="mt-1 text-[.94rem] text-ink-soft">{text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
