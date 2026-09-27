"use client";

import { LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { FormState } from "@/server/actions/admin";

export function SubmitButton({ children, pendingText, ...props }: ButtonProps & { pendingText?: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button {...props} type="submit" disabled={pending || props.disabled}>
      {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
      {pending && pendingText ? pendingText : children}
    </Button>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  const t = useTranslations("admin");
  if (state.status === "idle") return null;
  if (state.status === "ok")
    return (
      <p role="status" className="rounded-xl bg-success/12 px-4 py-2.5 text-sm font-semibold text-success">
        {t("saved")}
      </p>
    );
  const msg =
    state.error === "duplicate"
      ? t("errDuplicate")
      : state.error === "validation"
        ? t("errValidation")
        : state.error === "upload" || state.error === "type" || state.error === "size"
          ? t("errUpload")
          : t("errGeneric");
  return (
    <p role="alert" className="rounded-xl bg-danger/10 px-4 py-2.5 text-sm font-semibold text-danger">
      {msg}
    </p>
  );
}

/** A small form that posts to a Server Action after a confirm() prompt */
export function ConfirmForm({
  action,
  id,
  message,
  children,
  className,
}: {
  action: (fd: FormData) => Promise<void>;
  id: string;
  message: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      {children}
    </form>
  );
}
