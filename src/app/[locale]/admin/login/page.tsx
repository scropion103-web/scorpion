import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = raw === "en" ? "en" : "ar";
  setRequestLocale(locale);
  const session = await auth();
  if (session?.user) redirect(`/${locale}/admin`);
  const t = await getTranslations("admin");

  return (
    <main className="grid min-h-dvh place-items-center bg-[radial-gradient(60%_60%_at_50%_0%,rgba(184,137,63,.18),transparent_70%)] px-4 py-10">
      <div className="w-full max-w-[420px] rounded-[22px] border border-line bg-card p-7 shadow-card sm:p-9">
        <Image src="/logo.png" alt="مقهى العطور | Perfume Café" width={196} height={176} className="mx-auto h-24 w-auto" priority />
        <h1 className="mt-4 text-center font-display text-2xl font-semibold">{t("loginTitle")}</h1>
        <p className="mb-6 text-center text-sm text-ink-soft">{t("loginSub")}</p>
        <LoginForm locale={locale} />
      </div>
    </main>
  );
}
