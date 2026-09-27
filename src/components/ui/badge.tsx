import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap", {
  variants: {
    tone: {
      neutral: "bg-ink/8 text-ink",
      gold: "bg-gold text-ink",
      dark: "bg-ink text-bg",
      success: "bg-success/15 text-success",
      warning: "bg-gold/20 text-gold-text",
      danger: "bg-danger/12 text-danger",
      info: "bg-sky-700/12 text-sky-800",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export function Badge({ className, tone, ...props }: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export const ORDER_STATUS_TONE = {
  PENDING: "warning",
  CONFIRMED: "info",
  PROCESSING: "info",
  SHIPPED: "dark",
  DELIVERED: "success",
  CANCELLED: "danger",
} as const;

export const PAYMENT_STATUS_TONE = {
  PENDING: "neutral",
  AWAITING_VERIFICATION: "warning",
  PAID: "success",
  FAILED: "danger",
  REFUNDED: "neutral",
} as const;
