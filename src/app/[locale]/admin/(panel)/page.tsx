import { format, parseISO } from "date-fns";
import { arEG, enUS } from "date-fns/locale";
import { getFormatter, getTranslations } from "next-intl/server";
import { CategoryBars, RevenueChart } from "@/components/admin/charts";
import { DateRangePicker } from "@/components/admin/date-range-picker";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { Badge, ORDER_STATUS_TONE } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { ORDER_STATUSES, PAYMENT_METHODS } from "@/lib/catalog";
import { daysBetween, now, parseRange } from "@/lib/date-range";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
};

export default async function DashboardPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const { start, end, fromStr, toStr } = parseRange(sp.from, sp.to);
  const inRange = { createdAt: { gte: start, lte: end } };
  const notCancelled = { status: { not: "CANCELLED" as const } };

  const [t, ts, tpm, fmt] = await Promise.all([
    getTranslations("admin.dashboard"),
    getTranslations("statuses"),
    getTranslations("paymentMethods"),
    getFormatter(),
  ]);

  const [agg, rows, byStatus, byPayment, top, pendingPayments, recent] = await Promise.all([
    prisma.order.aggregate({ where: { ...inRange, ...notCancelled }, _sum: { total: true }, _count: true }),
    prisma.order.findMany({ where: { ...inRange, ...notCancelled }, select: { createdAt: true, total: true } }),
    prisma.order.groupBy({ by: ["status"], where: inRange, _count: { _all: true } }),
    prisma.order.groupBy({ by: ["paymentMethod"], where: { ...inRange, ...notCancelled }, _count: { _all: true } }),
    prisma.orderItem.groupBy({
      by: ["nameAr", "nameEn"],
      where: { order: { ...inRange, ...notCancelled } },
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.order.count({ where: { paymentStatus: "AWAITING_VERIFICATION" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, ref: true, customerName: true, total: true, status: true, createdAt: true },
    }),
  ]);

  const revenue = agg._sum.total ?? 0;
  const count = agg._count;
  const m = (n: number) => formatMoney(n, locale);

  // daily series
  const dfLocale = locale === "ar" ? arEG : enUS;
  const perDay = new Map(daysBetween(start, end).map((d) => [d, { revenue: 0, orders: 0 }]));
  for (const r of rows) {
    const k = format(r.createdAt, "yyyy-MM-dd");
    const cur = perDay.get(k);
    if (cur) {
      cur.revenue += r.total;
      cur.orders += 1;
    }
  }
  const series = [...perDay.entries()].map(([day, v]) => ({
    day: format(parseISO(day), "d MMM", { locale: dfLocale }),
    ...v,
  }));

  const statusData = ORDER_STATUSES.map((s) => ({
    name: ts(s),
    value: byStatus.find((b) => b.status === s)?._count._all ?? 0,
  }));
  const paymentData = PAYMENT_METHODS.map((p) => ({
    name: tpm(p),
    value: byPayment.find((b) => b.paymentMethod === p)?._count._all ?? 0,
  }));
  const topMax = Math.max(1, ...top.map((x) => x._sum.quantity ?? 0));

  const tiles = [
    { label: t("revenue"), value: m(revenue), note: t("excludesCancelled") },
    { label: t("orders"), value: fmt.number(count) },
    { label: t("avgOrder"), value: m(count ? revenue / count : 0) },
    { label: t("pendingPayments"), value: fmt.number(pendingPayments), href: "/admin/orders?payment=AWAITING_VERIFICATION" },
  ];

  return (
    <>
      <PageHeader title={t("title")} actions={<DateRangePicker from={fromStr} to={toStr} />} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {tiles.map((tile) => {
          const body = (
            <>
              <div className="text-sm text-ink-soft">{tile.label}</div>
              <div className="mt-1 text-[1.5rem] leading-tight font-extrabold sm:text-[1.9rem]">{tile.value}</div>
              {tile.note && <div className="mt-1 text-xs text-ink-soft">{tile.note}</div>}
            </>
          );
          return tile.href ? (
            <Link
              key={tile.label}
              href={tile.href}
              className="rounded-[18px] border border-gold/50 bg-gold/10 p-4 transition-colors hover:border-gold sm:p-5"
            >
              {body}
            </Link>
          ) : (
            <div key={tile.label} className="rounded-[18px] border border-line bg-card p-4 sm:p-5">
              {body}
            </div>
          );
        })}
      </div>

      <Panel title={t("revenueChart")} className="mt-5">
        {count ? (
          <RevenueChart data={series} label={t("revenue")} rtl={locale === "ar"} currency={locale === "ar" ? "ج.م" : "EGP"} />
        ) : (
          <p className="py-16 text-center text-ink-soft">{t("noData")}</p>
        )}
      </Panel>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Panel title={t("statusChart")}>
          <CategoryBars data={statusData} label={t("orders")} />
        </Panel>
        <Panel title={t("paymentChart")}>
          <CategoryBars data={paymentData} label={t("orders")} />
        </Panel>
        <Panel title={t("topProducts")}>
          {top.length ? (
            <ol className="grid gap-3">
              {top.map((p) => {
                const qty = p._sum.quantity ?? 0;
                return (
                  <li key={p.nameEn}>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="font-semibold">{locale === "ar" ? p.nameAr : p.nameEn}</span>
                      <span className="text-ink-soft">
                        {qty} {t("units")} · {m(p._sum.lineTotal ?? 0)}
                      </span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-ink/6">
                      <div className="h-2 rounded-full bg-gold" style={{ width: `${(qty / topMax) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="py-10 text-center text-ink-soft">{t("noData")}</p>
          )}
        </Panel>
      </div>

      <Panel title={t("recentOrders")} className="mt-5">
        <ul className="divide-y divide-line">
          {recent.map((o) => (
            <li key={o.id}>
              <Link
                href={`/admin/orders/${o.id}`}
                className="flex flex-wrap items-center justify-between gap-3 py-3 hover:text-gold-text"
              >
                <span className="flex items-center gap-3">
                  <span dir="ltr" className="font-bold">
                    {o.ref}
                  </span>
                  <span className="text-ink-soft">{o.customerName}</span>
                </span>
                <span className="flex items-center gap-3 text-sm">
                  <Badge tone={ORDER_STATUS_TONE[o.status]}>{ts(o.status)}</Badge>
                  <span className="font-bold">{m(o.total)}</span>
                  <span className="text-ink-soft">{fmt.relativeTime(o.createdAt, now())}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
