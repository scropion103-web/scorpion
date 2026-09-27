import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <main className="grid min-h-[70dvh] place-items-center px-4 py-20 text-center">
      <div>
        <p className="font-display text-7xl font-bold text-gold">404</p>
        <h1 className="mt-3 text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-ink-soft">{t("text")}</p>
        <Link href="/" className={buttonVariants({ className: "mt-7" })}>
          {t("back")}
        </Link>
      </div>
    </main>
  );
}
