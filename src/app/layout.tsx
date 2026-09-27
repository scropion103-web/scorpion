import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Lets pages outside [locale] (e.g. the root 404) resolve the Open Graph image URL.
export const metadata: Metadata = { metadataBase: new URL(SITE_URL) };

// The <html> element lives in app/[locale]/layout.tsx so it can carry lang/dir.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
