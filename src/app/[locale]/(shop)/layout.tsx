import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { CartProvider } from "@/components/shop/cart-context";
import { Footer } from "@/components/shop/footer";
import { Header } from "@/components/shop/header";
import { ToastProvider } from "@/components/shop/toast";
import { WhatsAppFloat } from "@/components/shop/whatsapp-float";
import { getCatalog, getSettings } from "@/server/queries";
import { routing } from "@/i18n/routing";

// Products, prices and settings come from the database on every request
export const dynamic = "force-dynamic";

export default async function ShopLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale = routing.locales.includes(locale as "ar" | "en") ? (locale as "ar" | "en") : "ar";
  setRequestLocale(safeLocale);
  const [products, settings, t] = await Promise.all([getCatalog(), getSettings(), getTranslations("nav")]);

  return (
    <CartProvider products={products} settings={settings}>
      <ToastProvider>
        <a
          href="#main"
          className="absolute start-4 -top-16 z-[100] rounded-[10px] bg-ink px-4 py-2.5 text-bg transition-[top] focus:top-4"
        >
          {t("skip")}
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <WhatsAppFloat />
        <CartDrawer />
      </ToastProvider>
    </CartProvider>
  );
}
