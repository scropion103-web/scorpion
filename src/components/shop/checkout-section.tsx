"use client";

import { Heart, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { useRouter } from "@/i18n/navigation";
import { PAYMENT_METHODS, type PaymentMethodKey } from "@/lib/catalog";
import { checkoutSchema } from "@/lib/validation";
import { placeOrder } from "@/server/actions/shop";
import { useCart } from "./cart-context";
import { CartLines, CartTotals } from "./cart-lines";
import { Reveal } from "./reveal";
import { SectionHead } from "./section-head";
import { useToast } from "./toast";
import { useApplyCoupon } from "./use-apply-coupon";

type FieldKey = "name" | "phone" | "address";

export function CheckoutSection() {
  const t = useTranslations("checkout");
  const tp = useTranslations("paymentMethods");
  const locale = useLocale();
  const router = useRouter();
  const { lines, coupon, setCoupon, clear } = useCart();
  const { toast } = useToast();
  const { apply, pending: couponPending } = useApplyCoupon();
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");

  const fieldMsg: Record<FieldKey, string> = {
    name: t("fieldName"),
    phone: t("fieldPhone"),
    address: t("fieldAddress"),
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!lines.length) {
      toast(t("emptyToast"));
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const fd = new FormData(e.currentTarget);
    const input = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      address: String(fd.get("address") ?? ""),
      payment: String(fd.get("payment") ?? "COD") as PaymentMethodKey,
      suggestion: String(fd.get("suggestion") ?? ""),
      coupon: coupon?.code ?? "",
      locale: locale === "en" ? ("en" as const) : ("ar" as const),
      items: lines.map((l) => ({ productId: l.productId, size: l.size, qty: l.qty })),
    };

    // client-side validation with the same Zod schema the server uses
    const parsed = checkoutSchema.safeParse(input);
    if (!parsed.success) {
      const next: Partial<Record<FieldKey, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0];
        if (k === "name" || k === "phone" || k === "address") next[k] = fieldMsg[k];
      }
      setErrors(next);
      const first = Object.keys(next)[0];
      if (first) document.getElementById(`f-${first}`)?.focus();
      return;
    }
    setErrors({});

    start(async () => {
      const res = await placeOrder(input);
      if (!res.ok) {
        const msg = {
          validation: t("errValidation"),
          empty: t("errEmpty"),
          unavailable: t("errUnavailable"),
          stock: t("errStock"),
          coupon: t("errCoupon"),
          server: t("errServer"),
        }[res.error];
        setFormError(msg);
        toast(msg);
        return;
      }
      clear();
      router.push(`/order/${res.ref}?new=1`);
    });
  };

  return (
    <section id="checkout" aria-labelledby="checkout-title" className="py-12 sm:py-[clamp(3.5rem,8vw,6.5rem)]">
      <div className="container-x">
        <SectionHead id="checkout-title" eyebrow={t("eyebrow")} title={t("title")} sub={t("sub")} />

        <div className="grid items-start gap-8 lg:grid-cols-[1.25fr_.85fr]">
          {/* ---------- form ---------- */}
          <Reveal className="order-2 lg:order-1">
            <form
              noValidate
              onSubmit={onSubmit}
              data-testid="checkout-form"
              className="rounded-[18px] border border-line bg-card p-4 sm:rounded-[22px] sm:p-[clamp(1.3rem,3vw,2.1rem)]"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("name")} htmlFor="f-name" error={errors.name}>
                  <Input
                    id="f-name"
                    name="name"
                    autoComplete="name"
                    required
                    minLength={3}
                    placeholder={t("namePh")}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "f-name-error" : undefined}
                  />
                </Field>
                <Field label={t("phone")} htmlFor="f-phone" error={errors.phone}>
                  <Input
                    id="f-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    dir="ltr"
                    autoComplete="tel"
                    required
                    placeholder={t("phonePh")}
                    className="text-start rtl:text-right"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "f-phone-error" : undefined}
                  />
                </Field>
                <Field label={t("address")} htmlFor="f-address" error={errors.address} className="sm:col-span-2">
                  <Textarea
                    id="f-address"
                    name="address"
                    rows={3}
                    autoComplete="street-address"
                    required
                    minLength={8}
                    placeholder={t("addressPh")}
                    aria-invalid={Boolean(errors.address)}
                    aria-describedby={errors.address ? "f-address-error" : undefined}
                  />
                </Field>
              </div>

              <fieldset className="mt-6">
                <legend className="text-[.93rem] font-bold">{t("payment")}</legend>
                <div className="mt-2 grid gap-3 sm:grid-cols-3">
                  {PAYMENT_METHODS.map((m, i) => (
                    <label key={m} className="relative block cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value={m}
                        defaultChecked={i === 0}
                        className="peer pointer-events-none absolute inset-0 m-0 opacity-0"
                      />
                      <span className="grid h-full gap-0.5 rounded-[14px] border-[1.5px] border-line bg-bg px-4 py-3.5 transition-[border-color,background,box-shadow] peer-checked:border-gold peer-checked:bg-gold/12 peer-checked:shadow-[0_0_0_3px_rgba(184,137,63,.18)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold">
                        <strong className="text-[.95rem]">{tp(m)}</strong>
                        <small className="text-[.8rem] leading-normal text-ink-soft">{tp(`${m}d`)}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Suggestion to improve the service (optional) */}
              <div className="mt-6 rounded-2xl border-[1.5px] border-gold/50 bg-gold/10 p-4 sm:p-5">
                <h4 className="mb-1 flex flex-wrap items-center gap-2.5 text-[1.08rem] font-extrabold">
                  <label htmlFor="f-suggestion" className="inline-flex items-center gap-2">
                    <Heart className="size-[22px] text-gold-text" aria-hidden />
                    {t("sugTitle")}
                  </label>
                  <span className="rounded-full bg-ink px-2.5 text-xs font-bold text-bg">{t("sugBadge")}</span>
                </h4>
                <p className="mb-3 text-[.9rem] text-ink-soft">{t("sugHint")}</p>
                <Textarea id="f-suggestion" name="suggestion" rows={3} maxLength={1000} placeholder={t("sugPh")} className="bg-card" />
              </div>

              {formError && (
                <p role="alert" className="mt-5 rounded-xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
                  {formError}
                </p>
              )}

              <Button type="submit" block className="mt-6" disabled={pending} data-testid="submit-order">
                {pending ? t("submitting") : t("submit")}
              </Button>
              <p className="mt-3 text-center text-[.86rem] text-ink-soft">{t("note")}</p>
            </form>
          </Reveal>

          {/* ---------- summary ---------- */}
          <Reveal className="order-1 lg:sticky lg:top-[110px] lg:order-2">
            <aside
              aria-labelledby="summary-title"
              className="rounded-[18px] border border-line bg-card p-4 sm:rounded-[22px] sm:p-[clamp(1.3rem,3vw,2.1rem)]"
            >
              <h3 id="summary-title" className="mb-5 font-display text-[1.4rem] font-semibold">
                {t("summary")}
              </h3>
              <CartLines />
              <CartTotals />

              {coupon ? (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-gold px-3 py-2">
                  <span dir="ltr" className="font-extrabold tracking-wider text-gold-text">
                    {coupon.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCoupon(null)}
                    className="inline-flex items-center gap-1 text-sm text-ink-soft underline hover:text-danger"
                  >
                    <X className="size-4" aria-hidden />
                    {t("couponRemove")}
                  </button>
                </div>
              ) : (
                <div className="mt-4 flex gap-2">
                  <Input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        apply(couponInput);
                      }
                    }}
                    dir="ltr"
                    autoComplete="off"
                    placeholder={t("couponPh")}
                    aria-label={t("couponPh")}
                    className="px-3.5 py-2.5 uppercase"
                  />
                  <Button variant="dark" size="sm" disabled={couponPending || !lines.length} onClick={() => apply(couponInput)}>
                    {t("couponApply")}
                  </Button>
                </div>
              )}
            </aside>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
