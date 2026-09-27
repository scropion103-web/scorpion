import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect(`/${locale}/admin`);

  const [t, s] = await Promise.all([
    getTranslations("admin.settings"),
    prisma.setting.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } }),
  ]);

  const r2 = Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_BUCKET && process.env.R2_ACCESS_KEY_ID && process.env.R2_PUBLIC_URL);
  const wa = Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
  const { id: _id, ...values } = s;
  void _id;

  return (
    <>
      <PageHeader title={t("title")} />
      <SettingsForm values={values} />
      <Panel title={t("integrations")} className="mt-5">
        <ul className="grid gap-3 text-sm sm:grid-cols-2">
          {[
            { label: t("r2"), ok: r2 },
            { label: t("wa"), ok: wa },
          ].map((i) => (
            <li key={i.label} className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
              <span className="font-semibold">{i.label}</span>
              <Badge tone={i.ok ? "success" : "warning"}>{i.ok ? t("connected") : t("notConnected")}</Badge>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
