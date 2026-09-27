import { CircleCheck, Clock } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { Badge, ORDER_STATUS_TONE, PAYMENT_STATUS_TONE } from "@/components/ui/badge";
import { CopyButton } from "@/components/shop/copy-button";
import { PaymentProofForm } from "@/components/shop/payment-proof-form";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { formatMoney, waLink } from "@/lib/utils";
import { buildOrderMessage } from "@/server/order-messages";
import { getSettings } from "@/server/queries";

type Props = { params: Promise<{ locale: string; ref: string }>; searchParams: Promise<{ new?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ref, locale } = await params;
  const t = await getTranslations({ locale: locale === "en" ? "en" : "ar", namespace: "order" });
  return { title: t("metaTitle", { ref }), robots: { index: false, follow: false } };
}

export default async function OrderPage({ params, searchParams }: Props) {
  const { locale: raw, ref } = await params;
  const { new: isNew } = await searchParams;
  const locale = routing.locales.includes(raw as "ar" | "en") ? (raw as "ar" | "en") : "ar";
  setRequestLocale(locale);

  if (!/^PC-[A-Z0-9]{4,12}$/.test(ref)) notFound();
  const order = await prisma.order.findUnique({ where: { ref }, include: { items: true } });
  if (!order) notFound();

  const [t, ts, tps, tpm, format, settings] = await Promise.all([
    getTranslations("order"),
    getTranslations("statuses"),
    getTranslations("paymentStatuses"),
    getTranslations("paymentMethods"),
    getFormatter(),
    getSettings(),
  ]);
  const m = (n: number) => formatMoney(n, locale);
  const needsTransfer = order.paymentMethod !== "COD" && order.status !== "CANCELLED";
  const canUpload = needsTransfer && (order.paymentStatus === "PENDING" || order.paymentStatus === "FAILED");
  const wa = waLink(settings.whatsappNumber, buildOrderMessage(order));

  return (
    <section className="py-12 sm:py-20">
      <div className="container-x grid max-w-[760px] gap-6">
        <div className="rounded-[22px] border border-line bg-card p-6 text-center sm:p-10">
          <div className="mx-auto mb-5 grid size-[76px] place-items-center rounded-full bg-gold text-ink">
            <CircleCheck className="size-10" strokeWidth={2} aria-hidden />
          </div>
          <h1 className="font-display text-[1.8rem] font-semibold">{t("okTitle")}</h1>
          {isNew && <p className="mx-auto mt-2 max-w-[32rem] text-ink-soft">{t("okText")}</p>}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm text-ink-soft">{t("ref")}</span>
            <span
              dir="ltr"
              data-testid="order-ref"
              className="rounded-full border-[1.5px] border-dashed border-gold px-5 py-1 font-extrabold tracking-wider"
            >
              {order.ref}
            </span>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonVariants()}>
              {t("sendWa")}
            </a>
            <Link href="/" className={buttonVariants({ variant: "outline" })}>
              {t("continue")}
            </Link>
          </div>
        </div>

        {needsTransfer && (
          <div className="rounded-[22px] border-[1.5px] border-gold/50 bg-gold/10 p-6 sm:p-8">
            <h2 className="mb-3 font-display text-[1.5rem] font-semibold">{t("payTitle")}</h2>
            {order.paymentStatus === "PAID" ? (
              <p className="font-semibold text-success">{t("payPaid")}</p>
            ) : order.paymentStatus === "AWAITING_VERIFICATION" ? (
              <p className="flex items-center gap-2 font-semibold text-gold-text">
                <Clock className="size-5" aria-hidden /> {t("payWaiting")}
              </p>
            ) : null}
            {canUpload && (
              <>
                <p>
                  {order.paymentMethod === "INSTAPAY"
                    ? t("payInstapay", { amount: m(order.total) })
                    : t("payVodafone", { amount: m(order.total) })}
                </p>
                <div className="my-4 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-gold bg-card px-4 py-3">
                  <strong dir="ltr" className="text-lg tracking-wide">
                    {order.paymentMethod === "INSTAPAY" ? settings.instapayHandle : settings.vodafoneCashNumber}
                  </strong>
                  <CopyButton
                    value={order.paymentMethod === "INSTAPAY" ? settings.instapayHandle : settings.vodafoneCashNumber}
                    label={t("copy")}
                    copiedLabel={t("copied")}
                  />
                </div>
                <p className="mb-5 text-sm text-ink-soft">{t("payAfter")}</p>
                <PaymentProofForm orderRef={order.ref} />
              </>
            )}
          </div>
        )}

        <div className="rounded-[22px] border border-line bg-card p-6 sm:p-8">
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-ink-soft">{t("placed")}</dt>
              <dd className="font-bold">{format.dateTime(order.createdAt, { dateStyle: "medium", timeStyle: "short" })}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">{t("status")}</dt>
              <dd>
                <Badge tone={ORDER_STATUS_TONE[order.status]} data-testid="order-status">
                  {ts(order.status)}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-ink-soft">{t("payment")}</dt>
              <dd className="flex flex-wrap items-center gap-2">
                <span className="font-bold">{tpm(order.paymentMethod)}</span>
                <Badge tone={PAYMENT_STATUS_TONE[order.paymentStatus]}>{tps(order.paymentStatus)}</Badge>
              </dd>
            </div>
          </dl>

          <h2 className="mt-7 mb-3 font-bold">{t("items")}</h2>
          <ul className="divide-y divide-line">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4 py-2.5">
                <span>
                  {locale === "ar" ? i.nameAr : i.nameEn} · {i.size} ml × {i.quantity}
                </span>
                <span className="font-bold">{m(i.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <OrderTotals order={order} locale={locale} />
        </div>
      </div>
    </section>
  );
}

async function OrderTotals({
  order,
  locale,
}: {
  order: { subtotal: number; discount: number; shipping: number; total: number; couponCode: string | null };
  locale: string;
}) {
  const t = await getTranslations("checkout");
  const m = (n: number) => formatMoney(n, locale);
  return (
    <dl className="mt-4 grid gap-2 border-t border-line pt-4 text-[.95rem]">
      <div className="flex justify-between">
        <dt>{t("subtotal")}</dt>
        <dd>{m(order.subtotal)}</dd>
      </div>
      {order.discount > 0 && (
        <div className="flex justify-between font-bold text-gold-text">
          <dt>
            {t("discount")} ({order.couponCode})
          </dt>
          <dd>− {m(order.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt>{t("shipping")}</dt>
        <dd>{order.shipping ? m(order.shipping) : t("free")}</dd>
      </div>
      <div className="flex justify-between border-t border-line pt-3 text-lg font-extrabold">
        <dt>{t("total")}</dt>
        <dd>{m(order.total)}</dd>
      </div>
    </dl>
  );
}
