import { setRequestLocale } from "next-intl/server";
import { AboutSection } from "@/components/shop/about-section";
import { CheckoutSection } from "@/components/shop/checkout-section";
import { ContactSection } from "@/components/shop/contact-section";
import { Hero } from "@/components/shop/hero";
import { OffersSection } from "@/components/shop/offers-section";
import { ProductsSection } from "@/components/shop/products-section";
import { SITE_URL } from "@/lib/site";
import { getCatalog, getSettings } from "@/server/queries";
import { unitPrice } from "@/lib/catalog";
import { routing } from "@/i18n/routing";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = routing.locales.includes(locale as "ar" | "en") ? (locale as "ar" | "en") : "ar";
  setRequestLocale(safeLocale);
  const [settings, products] = await Promise.all([getSettings(), getCatalog()]);

  // Structured data for search engines
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: safeLocale === "ar" ? "مقهى العطور" : "Perfume Café",
    url: `${SITE_URL}/${safeLocale}`,
    telephone: `+${settings.whatsappNumber}`,
    image: `${SITE_URL}/logo.png`,
    currenciesAccepted: "EGP",
    makesOffer: products.slice(0, 20).map((p) => ({
      "@type": "Offer",
      priceCurrency: "EGP",
      price: unitPrice(p, 50),
      availability: p.stock50 + p.stock100 > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemOffered: { "@type": "Product", name: safeLocale === "ar" ? p.nameAr : p.nameEn },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero />
      <ProductsSection />
      <OffersSection />
      <CheckoutSection />
      <AboutSection />
      <ContactSection settings={settings} />
    </>
  );
}
