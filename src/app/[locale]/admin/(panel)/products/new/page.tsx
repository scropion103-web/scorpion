import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const t = await getTranslations("admin.products");
  return (
    <>
      <PageHeader title={t("new")} />
      <ProductForm
        values={{
          slug: "",
          nameAr: "",
          nameEn: "",
          notesAr: [],
          notesEn: [],
          descriptionAr: null,
          descriptionEn: null,
          category: "UNISEX",
          color: "#1B1A17",
          shape: 0,
          price50: 0,
          price100: 0,
          salePercent: 0,
          stock50: 0,
          stock100: 0,
          sortOrder: 0,
          isActive: true,
          isFeatured: false,
          imageUrl: null,
        }}
      />
    </>
  );
}
