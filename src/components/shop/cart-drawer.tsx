"use client";

import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { useCart } from "./cart-context";
import { CartLines, CartTotals } from "./cart-lines";

export function CartDrawer() {
  const t = useTranslations("cart");
  const tn = useTranslations("nav");
  const locale = useLocale();
  const { drawerOpen, setDrawerOpen, lines } = useCart();

  return (
    <Dialog.Root open={drawerOpen} onOpenChange={(open: boolean) => setDrawerOpen(open)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[80] bg-ink/55 transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup
          data-testid="cart-drawer"
          className="fixed inset-y-0 end-0 z-[90] flex w-[min(430px,100%)] flex-col bg-bg shadow-[-20px_0_50px_-20px_rgba(0,0,0,.4)] transition-transform duration-[380ms] ease-[cubic-bezier(.2,.8,.2,1)] data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full rtl:data-[ending-style]:-translate-x-full rtl:data-[starting-style]:-translate-x-full"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-4 sm:px-5">
            <Dialog.Title className="font-display text-[1.4rem] font-semibold">{t("title")}</Dialog.Title>
            <Dialog.Close
              aria-label={tn("close")}
              className="grid size-[46px] place-items-center rounded-full border-[1.5px] border-line bg-card hover:border-gold"
            >
              <X className="size-[22px]" aria-hidden />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
            <CartLines />
          </div>
          {lines.length > 0 && (
            <div className="border-t border-line bg-card px-4 pt-4 pb-[calc(1.3rem+env(safe-area-inset-bottom))] sm:px-5">
              <CartTotals className="mb-4 grid gap-2" />
              <a
                href={`/${locale}#checkout`}
                onClick={() => setDrawerOpen(false)}
                className={buttonVariants({ block: true })}
              >
                {t("checkout")}
              </a>
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
