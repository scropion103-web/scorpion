"use client";

import { useTranslations } from "next-intl";
import { useCallback, useTransition } from "react";
import { checkCoupon } from "@/server/actions/shop";
import { useCart } from "./cart-context";
import { useToast } from "./toast";

/** Validates a discount code on the server and stores it in the cart */
export function useApplyCoupon() {
  const t = useTranslations("checkout");
  const { totals, setCoupon } = useCart();
  const { toast } = useToast();
  const [pending, start] = useTransition();

  const apply = useCallback(
    (raw: string, onSuccess?: () => void) => {
      const code = raw.trim().toUpperCase();
      if (!code) return;
      start(async () => {
        const res = await checkCoupon(code, totals.subtotal);
        if (res.ok) {
          setCoupon({ code: res.code, percent: res.percent });
          toast(t("couponOk"));
          onSuccess?.();
        } else {
          toast(res.error === "min" ? t("couponMin") : t("couponBad"));
        }
      });
    },
    [setCoupon, t, toast, totals.subtotal],
  );

  return { apply, pending };
}
