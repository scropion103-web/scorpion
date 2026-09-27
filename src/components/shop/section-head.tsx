import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

export function SectionHead({
  eyebrow,
  title,
  sub,
  dark = false,
  id,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  dark?: boolean;
  id?: string;
}) {
  return (
    <Reveal className="mx-auto mb-7 max-w-[640px] text-center md:mb-10">
      <span className={cn("mb-1 inline-block text-[.95rem] font-bold", dark ? "text-gold" : "text-gold-text")}>
        {eyebrow}
      </span>
      <h2 id={id} className={cn("section-title", dark && "text-bg")}>
        {title}
      </h2>
      {sub && <p className={cn("mt-4", dark ? "text-on-dark" : "text-ink-soft")}>{sub}</p>}
    </Reveal>
  );
}
