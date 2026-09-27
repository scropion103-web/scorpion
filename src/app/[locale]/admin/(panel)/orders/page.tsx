import { Search } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/admin/page-header";
import { Badge, ORDER_STATUS_TONE, PAYMENT_STATUS_TONE } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { Link } from "@/i18n/navigation";
import { ORDER_STATUSES, PAYMENT_STATUSES, type OrderStatusKey, type PaymentStatusKey } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";
import type { Prisma } from "@/generated/prisma/client";

const PAGE_SIZE = 20;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; status?: string; payment?: string; page?: string }>;
};

export default async function OrdersPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 60);
  const status = ORDER_STATUSES.includes(sp.status as OrderStatusKey) ? (sp.status as OrderStatusKey) : undefined;
  const payment = PAYMENT_STATUSES.includes(sp.payment as PaymentStatusKey) ? (sp.payment as PaymentStatusKey) : undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(payment ? { paymentStatus: payment } : {}),
    ...(q
      ? {
          OR: [
            { ref: { contains: q, mode: "insensitive" } },
            { customerName: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
          ],
        }
      : {}),
  };

  const [t, ts, tps, tpm, fmt, total, orders] = await Promise.all([
    getTranslations("admin.orders"),
    getTranslations("statuses"),
    getTranslations("paymentStatuses"),
    getTranslations("paymentMethods"),
    getFormatter(),
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        ref: true,
        customerName: true,
        phone: true,
        total: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        createdAt: true,
      },
    }),
  ]);
  const ta = await getTranslations("admin");
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (p: number) => {
    const query: Record<string, string> = { page: String(p) };
    if (q) query.q = q;
    if (status) query.status = status;
    if (payment) query.payment = payment;
    return { query };
  };

  return (
    <>
      <PageHeader title={t("title")} />

      <form className="mb-5 flex flex-wrap gap-2" role="search">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" aria-hidden />
          <Input name="q" defaultValue={q} placeholder={t("searchPh")} aria-label={ta("search")} className="ps-9" />
        </div>
        <Select name="status" defaultValue={status ?? ""} aria-label={t("status")} className="w-auto">
          <option value="">
            {t("status")}: {ta("all")}
          </option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ts(s)}
            </option>
          ))}
        </Select>
        <Select name="payment" defaultValue={payment ?? ""} aria-label={t("paymentStatus")} className="w-auto">
          <option value="">
            {t("paymentStatus")}: {ta("all")}
          </option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {tps(s)}
            </option>
          ))}
        </Select>
        <button type="submit" className={buttonVariants({ variant: "dark", size: "sm" })}>
          {ta("search")}
        </button>
      </form>

      <div className="overflow-x-auto rounded-[18px] border border-line bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-ink/4 text-start text-ink-soft">
            <tr>
              {[t("ref"), t("customer"), t("date"), t("payment"), t("status"), t("total")].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 text-start font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gold/5">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} dir="ltr" className="font-bold underline-offset-4 hover:underline">
                    {o.ref}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold">{o.customerName}</div>
                  <div dir="ltr" className="text-ink-soft rtl:text-right">
                    {o.phone}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-ink-soft">
                  {fmt.dateTime(o.createdAt, { dateStyle: "medium", timeStyle: "short" })}
                </td>
                <td className="px-4 py-3">
                  <div>{tpm(o.paymentMethod)}</div>
                  <Badge tone={PAYMENT_STATUS_TONE[o.paymentStatus]}>{tps(o.paymentStatus)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={ORDER_STATUS_TONE[o.status]}>{ts(o.status)}</Badge>
                </td>
                <td className="px-4 py-3 font-bold whitespace-nowrap">{formatMoney(o.total, locale)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center text-ink-soft">
                  {t("empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <nav className="mt-5 flex items-center justify-center gap-3" aria-label="pagination">
          {page > 1 && (
            <Link href={{ pathname: "/admin/orders", ...qs(page - 1) }} className={buttonVariants({ variant: "outline", size: "sm" })}>
              {t("prev")}
            </Link>
          )}
          <span className="text-sm text-ink-soft">{t("page", { page, pages })}</span>
          {page < pages && (
            <Link href={{ pathname: "/admin/orders", ...qs(page + 1) }} className={buttonVariants({ variant: "outline", size: "sm" })}>
              {t("next")}
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
