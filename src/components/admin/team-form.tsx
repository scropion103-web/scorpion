"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { Field, Input, Select } from "@/components/ui/field";
import { createUser, type FormState } from "@/server/actions/admin";
import { FormMessage, SubmitButton } from "./form-bits";

const initial: FormState = { status: "idle" };

export function TeamForm() {
  const t = useTranslations("admin.team");
  const ta = useTranslations("admin");
  const [state, action] = useActionState(createUser, initial);
  const bad = (k: string) => (state.fields?.includes(k) ? ta("errValidation") : null);
  return (
    <form action={action} className="grid gap-4">
      <Field label={t("name")} htmlFor="u-name" error={bad("name")}>
        <Input id="u-name" name="name" required />
      </Field>
      <Field label={ta("email")} htmlFor="u-email" error={bad("email")}>
        <Input id="u-email" name="email" type="email" dir="ltr" required />
      </Field>
      <Field label={ta("password")} htmlFor="u-password" hint={t("passwordHint")} error={bad("password")}>
        <Input id="u-password" name="password" type="password" dir="ltr" minLength={8} required autoComplete="new-password" />
      </Field>
      <Field label={t("role")} htmlFor="u-role">
        <Select id="u-role" name="role" defaultValue="STAFF">
          <option value="STAFF">{t("STAFF")}</option>
          <option value="ADMIN">{t("ADMIN")}</option>
        </Select>
      </Field>
      <FormMessage state={state} />
      <div>
        <SubmitButton size="sm" pendingText={ta("saving")}>
          {t("new")}
        </SubmitButton>
      </div>
    </form>
  );
}
