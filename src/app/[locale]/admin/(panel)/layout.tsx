import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = raw === "en" ? "en" : "ar";
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) redirect(`/${locale}/admin/login`);

  return (
    <div className="min-h-dvh bg-bg lg:grid lg:grid-cols-[270px_minmax(0,1fr)]">
      <AdminSidebar user={session.user} />
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
