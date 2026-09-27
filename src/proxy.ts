import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16: `proxy.ts` replaces `middleware.ts`.
// Handles locale detection and the /ar · /en prefixes.
// Admin pages are protected server-side in app/[locale]/admin/(panel)/layout.tsx.
export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals, uploaded files and anything with a file extension
  matcher: ["/((?!api|_next|_vercel|uploads|.*\\..*).*)"],
};
