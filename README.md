# مقهى العطور · Perfume Café

متجر عطور كامل: واجهة عربية/إنجليزية (RTL/LTR)، سلة، إتمام طلب، دفع إنستاباي / فودافون كاش / عند الاستلام، إشعارات واتساب، ولوحة تحكم كاملة.

## Stack

Next.js 16 (App Router, RSC, Server Actions, Turbopack, `proxy.ts`) · React 19.2 · TypeScript · Tailwind CSS v4 (`@theme`) · Base UI · CVA · tailwind-merge · Lucide · React Icons · Framer Motion · Cairo & Cormorant Garamond (variable) · next-intl · Zod · PostgreSQL · Prisma 7 + `@prisma/adapter-pg` · Auth.js (credentials + bcryptjs) · Cloudflare R2 (`@aws-sdk/client-s3`) · WhatsApp Cloud API · Recharts · date-fns · react-day-picker · Playwright · pnpm

## التشغيل لأول مرة (Windows / macOS / Linux)

```bash
# 1) المتطلبات: Node.js 20.9+  و pnpm
npm i -g pnpm

# 2) تثبيت الحزم (يشغّل prisma generate تلقائياً)
pnpm install

# 3) ملف البيئة
copy .env.example .env        # على Windows
# cp .env.example .env        # على macOS / Linux
#   ثم عدّل DATABASE_URL و AUTH_SECRET و ADMIN_EMAIL/ADMIN_PASSWORD

# 4) قاعدة البيانات (PostgreSQL محلي، Docker، Neon أو Supabase)
docker compose up -d          # اختياري: قاعدة محلية جاهزة
pnpm db:migrate --name init   # ينشئ الجداول
pnpm db:seed                  # المنتجات + كود WELCOME15 + حساب الأدمن

# 5) التشغيل
pnpm dev                      # http://localhost:3000/ar
```

لوحة التحكم: `http://localhost:3000/ar/admin` — بالبريد وكلمة المرور من `.env`.

## الأوامر

| الأمر | الوظيفة |
|---|---|
| `pnpm dev` | تشغيل وضع التطوير (Turbopack) |
| `pnpm build` / `pnpm start` | بناء ونشر الإنتاج |
| `pnpm typecheck` | فحص TypeScript |
| `pnpm lint` | فحص ESLint |
| `pnpm db:migrate` / `db:deploy` / `db:seed` / `db:studio` | Prisma |
| `pnpm test:e2e` | اختبارات Playwright (بعد `pnpm build` وقاعدة فيها بيانات seed) |

أول مرة للاختبارات: `pnpm exec playwright install chromium`

## هيكل المشروع

```
prisma/               schema.prisma + seed.ts
prisma.config.ts      إعداد Prisma 7 (رابط قاعدة البيانات)
messages/             ar.json · en.json (كل نصوص الواجهة)
src/proxy.ts          تحديد اللغة (/ar · /en)
src/auth.ts           Auth.js (تسجيل دخول الأدمن)
src/app/[locale]/(shop)      المتجر + صفحة متابعة الطلب
src/app/[locale]/admin       تسجيل الدخول + لوحة التحكم
src/components/shop | admin | ui
src/server/actions    Server Actions (الطلبات، الكوبونات، لوحة التحكم)
src/server/storage.ts رفع الصور إلى R2 (أو public/uploads أثناء التطوير)
src/server/whatsapp.ts WhatsApp Cloud API
e2e/                  اختبارات Playwright
```

## الدفع

- **الدفع عند الاستلام**.
- **إنستاباي / فودافون كاش**: بعد الطلب تظهر للعميل بيانات التحويل (من الإعدادات) ويرفع صورة الإيصال، فتتحول حالة الدفع إلى «بانتظار التحقق» وتؤكدها من لوحة التحكم.

## واتساب

املأ `WHATSAPP_TOKEN` و `WHATSAPP_PHONE_NUMBER_ID` و `WHATSAPP_ADMIN_NUMBER` في `.env` ليصلك إشعار بكل طلب جديد وبكل إثبات دفع. لإرسال تأكيد للعميل أول مرة استخدم قالباً معتمداً من Meta (`WHATSAPP_ORDER_TEMPLATE` — متغيراته: الاسم، رقم الطلب، الإجمالي). بدون هذه القيم يعمل الموقع طبيعياً، ويظل زر «أرسل الطلب عبر واتساب» متاحاً للعميل.

## Cloudflare R2

املأ متغيرات `R2_*`. بدونها (أثناء التطوير فقط) تُحفظ الصور في `public/uploads`.
