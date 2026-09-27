import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import { OrderUpdateForm } from "@/components/admin/order-update-form";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { Badge, ORDER_STATUS_TONE, PAYMENT_STATUS_TONE } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney, toInternationalPhone, waLink } from "@/lib/utils";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function OrderDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, messages: { orderBy: { createdAt: "desc" }, take: 10 } },
  });
  if (!order) notFound();

  const [t, ts, tps, tpm, tc, fmt] = await Promise.all([
    getTranslations("admin.orders"),
    getTranslations("statuses"),
    getTranslations("paymentStatuses"),
    getTranslations("paymentMethods"),
    getTranslations("checkout"),
    getFormatter(),
  ]);
  const m = (n: number) => formatMoney(n, locale);
  const Back = locale === "ar" ? ArrowRight : ArrowLeft;

  return (
    <>
      <Link href="/admin/orders" className="mb-3 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <Back className="size-4" aria-hidden />
        {t("back")}
      </Link>
      <PageHeader
        title={`${t("details")} · ${order.ref}`}
        sub={fmt.dateTime(order.createdAt, { dateStyle: "full", timeStyle: "short" })}
        actions={
          <>
            <Badge tone={ORDER_STATUS_TONE[order.status]}>{ts(order.status)}</Badge>
            <Badge tone={PAYMENT_STATUS_TONE[order.paymentStatus]}>{tps(order.paymentStatus)}</Badge>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="grid content-start gap-5">
          <Panel title={t("items")}>
            <ul className="divide-y divide-line">
              {order.items.map((i) => (
                <li key={i.id} className="flex justify-between gap-4 py-2.5 text-sm">
                  <span>
                    <strong>{locale === "ar" ? i.nameAr : i.nameEn}</strong> · {i.size} ml × {i.quantity} ({m(i.unitPrice)})
                  </span>
                  <span className="font-bold">{m(i.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 grid gap-1.5 border-t border-line pt-3 text-sm">
              <div className="flex justify-between">
                <dt>{tc("subtotal")}</dt>
                <dd>{m(order.subtotal)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-gold-text">
                  <dt>
                    {tc("discount")} ({order.couponCode})
                  </dt>
                  <dd>− {m(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt>{tc("shipping")}</dt>
                <dd>{order.shipping ? m(order.shipping) : tc("free")}</dd>
              </div>
              <div className="flex justify-between text-base font-extrabold">
                <dt>{tc("total")}</dt>
                <dd>{m(order.total)}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title={t("customer")}>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-ink-soft">{t("customer")}</dt>
                <dd className="font-semibold">{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-ink-soft">{t("phone")}</dt>
                <dd dir="ltr" className="font-semibold rtl:text-right">
                  {order.phone}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-ink-soft">{t("address")}</dt>
                <dd className="font-semibold whitespace-pre-line">{order.address}</dd>
              </div>
              {order.suggestion && (
                <div className="rounded-xl bg-gold/10 p-3 sm:col-span-2">
                  <dt className="text-gold-text">{t("suggestion")}</dt>
                  <dd className="whitespace-pre-line">{order.suggestion}</dd>
                </div>
              )}
            </dl>
            <a
              href={waLink(toInternationalPhone(order.phone))}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm", className: "mt-4" })}
            >
              {t("openWa")}
            </a>
          </Panel>
        </div>

        <div className="grid content-start gap-5">
          <Panel title={t("update")}>
            <OrderUpdateForm
              id={order.id}
              status={order.status}
              paymentStatus={order.paymentStatus}
              adminNotes={order.adminNotes}
            />
          </Panel>

          <Panel title={`${t("payment")} · ${tpm(order.paymentMethod)}`}>
            {order.paymentMethod === "COD" ? (
              <p className="text-sm text-ink-soft">{tpm("CODd")}</p>
            ) : order.paymentProofUrl ? (
              <div className="grid gap-3">
                {order.paymentReference && (
                  <p className="text-sm">
                    {t("reference")}: <strong dir="ltr">{order.paymentReference}</strong>
                  </p>
                )}
                <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="group block">
                  {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded proof from R2 */}
                  <img
                    src={order.paymentProofUrl}
                    alt={t("proof")}
                    className="max-h-[420px] w-full rounded-xl border border-line object-contain"
                  />
                  <span className="mt-1.5 inline-flex items-center gap-1 text-sm text-ink-soft group-hover:text-ink">
                    <ExternalLink className="size-4" aria-hidden /> {t("proof")}
                  </span>
                </a>
              </div>
            ) : (
              <p className="text-sm text-ink-soft">{t("noProof")}</p>
            )}
          </Panel>

          {order.messages.length > 0 && (
            <Panel title={t("messages")}>
              <ul className="grid gap-2 text-sm">
                {order.messages.map((msg) => (
                  <li key={msg.id} className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      <code className="text-xs">{msg.kind}</code> → <span dir="ltr">{msg.to}</span>
                    </span>
                    <Badge tone={msg.success ? "success" : "danger"} title={msg.error ?? undefined}>
                      {msg.success ? t("sent") : t("failed")}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
