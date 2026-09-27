"use client";

import { useLocale, useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { Bottle } from "@/components/shop/bottle";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { CATEGORIES } from "@/lib/catalog";
import { saveProduct, type FormState } from "@/server/actions/admin";
import { FormMessage, SubmitButton } from "./form-bits";
import { Panel } from "./page-header";

export type ProductFormValues = {
  id?: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  notesAr: string[];
  notesEn: string[];
  descriptionAr: string | null;
  descriptionEn: string | null;
  category: (typeof CATEGORIES)[number];
  color: string;
  shape: number;
  price50: number;
  price100: number;
  salePercent: number;
  stock50: number;
  stock100: number;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  imageUrl: string | null;
};

const initial: FormState = { status: "idle" };

export function ProductForm({ values }: { values: ProductFormValues }) {
  const t = useTranslations("admin.products");
  const ta = useTranslations("admin");
  const tc = useTranslations("categories");
  const locale = useLocale();
  const [state, action] = useActionState(saveProduct, initial);
  const [color, setColor] = useState(values.color);
  const [shape, setShape] = useState(values.shape);
  const bad = (k: string) => (state.fields?.includes(k) ? ta("errValidation") : null);

  return (
    <form action={action} className="grid gap-5 xl:grid-cols-[1fr_320px]" data-testid="product-form">
      <input type="hidden" name="locale" value={locale} />
      {values.id && <input type="hidden" name="id" value={values.id} />}

      <div className="grid content-start gap-5">
        <Panel>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("nameAr")} htmlFor="nameAr" error={bad("nameAr")}>
              <Input id="nameAr" name="nameAr" dir="rtl" defaultValue={values.nameAr} required />
            </Field>
            <Field label={t("nameEn")} htmlFor="nameEn" error={bad("nameEn")}>
              <Input id="nameEn" name="nameEn" dir="ltr" defaultValue={values.nameEn} required />
            </Field>
            <Field label={t("slug")} htmlFor="slug" error={bad("slug")} hint="oud-of-the-night">
              <Input id="slug" name="slug" dir="ltr" defaultValue={values.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" />
            </Field>
            <Field label={t("category")} htmlFor="category">
              <Select id="category" name="category" defaultValue={values.category}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {tc(c)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("notesAr")} htmlFor="notesAr">
              <Input id="notesAr" name="notesAr" dir="rtl" defaultValue={values.notesAr.join("، ")} />
            </Field>
            <Field label={t("notesEn")} htmlFor="notesEn">
              <Input id="notesEn" name="notesEn" dir="ltr" defaultValue={values.notesEn.join(", ")} />
            </Field>
            <Field label={t("descriptionAr")} htmlFor="descriptionAr">
              <Textarea id="descriptionAr" name="descriptionAr" dir="rtl" rows={3} defaultValue={values.descriptionAr ?? ""} />
            </Field>
            <Field label={t("descriptionEn")} htmlFor="descriptionEn">
              <Textarea id="descriptionEn" name="descriptionEn" dir="ltr" rows={3} defaultValue={values.descriptionEn ?? ""} />
            </Field>
          </div>
        </Panel>

        <Panel>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t("price50")} htmlFor="price50" error={bad("price50")}>
              <Input id="price50" name="price50" type="number" min={0} inputMode="numeric" defaultValue={values.price50} required />
            </Field>
            <Field label={t("price100")} htmlFor="price100" error={bad("price100")}>
              <Input id="price100" name="price100" type="number" min={0} inputMode="numeric" defaultValue={values.price100} required />
            </Field>
            <Field label={t("salePercent")} htmlFor="salePercent" error={bad("salePercent")}>
              <Input id="salePercent" name="salePercent" type="number" min={0} max={90} defaultValue={values.salePercent} />
            </Field>
            <Field label={t("stock50")} htmlFor="stock50" error={bad("stock50")}>
              <Input id="stock50" name="stock50" type="number" min={0} defaultValue={values.stock50} />
            </Field>
            <Field label={t("stock100")} htmlFor="stock100" error={bad("stock100")}>
              <Input id="stock100" name="stock100" type="number" min={0} defaultValue={values.stock100} />
            </Field>
            <Field label={t("sortOrder")} htmlFor="sortOrder">
              <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={values.sortOrder} />
            </Field>
          </div>
        </Panel>
      </div>

      <div className="grid content-start gap-5">
        <Panel title={t("preview")}>
          <div
            className="grid aspect-square place-items-center rounded-2xl"
            style={{ background: `radial-gradient(circle at 50% 42%, color-mix(in srgb, ${color} 16%, var(--color-bg)) 0%, var(--color-bg) 72%)` }}
          >
            {values.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- preview of an uploaded image
              <img src={values.imageUrl} alt="" className="w-2/3 object-contain" />
            ) : (
              <Bottle color={color} shape={shape} className="w-1/3" />
            )}
          </div>
          <div className="mt-4 grid gap-4">
            <Field label={t("color")} htmlFor="color" error={bad("color")}>
              <div className="flex items-center gap-2">
                <input
                  id="color"
                  name="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-11 w-14 cursor-pointer rounded-lg border border-line bg-bg"
                />
                <code dir="ltr">{color}</code>
              </div>
            </Field>
            <Field label={t("shape")} htmlFor="shape">
              <Select id="shape" name="shape" value={shape} onChange={(e) => setShape(Number(e.target.value))}>
                {([0, 1, 2, 3] as const).map((s) => (
                  <option key={s} value={s}>
                    {t(`shape${s}`)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("image")} htmlFor="image" hint={t("imageHint")} error={bad("image") ? ta("errUpload") : null}>
              <Input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" />
            </Field>
            {values.imageUrl && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="removeImage" className="size-4 accent-gold" />
                {t("removeImage")}
              </label>
            )}
          </div>
        </Panel>

        <Panel>
          <div className="grid gap-4">
            <Switch name="isActive" label={t("isActive")} defaultChecked={values.isActive} />
            <Switch name="isFeatured" label={t("isFeatured")} defaultChecked={values.isFeatured} />
          </div>
        </Panel>

        <FormMessage state={state} />
        <SubmitButton block pendingText={ta("saving")}>
          {ta("save")}
        </SubmitButton>
      </div>
    </form>
  );
}
