"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Pencil, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { saveCoupon, type FormState } from "@/server/actions/admin";
import { FormMessage, SubmitButton } from "./form-bits";

export type CouponValues = {
  id?: string;
  code: string;
  percent: number;
  minSubtotal: number;
  maxUses: number | null;
  expiresAt: string | null; // yyyy-MM-dd
  isActive: boolean;
};

const initial: FormState = { status: "idle" };

function CouponFields({ values, onDone }: { values: CouponValues; onDone?: () => void }) {
  const t = useTranslations("admin.coupons");
  const ta = useTranslations("admin");
  const [state, action] = useActionState(async (prev: FormState, fd: FormData) => {
    const res = await saveCoupon(prev, fd);
    if (res.status === "ok") onDone?.();
    return res;
  }, initial);
  const bad = (k: string) => (state.fields?.includes(k) ? ta("errValidation") : null);
  const suffix = values.id ?? "new";

  return (
    <form action={action} className="grid gap-4">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("code")} htmlFor={`code-${suffix}`} error={bad("code")}>
          <Input id={`code-${suffix}`} name="code" dir="ltr" defaultValue={values.code} required className="uppercase" />
        </Field>
        <Field label={t("percent")} htmlFor={`percent-${suffix}`} error={bad("percent")}>
          <Input id={`percent-${suffix}`} name="percent" type="number" min={1} max={90} defaultValue={values.percent} required />
        </Field>
        <Field label={t("minSubtotal")} htmlFor={`min-${suffix}`}>
          <Input id={`min-${suffix}`} name="minSubtotal" type="number" min={0} defaultValue={values.minSubtotal} />
        </Field>
        <Field label={t("maxUses")} htmlFor={`max-${suffix}`} hint={t("unlimited")} error={bad("maxUses")}>
          <Input id={`max-${suffix}`} name="maxUses" type="number" min={1} defaultValue={values.maxUses ?? ""} />
        </Field>
        <Field label={t("expiresAt")} htmlFor={`exp-${suffix}`} hint={t("never")}>
          <Input id={`exp-${suffix}`} name="expiresAt" type="date" defaultValue={values.expiresAt ?? ""} />
        </Field>
        <div className="flex items-end pb-2">
          <Switch id={`active-${suffix}`} name="isActive" label={t("isActive")} defaultChecked={values.isActive} />
        </div>
      </div>
      <FormMessage state={state} />
      <div>
        <SubmitButton size="sm" pendingText={ta("saving")}>
          {ta("save")}
        </SubmitButton>
      </div>
    </form>
  );
}

export function NewCouponForm() {
  return (
    <CouponFields
      values={{ code: "", percent: 10, minSubtotal: 0, maxUses: null, expiresAt: null, isActive: true }}
    />
  );
}

export function EditCouponDialog({ values }: { values: CouponValues }) {
  const t = useTranslations("admin");
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={(o: boolean) => setOpen(o)}>
      <Dialog.Trigger className={buttonVariants({ variant: "outline", size: "xs" })}>
        <Pencil className="size-3.5" aria-hidden />
        {t("edit")}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[80] bg-ink/50 transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-[90] w-[min(560px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-line bg-card p-6 shadow-card transition-[opacity,transform] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-bold" dir="ltr">
              {values.code}
            </Dialog.Title>
            <Dialog.Close aria-label={t("cancel")} className="grid size-9 place-items-center rounded-full hover:bg-ink/5">
              <X className="size-5" aria-hidden />
            </Dialog.Close>
          </div>
          <CouponFields values={values} onDone={() => setOpen(false)} />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
