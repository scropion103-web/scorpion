import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "always",
  // Arabic-first store: "/" always opens /ar instead of following the browser's Accept-Language
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
