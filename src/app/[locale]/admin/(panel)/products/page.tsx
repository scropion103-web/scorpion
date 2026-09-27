import { Plus } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ConfirmForm } from "@/components/admin/form-bits";
import { PageHeader } from "@/components/admin/page-header";
import { Bottle } from "@/components/shop/bottle";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";
import { deleteProduct, toggleProduct } from "@/server/actions/admin";
import { auth } from "@/auth";

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [t, ta, tc, products, session] = await Promise.all([
    getTranslations("admin.products"),
    getTranslations("admin"),
    getTranslations("categories"),
    prisma.product.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    auth(),
  ]);
  const isAdmin = session?.user.role === "ADMIN";

  return (
    <>
      <PageHeader
        title={t("title")}
        actions={
          <Link href="/admin/products/new" className={buttonVariants({ size: "sm" })}>
            <Plus className="size-4" aria-hidden />
            {t("new")}
          </Link>
        }
      />
      <div className="overflow-x-auto rounded-[18px] border border-line bg-card">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-ink/4 text-ink-soft">
            <tr>
              {[t("name"), t("category"), t("price"), t("stock"), t("active"), ta("actions")].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 text-start font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => {
              const low = p.stock50 < 5 || p.stock100 < 5;
              return (
                <tr key={p.id} className="hover:bg-gold/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-bg">
                        {p.imageUrl ? (
                          <Image src={p.imageUrl} alt="" width={40} height={40} unoptimized className="size-10 object-contain" />
                        ) : (
                          <Bottle color={p.color} shape={p.shape} className="w-6" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold">{locale === "ar" ? p.nameAr : p.nameEn}</div>
                        <div className="text-xs text-ink-soft" dir="ltr">
                          {p.slug}
                        </div>
                      </div>
                      {p.isFeatured && <Badge tone="gold">{t("featured")}</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3">{tc(p.category)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    50: {formatMoney(p.price50, locale)}
                    <br />
                    100: {formatMoney(p.price100, locale)}
                    {p.salePercent > 0 && (
                      <Badge tone="gold" className="ms-2">
                        −{p.salePercent}%
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    50: {p.stock50} · 100: {p.stock100}
                    {low && (
                      <Badge tone="danger" className="ms-2">
                        {t("lowStock")}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={p.isActive ? "success" : "neutral"}>{p.isActive ? t("active") : t("hidden")}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/admin/products/${p.id}`} className={buttonVariants({ variant: "outline", size: "xs" })}>
                        {ta("edit")}
                      </Link>
                      <form action={toggleProduct}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className={buttonVariants({ variant: "ghost", size: "xs" })}>
                          {p.isActive ? t("hide") : t("show")}
                        </button>
                      </form>
                      {isAdmin && (
                        <ConfirmForm action={deleteProduct} id={p.id} message={ta("confirmDelete")}>
                          <button type="submit" className={buttonVariants({ variant: "danger", size: "xs" })}>
                            {ta("delete")}
                          </button>
                        </ConfirmForm>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center text-ink-soft">
                  {t("empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
