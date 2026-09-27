import { getFormatter, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/admin/page-header";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";

export default async function SuggestionsPage() {
  const [t, fmt, rows] = await Promise.all([
    getTranslations("admin.suggestions"),
    getFormatter(),
    prisma.order.findMany({
      where: { suggestion: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, ref: true, customerName: true, suggestion: true, createdAt: true },
    }),
  ]);

  return (
    <>
      <PageHeader title={t("title")} sub={t("sub")} />
      {rows.length === 0 ? (
        <p className="rounded-[18px] border border-line bg-card px-4 py-14 text-center text-ink-soft">{t("empty")}</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {rows.map((r) => (
            <li key={r.id} className="rounded-[18px] border border-line bg-card p-5">
              <p className="whitespace-pre-line">{r.suggestion}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-ink-soft">
                <span>
                  {r.customerName} ·{" "}
                  <Link href={`/admin/orders/${r.id}`} dir="ltr" className="font-bold text-ink hover:underline">
                    {r.ref}
                  </Link>
                </span>
                <span>{fmt.dateTime(r.createdAt, { dateStyle: "medium" })}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
