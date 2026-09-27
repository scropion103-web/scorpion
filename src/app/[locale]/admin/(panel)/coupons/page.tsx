import { format } from "date-fns";
import { getFormatter, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { EditCouponDialog, NewCouponForm } from "@/components/admin/coupon-form";
import { ConfirmForm } from "@/components/admin/form-bits";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";
import { deleteCoupon } from "@/server/actions/admin";

export default async function CouponsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [t, ta, fmt, coupons, session] = await Promise.all([
    getTranslations("admin.coupons"),
    getTranslations("admin"),
    getFormatter(),
    prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }),
    auth(),
  ]);

  return (
    <>
      <PageHeader title={t("title")} />
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <div className="overflow-x-auto rounded-[18px] border border-line bg-card">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-ink/4 text-ink-soft">
              <tr>
                {[t("code"), t("percent"), t("minSubtotal"), t("used"), t("expiresAt"), t("isActive"), ta("actions")].map(
                  (h) => (
                    <th key={h} scope="col" className="px-4 py-3 text-start font-semibold">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-extrabold tracking-wider" dir="ltr">
                    {c.code}
                  </td>
                  <td className="px-4 py-3">{c.percent}%</td>
                  <td className="px-4 py-3">{c.minSubtotal ? formatMoney(c.minSubtotal, locale) : ta("none")}</td>
                  <td className="px-4 py-3">
                    {c.usedCount} / {c.maxUses ?? "∞"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {c.expiresAt ? fmt.dateTime(c.expiresAt, { dateStyle: "medium" }) : t("never")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={c.isActive ? "success" : "neutral"}>{c.isActive ? ta("yes") : ta("no")}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <EditCouponDialog
                        values={{
                          id: c.id,
                          code: c.code,
                          percent: c.percent,
                          minSubtotal: c.minSubtotal,
                          maxUses: c.maxUses,
                          expiresAt: c.expiresAt ? format(c.expiresAt, "yyyy-MM-dd") : null,
                          isActive: c.isActive,
                        }}
                      />
                      {session?.user.role === "ADMIN" && (
                        <ConfirmForm action={deleteCoupon} id={c.id} message={ta("confirmDelete")}>
                          <button type="submit" className={buttonVariants({ variant: "danger", size: "xs" })}>
                            {ta("delete")}
                          </button>
                        </ConfirmForm>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center text-ink-soft">
                    {t("empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Panel title={t("new")}>
          <NewCouponForm />
        </Panel>
      </div>
    </>
  );
}
