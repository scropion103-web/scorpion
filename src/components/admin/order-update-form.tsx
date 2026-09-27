"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { Field, Select, Textarea } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { ORDER_STATUSES, PAYMENT_STATUSES, type OrderStatusKey, type PaymentStatusKey } from "@/lib/catalog";
import { updateOrder, type FormState } from "@/server/actions/admin";
import { FormMessage, SubmitButton } from "./form-bits";

const initial: FormState = { status: "idle" };

export function OrderUpdateForm({
  id,
  status,
  paymentStatus,
  adminNotes,
}: {
  id: string;
  status: OrderStatusKey;
  paymentStatus: PaymentStatusKey;
  adminNotes: string | null;
}) {
  const t = useTranslations("admin.orders");
  const ta = useTranslations("admin");
  const ts = useTranslations("statuses");
  const tps = useTranslations("paymentStatuses");
  const [state, action] = useActionState(updateOrder, initial);

  return (
    <form action={action} className="grid gap-4" data-testid="order-update-form">
      <input type="hidden" name="id" value={id} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("status")} htmlFor="status">
          <Select id="status" name="status" defaultValue={status}>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ts(s)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("paymentStatus")} htmlFor="paymentStatus">
          <Select id="paymentStatus" name="paymentStatus" defaultValue={paymentStatus}>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {tps(s)}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label={t("notes")} htmlFor="adminNotes">
        <Textarea id="adminNotes" name="adminNotes" defaultValue={adminNotes ?? ""} rows={3} maxLength={2000} />
      </Field>
      <Switch name="notifyCustomer" label={t("notify")} />
      <FormMessage state={state} />
      <div>
        <SubmitButton pendingText={ta("saving")}>{t("update")}</SubmitButton>
      </div>
    </form>
  );
}
