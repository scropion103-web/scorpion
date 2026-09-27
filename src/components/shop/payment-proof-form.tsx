"use client";

import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { submitPaymentProof, type ProofState } from "@/server/actions/shop";

const initial: ProofState = { status: "idle" };

export function PaymentProofForm({ orderRef }: { orderRef: string }) {
  const t = useTranslations("order");
  const [state, action, pending] = useActionState(submitPaymentProof, initial);

  if (state.status === "ok") {
    return (
      <p role="status" className="rounded-xl bg-success/12 px-4 py-3 font-semibold text-success">
        {t("payDone")}
      </p>
    );
  }

  return (
    <form action={action} className="grid gap-4" data-testid="proof-form">
      <input type="hidden" name="ref" value={orderRef} />
      <Field label={t("payProof")} htmlFor="proof" hint={t("payProofHint")}>
        <Input
          id="proof"
          name="proof"
          type="file"
          required
          accept="image/jpeg,image/png,image/webp"
          className="file:me-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-1.5 file:font-bold file:text-bg"
        />
      </Field>
      <Field label={t("payRef")} htmlFor="reference">
        <Input id="reference" name="reference" dir="ltr" inputMode="numeric" placeholder={t("payRefPh")} maxLength={80} />
      </Field>
      {state.status === "error" && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
          {t("payErr")}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        <Upload className="size-4" aria-hidden />
        {pending ? t("payUploading") : t("paySubmit")}
      </Button>
    </form>
  );
}
