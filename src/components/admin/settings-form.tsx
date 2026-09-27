"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { Field, Input } from "@/components/ui/field";
import { saveSettings, type FormState } from "@/server/actions/admin";
import { FormMessage, SubmitButton } from "./form-bits";
import { Panel } from "./page-header";

export type SettingsValues = {
  shippingFee: number;
  freeShippingFrom: number;
  whatsappNumber: string;
  phoneDisplay: string;
  instapayHandle: string;
  vodafoneCashNumber: string;
  featuredCoupon: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
};

const initial: FormState = { status: "idle" };

export function SettingsForm({ values }: { values: SettingsValues }) {
  const t = useTranslations("admin.settings");
  const ta = useTranslations("admin");
  const [state, action] = useActionState(saveSettings, initial);
  const bad = (k: string) => (state.fields?.includes(k) ? ta("errValidation") : null);

  const input = (name: keyof SettingsValues, opts: { type?: string; dir?: "ltr" | "rtl" } = {}) => (
    <Field label={t(name)} htmlFor={name} error={bad(name)}>
      <Input id={name} name={name} type={opts.type ?? "text"} dir={opts.dir ?? "ltr"} defaultValue={values[name] ?? ""} />
    </Field>
  );

  return (
    <form action={action} className="grid gap-5 lg:grid-cols-2">
      <Panel title={t("shipping")}>
        <div className="grid gap-4 sm:grid-cols-2">
          {input("shippingFee", { type: "number" })}
          {input("freeShippingFrom", { type: "number" })}
        </div>
      </Panel>
      <Panel title={t("payments")}>
        <div className="grid gap-4 sm:grid-cols-2">
          {input("instapayHandle")}
          {input("vodafoneCashNumber", { type: "tel" })}
        </div>
      </Panel>
      <Panel title={t("contact")}>
        <div className="grid gap-4 sm:grid-cols-2">
          {input("whatsappNumber", { type: "tel" })}
          {input("phoneDisplay")}
        </div>
      </Panel>
      <Panel title={t("offers")}>{input("featuredCoupon")}</Panel>
      <Panel title={t("social")} className="lg:col-span-2">
        <div className="grid gap-4 md:grid-cols-3">
          {input("instagramUrl", { type: "url" })}
          {input("facebookUrl", { type: "url" })}
          {input("tiktokUrl", { type: "url" })}
        </div>
      </Panel>
      <div className="flex flex-wrap items-center gap-4 lg:col-span-2">
        <SubmitButton pendingText={ta("saving")}>{ta("save")}</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
