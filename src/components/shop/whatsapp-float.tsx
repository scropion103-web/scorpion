"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { cn, waLink } from "@/lib/utils";
import { useCart } from "./cart-context";

/** Floating WhatsApp button — hides while scrolling down on phones so it never covers buttons */
export function WhatsAppFloat() {
  const t = useTranslations("contact");
  const tn = useTranslations("nav");
  const { settings } = useCart();
  const [away, setAway] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY.current + 6 && y > 300) setAway(true);
      else if (y < lastY.current - 6) setAway(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={waLink(settings.whatsappNumber, t("greeting"))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={tn("whatsapp")}
      className={cn(
        "fixed start-5 bottom-[calc(1.2rem+env(safe-area-inset-bottom))] z-40 grid size-[50px] place-items-center rounded-full border-2 border-gold bg-ink text-gold shadow-[0_12px_26px_-10px_rgba(0,0,0,.55)] transition-[transform,opacity] duration-300 md:size-14 [@media(hover:hover)]:hover:scale-[1.08]",
        away && "max-md:pointer-events-none max-md:translate-y-[90px] max-md:opacity-0",
      )}
    >
      <FaWhatsapp className="size-[26px] md:size-7" aria-hidden />
    </a>
  );
}
