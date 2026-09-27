import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { prisma } from "@/lib/prisma";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [t, product] = await Promise.all([
    getTranslations("admin.products"),
    prisma.product.findUnique({ where: { id } }),
  ]);
  if (!product) notFound();

  return (
    <>
      <PageHeader title={`${t("editTitle")} · ${product.nameAr}`} />
      <ProductForm values={product} />
    </>
  );
}
