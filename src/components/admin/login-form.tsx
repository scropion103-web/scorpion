"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { Field, Input } from "@/components/ui/field";
import { loginAction, type FormState } from "@/server/actions/admin";
import { SubmitButton } from "./form-bits";

const initial: FormState = { status: "idle" };

export function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations("admin");
  const [state, action] = useActionState(loginAction, initial);
  return (
    <form action={action} className="grid gap-4" data-testid="login-form">
      <input type="hidden" name="locale" value={locale} />
      <Field label={t("email")} htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="username" required dir="ltr" />
      </Field>
      <Field label={t("password")} htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required dir="ltr" />
      </Field>
      {state.status === "error" && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-2.5 text-sm font-semibold text-danger">
          {t("loginError")}
        </p>
      )}
      <SubmitButton block pendingText={t("loggingIn")}>
        {t("login")}
      </SubmitButton>
    </form>
  );
}
